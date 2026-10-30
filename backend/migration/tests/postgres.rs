//! Run only against the three explicitly configured, isolated test databases.
use migration::{
    sea_orm::{
        ConnectOptions, Database, DatabaseConnection, DbBackend, Statement, TransactionTrait,
    },
    ConnectionTrait, Migrator, MigratorTrait,
};
use std::collections::BTreeMap;

async fn database(key: &str) -> DatabaseConnection {
    let url = std::env::var(key).expect("Set the isolated migration test database URLs");
    let name = url.rsplit('/').next().unwrap();
    assert!(
        name.starts_with("brightcone_seaorm_") && !name.contains('?'),
        "Migration tests require isolated brightcone_seaorm_* databases"
    );
    let mut options = ConnectOptions::new(url);
    options.sqlx_logging(false);
    Database::connect(options).await.unwrap()
}

async fn fingerprints(db: &DatabaseConnection) -> BTreeMap<String, (i64, String)> {
    let schema: serde_json::Value =
        serde_json::from_str(include_str!("../src/schema.json")).unwrap();
    let mut result = BTreeMap::new();
    for table in schema["tables"].as_array().unwrap() {
        let name = format!(
            "\"{}\".\"{}\"",
            table["schema"].as_str().unwrap(),
            table["name"].as_str().unwrap()
        );
        let sql=format!("SELECT count(*)::bigint AS count, md5(coalesce(string_agg(md5(row_to_json(__bc_schema_row)::text),'' ORDER BY md5(row_to_json(__bc_schema_row)::text)),'')) AS hash FROM {name} __bc_schema_row");
        let row = db
            .query_one_raw(Statement::from_string(DbBackend::Postgres, sql))
            .await
            .unwrap()
            .unwrap();
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
#[ignore = "requires an empty isolated PostgreSQL 16 test database"]
async fn creates_fresh_schema_and_repeats_without_changes() {
    let db = database("SEAORM_FRESH_DATABASE_URL").await;
    migration::up(&db).await.unwrap();
    migration::verify(&db).await.unwrap();
    let before = fingerprints(&db).await;
    assert_eq!(before.len(), 113);
    migration::up(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, before);
    assert_eq!(
        Migrator::get_applied_migrations(&db).await.unwrap().len(),
        1
    );
    assert!(Migrator::get_pending_migrations(&db)
        .await
        .unwrap()
        .is_empty());
    let rows=db.query_all_raw(Statement::from_string(DbBackend::Postgres,"SELECT viewname FROM pg_views WHERE schemaname='public' AND viewname IN ('audit_demo','audit_live')")).await.unwrap();
    assert_eq!(rows.len(), 2);
    // A deliberate drift is detected without committing it.
    let tx = db.begin().await.unwrap();
    tx.execute_unprepared("ALTER TABLE demo.company ADD COLUMN deliberate_drift text")
        .await
        .unwrap();
    assert!(migration::verify(&tx).await.is_err());
    tx.rollback().await.unwrap();
    migration::verify(&db).await.unwrap();
}

#[tokio::test]
#[ignore = "requires a restored copy of the pre-SeaORM HR database"]
async fn adopts_existing_records_accounts_and_money_history_unchanged() {
    let db = database("SEAORM_UPGRADE_DATABASE_URL").await;
    let before = fingerprints(&db).await;
    assert!(before["\"demo\".\"employees\""].0 >= 16);
    assert_eq!(before["\"public\".\"money_runs\""].0, 2);
    migration::up(&db).await.unwrap();
    migration::verify(&db).await.unwrap();
    assert_eq!(
        fingerprints(&db).await,
        before,
        "Every business row, including password hashes and recorded money, must remain unchanged"
    );
    migration::up(&db).await.unwrap();
    assert_eq!(fingerprints(&db).await, before);
    let old = db
        .query_one_raw(Statement::from_string(
            DbBackend::Postgres,
            "SELECT to_regclass('public._sqlx_migrations')::text AS name",
        ))
        .await
        .unwrap()
        .unwrap();
    assert!(old.try_get::<Option<String>>("", "name").unwrap().is_none());
    assert_eq!(
        Migrator::get_applied_migrations(&db).await.unwrap().len(),
        1
    );
}

#[tokio::test]
#[ignore = "requires an empty isolated PostgreSQL 16 test database"]
async fn incompatible_existing_schema_rolls_back_the_entire_adoption() {
    let db = database("SEAORM_DRIFT_DATABASE_URL").await;
    db.execute_unprepared("CREATE SCHEMA IF NOT EXISTS demo; CREATE TABLE IF NOT EXISTS demo.company(id text PRIMARY KEY, marker text); INSERT INTO demo.company VALUES ('retained','original') ON CONFLICT DO NOTHING").await.unwrap();
    assert!(migration::up(&db).await.is_err());
    let row=db.query_one_raw(Statement::from_string(DbBackend::Postgres,"SELECT marker, to_regclass('public.sessions')::text AS sessions,to_regclass('public.seaql_migrations')::text AS history FROM demo.company WHERE id='retained'")).await.unwrap().unwrap();
    assert_eq!(row.try_get::<String>("", "marker").unwrap(), "original");
    assert!(row
        .try_get::<Option<String>>("", "sessions")
        .unwrap()
        .is_none());
    assert!(row
        .try_get::<Option<String>>("", "history")
        .unwrap()
        .is_none());
}
