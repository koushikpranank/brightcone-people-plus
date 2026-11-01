//! Explicit opt-in database tests. Every mutation is confined to brightcone_schema_*.
use brightcone_people_plus::{
    models::{self, Snapshot},
    schema,
};
use sea_orm::{
    ConnectOptions, ConnectionTrait, Database, DatabaseConnection, DbBackend, Statement,
};
use serde_json::json;
use std::collections::BTreeMap;

async fn database(key: &str) -> DatabaseConnection {
    let mut options =
        ConnectOptions::new(std::env::var(key).expect("Set an isolated schema test database URL"));
    options.sqlx_logging(false);
    let db = Database::connect(options).await.unwrap();
    let name = db
        .query_one_raw(Statement::from_string(
            DbBackend::Postgres,
            "SELECT current_database() AS name",
        ))
        .await
        .unwrap()
        .unwrap()
        .try_get::<String>("", "name")
        .unwrap();
    assert!(
        name.starts_with("brightcone_schema_"),
        "Schema tests require an isolated brightcone_schema_* database"
    );
    db
}
async fn sql(db: &DatabaseConnection, text: &str) {
    db.execute_unprepared(text).await.unwrap();
}
async fn value(db: &DatabaseConnection, text: &str) -> i64 {
    db.query_one_raw(Statement::from_string(DbBackend::Postgres, text))
        .await
        .unwrap()
        .unwrap()
        .try_get("", "value")
        .unwrap()
}
async fn fingerprints(db: &DatabaseConnection) -> BTreeMap<String, (i64, String)> {
    let mut result = BTreeMap::new();
    for table in schema::TABLES.iter() {
        let name = format!("\"{}\".\"{}\"", table.schema, table.name);
        let row=db.query_one_raw(Statement::from_string(DbBackend::Postgres,format!("SELECT count(*)::bigint AS count, md5(coalesce(string_agg(md5(to_jsonb(__bc_row)::text),'' ORDER BY md5(to_jsonb(__bc_row)::text)),'')) AS hash FROM {name} __bc_row"))).await.unwrap().unwrap();
        result.insert(
            name,
            (
                row.try_get("", "count").unwrap(),
                row.try_get("", "hash").unwrap(),
            ),
        );
    }
    result
}

#[tokio::test]
#[ignore = "requires an empty isolated PostgreSQL 16 database"]
async fn schema_sync_contract() {
    let db = database("SCHEMA_TEST_DATABASE_URL").await;
    schema::run_autonomous_sync(&db).await.unwrap();
    schema::verify(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await.len(), 113);
    assert_eq!(value(&db,"SELECT count(*)::bigint AS value FROM pg_views WHERE schemaname='public' AND viewname IN ('audit_demo','audit_live')").await,2);
    assert_eq!(value(&db,"SELECT count(*)::bigint AS value FROM pg_tables WHERE schemaname='public' AND tablename IN ('seaql_migrations','_sqlx_migrations')").await,0);
    sql(&db,"INSERT INTO demo.company(id,record) VALUES ('preserved','{\"name\":\"Preserved company\"}')").await;
    sql(&db,"INSERT INTO demo.employees(id,record) VALUES ('SCHEMA-EMP','{\"name\":\"Preserved employee\",\"phone\":\"12345\",\"ctc\":1200000}')").await;
    let before = fingerprints(&db).await;
    let (one, two) = tokio::join!(
        schema::run_autonomous_sync(&db),
        schema::run_autonomous_sync(&db)
    );
    one.unwrap();
    two.unwrap();
    assert_eq!(
        fingerprints(&db).await,
        before,
        "Repeated/concurrent startup must not rewrite records"
    );

    // Missing generated columns/indexes/constraints are repaired, even when
    // PostgreSQL appends the repaired column at a different physical position.
    sql(&db,"ALTER TABLE demo.employees DROP COLUMN phone; DROP INDEX demo.employees_dept; ALTER TABLE demo.company DROP CONSTRAINT company_record_check").await;
    assert!(schema::verify(&db).await.is_err());
    schema::run_autonomous_sync(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, before);
    sql(&db,"ALTER TABLE demo.company ADD COLUMN customer_note text; UPDATE demo.company SET customer_note='keep this' WHERE id='preserved'").await;
    let extended = fingerprints(&db).await;
    schema::run_autonomous_sync(&db).await.unwrap();
    assert_eq!(
        fingerprints(&db).await,
        extended,
        "Unknown extra fields must be retained"
    );

    // Repair an early table, then encounter a later mismatch: the earlier DDL
    // must also roll back and the original record values must survive.
    sql(&db,"ALTER TABLE demo.accounts DROP COLUMN email; ALTER TABLE demo.company ALTER COLUMN id TYPE varchar(50)").await;
    let error = schema::run_autonomous_sync(&db).await.unwrap_err();
    assert!(error.contains("DBA review required"));
    assert_eq!(value(&db,"SELECT count(*)::bigint AS value FROM information_schema.columns WHERE table_schema='demo' AND table_name='accounts' AND column_name='email'").await,0);
    sql(&db, "ALTER TABLE demo.company ALTER COLUMN id TYPE text").await;
    schema::run_autonomous_sync(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, extended);

    for (change,restore) in [
        ("ALTER TABLE demo.company ALTER COLUMN position SET DEFAULT 99","ALTER TABLE demo.company ALTER COLUMN position SET DEFAULT 0"),
        ("ALTER TABLE demo.company ALTER COLUMN record DROP NOT NULL","ALTER TABLE demo.company ALTER COLUMN record SET NOT NULL"),
        ("DROP INDEX demo.employees_dept; CREATE INDEX employees_dept ON demo.employees(status)","DROP INDEX demo.employees_dept"),
        ("ALTER TABLE demo.company DROP CONSTRAINT company_record_check; ALTER TABLE demo.company ADD CONSTRAINT company_record_check CHECK(record IS NOT NULL)","ALTER TABLE demo.company DROP CONSTRAINT company_record_check"),
    ] {
        sql(&db,change).await;
        assert!(schema::run_autonomous_sync(&db).await.is_err(),"Must reject incompatible existing definitions");
        sql(&db,restore).await;
        schema::run_autonomous_sync(&db).await.unwrap();
    }

    // Seed and then append through the application's real persistence path.
    // Old events remain in PostgreSQL after the 500-event UI window is exceeded.
    let mut connection = db.get_postgres_connection_pool().acquire().await.unwrap();
    let old = Snapshot::empty();
    let mut next = old.clone();
    next.demo["audit"] = json!((0..501)
        .map(|n| json!({"t":n.to_string(),"who":"Schema test","a":"Original event"}))
        .collect::<Vec<_>>());
    next.live["audit"] = json!((0..501)
        .map(|n| json!({"t":n.to_string(),"by":"Schema test","a":"Original event"}))
        .collect::<Vec<_>>());
    models::persist(&mut connection, &old, &next).await.unwrap();
    let old = models::load(&mut connection).await.unwrap();
    assert_eq!(old.demo["audit"].as_array().unwrap().len(), 500);
    assert_eq!(old.live["audit"].as_array().unwrap().len(), 500);
    let mut next = old.clone();
    brightcone_people_plus::services::auth::demo_audit(&mut next, "Schema test", "New event");
    next.audit("Schema test", "New event");
    models::persist(&mut connection, &old, &next).await.unwrap();
    assert_eq!(
        value(&db, "SELECT count(*)::bigint AS value FROM demo.audit").await,
        502
    );
    assert_eq!(
        value(&db, "SELECT count(*)::bigint AS value FROM live.audit").await,
        502
    );
    let reread = models::load(&mut connection).await.unwrap();
    assert_eq!(reread.demo["audit"][0]["a"], "New event");
    assert_eq!(reread.live["audit"][0]["a"], "New event");
    drop(connection);

    sql(&db,"INSERT INTO public.money_runs(id,request_id,kind,period,policy_revision,record,created_by) VALUES(gen_random_uuid(),'schema-contract','payroll','2026-11',1,'{}','Schema test'); INSERT INTO public.money_policy_history(revision,record,created_by) VALUES(1,'{}','Schema test')").await;
    for table in [
        "demo.audit",
        "live.audit",
        "public.money_runs",
        "public.money_policy_history",
    ] {
        for operation in [
            format!("UPDATE {table} SET record=record"),
            format!("DELETE FROM {table}"),
            format!("TRUNCATE {table}"),
        ] {
            assert!(
                db.execute_unprepared(&operation).await.is_err(),
                "Audit and money history must reject mutation"
            );
        }
    }
    let before = fingerprints(&db).await;
    schema::run_autonomous_sync(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, before);
}

#[tokio::test]
#[ignore = "requires a restored isolated copy of the existing HR database"]
async fn adopts_existing_schema_without_data_loss() {
    let db = database("SCHEMA_UPGRADE_DATABASE_URL").await;
    let before = fingerprints(&db).await;
    assert!(before["\"demo\".\"employees\""].0 >= 16);
    assert_eq!(before["\"public\".\"money_runs\""].0, 2);
    sql(
        &db,
        "CREATE TABLE IF NOT EXISTS public._sqlx_migrations(version bigint PRIMARY KEY)",
    )
    .await;
    schema::run_autonomous_sync(&db).await.unwrap();
    schema::verify(&db).await.unwrap();
    assert_eq!(
        fingerprints(&db).await,
        before,
        "Every existing record and account hash must remain unchanged"
    );
    assert_eq!(value(&db,"SELECT count(*)::bigint AS value FROM pg_tables WHERE schemaname='public' AND tablename IN ('seaql_migrations','_sqlx_migrations')").await,0);
    schema::run_autonomous_sync(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, before);
}
