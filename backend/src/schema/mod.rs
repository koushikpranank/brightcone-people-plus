//! Manifest-driven, additive startup synchronization. No migration versions or history.
mod manifest;
#[cfg(test)]
mod tests;
pub use manifest::{Column, ColumnType, Table, TABLES};

use manifest::{Constraint, Index, VIEWS};
use sea_orm::{
    ConnectionTrait, DatabaseConnection, DbBackend, FromQueryResult, Statement, TransactionTrait,
};
use std::collections::HashMap;

const LOCK: &str = "SELECT pg_advisory_xact_lock(88421038)";
const AUDIT_TABLES: &[(&str, &str)] = &[
    ("demo", "audit"),
    ("live", "audit"),
    ("public", "money_runs"),
    ("public", "money_policy_history"),
];
const AUDIT_BODY: &str =
    "BEGIN RAISE EXCEPTION '% is append-only', TG_TABLE_SCHEMA || '.' || TG_TABLE_NAME; END;";

#[derive(FromQueryResult)]
struct ColumnRow {
    name: String,
    db_type: String,
    nullable: bool,
    identity: String,
    generated: bool,
    expression: Option<String>,
}

/// Serialize startup DDL and commit all changes together, or roll them all back.
pub async fn run_autonomous_sync(database: &DatabaseConnection) -> Result<(), String> {
    let tx = database
        .begin()
        .await
        .map_err(|e| format!("begin schema synchronization: {e}"))?;
    let result = async {
        tx.execute_unprepared(LOCK).await.map_err(|e| e.to_string())?;
        for schema in ["demo", "live"] {
            tx.execute_unprepared(&format!("CREATE SCHEMA IF NOT EXISTS {}", quote(schema))).await.map_err(|e| e.to_string())?;
        }
        for table in TABLES.iter() { sync_table(&tx, table).await?; }
        ensure_views(&tx).await?;
        ensure_audit_append_only(&tx).await?;
        verify(&tx).await?;
        // Retire bookkeeping only after validating every application object.
        // No employee, account, audit or money table is dropped or reset.
        tx.execute_unprepared("DROP TABLE IF EXISTS public.seaql_migrations; DROP TABLE IF EXISTS public._sqlx_migrations;").await.map_err(|e| format!("retire obsolete migration tracking: {e}"))?;
        Ok::<(), String>(())
    }.await;
    match result {
        Ok(()) => tx
            .commit()
            .await
            .map_err(|e| format!("commit schema synchronization: {e}")),
        Err(error) => {
            tx.rollback()
                .await
                .map_err(|e| format!("{error}; rollback: {e}"))?;
            Err(format!("synchronize database schema: {error}"))
        }
    }
}

fn quote(identifier: &str) -> String {
    format!("\"{}\"", identifier.replace('"', "\"\""))
}
fn qualified(schema: &str, table: &str) -> String {
    format!("{}.{}", quote(schema), quote(table))
}
fn column_names(names: &[String]) -> String {
    names
        .iter()
        .map(|n| quote(n))
        .collect::<Vec<_>>()
        .join(", ")
}

fn column_ddl(column: &Column) -> Result<String, String> {
    if column.generated && (column.expression.is_none() || column.kind == ColumnType::Identity) {
        return Err(format!(
            "invalid generated column declaration {}",
            column.name
        ));
    }
    if column.kind == ColumnType::Identity && column.expression.is_some() {
        return Err(format!(
            "identity column {} cannot have a separate default",
            column.name
        ));
    }
    let mut ddl = format!("{} {}", quote(&column.name), column.kind.sql());
    if let Some(expr) = &column.expression {
        if column.generated {
            ddl.push_str(&format!(" GENERATED ALWAYS AS ({expr}) STORED"));
        } else {
            ddl.push_str(&format!(" DEFAULT {expr}"));
        }
    }
    if !column.nullable {
        ddl.push_str(" NOT NULL");
    }
    Ok(ddl)
}

fn constraint_ddl(constraint: &Constraint) -> Result<String, String> {
    let definition = match constraint.kind.as_str() {
        "p" | "u" => {
            let names = constraint
                .columns
                .as_deref()
                .filter(|v| !v.is_empty())
                .ok_or_else(|| format!("missing key columns: {}", constraint.name))?;
            format!(
                "{} ({})",
                if constraint.kind == "p" {
                    "PRIMARY KEY"
                } else {
                    "UNIQUE"
                },
                column_names(names)
            )
        }
        "c" => format!(
            "CHECK ({})",
            constraint
                .expression
                .as_deref()
                .ok_or_else(|| format!("missing check expression: {}", constraint.name))?
        ),
        other => return Err(format!("unsupported constraint kind {other}")),
    };
    Ok(format!(
        "CONSTRAINT {} {definition}",
        quote(&constraint.name)
    ))
}

async fn columns(
    db: &impl ConnectionTrait,
    table: &Table,
) -> Result<HashMap<String, ColumnRow>, String> {
    let rows = db.query_all_raw(Statement::from_sql_and_values(DbBackend::Postgres,
        "SELECT a.attname::text AS name, format_type(a.atttypid,a.atttypmod) AS db_type, NOT a.attnotnull AS nullable, a.attidentity::text AS identity, a.attgenerated='s' AS generated, pg_get_expr(d.adbin,d.adrelid) AS expression FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE n.nspname=$1 AND c.relname=$2 AND c.relkind IN ('r','p') AND a.attnum>0 AND NOT a.attisdropped",
        [table.schema.clone().into(),table.name.clone().into()])).await.map_err(|e| format!("inspect {}.{}: {e}", table.schema, table.name))?;
    rows.iter()
        .map(|r| {
            ColumnRow::from_query_result(r, "")
                .map(|c| (c.name.clone(), c))
                .map_err(|e| e.to_string())
        })
        .collect()
}

fn verify_column(table: &Table, expected: &Column, found: &ColumnRow) -> Result<(), String> {
    if found.db_type != expected.kind.postgres_type()
        || found.nullable != expected.nullable
        || (!found.identity.is_empty()) != (expected.kind == ColumnType::Identity)
        || found.generated != expected.generated
        || found.expression != expected.expression
    {
        return Err(format!("{}.{}.{}, existing type/nullability/identity/default/generated expression differs from the manifest; DBA review required", table.schema, table.name, expected.name));
    }
    Ok(())
}

async fn sync_table(db: &impl ConnectionTrait, table: &Table) -> Result<(), String> {
    let existing = columns(db, table).await?;
    let target = qualified(&table.schema, &table.name);
    if existing.is_empty() {
        let mut declarations = table
            .columns
            .iter()
            .map(column_ddl)
            .collect::<Result<Vec<_>, _>>()?;
        declarations.extend(
            table
                .constraints
                .iter()
                .map(constraint_ddl)
                .collect::<Result<Vec<_>, _>>()?,
        );
        db.execute_unprepared(&format!(
            "CREATE TABLE IF NOT EXISTS {target} ({})",
            declarations.join(", ")
        ))
        .await
        .map_err(|e| format!("create {target}: {e}"))?;
    } else {
        for column in &table.columns {
            if let Some(found) = existing.get(&column.name) {
                verify_column(table, column, found)?;
            } else {
                db.execute_unprepared(&format!(
                    "ALTER TABLE {target} ADD COLUMN IF NOT EXISTS {}",
                    column_ddl(column)?
                ))
                .await
                .map_err(|e| format!("add {target}.{}: {e}", column.name))?;
            }
        }
    }
    ensure_constraints(db, table).await?;
    for index in &table.indexes {
        if !verify_index(db, table, index).await? {
            db.execute_unprepared(&format!(
                "CREATE {}INDEX IF NOT EXISTS {} ON {target} ({})",
                if index.unique { "UNIQUE " } else { "" },
                quote(&index.name),
                column_names(&index.columns)
            ))
            .await
            .map_err(|e| format!("create index {}: {e}", index.name))?;
        }
    }
    verify_table(db, table).await
}

#[derive(FromQueryResult)]
struct ConstraintRow {
    name: String,
    kind: String,
    columns: String,
    expression: Option<String>,
}

async fn constraints(
    db: &impl ConnectionTrait,
    table: &Table,
) -> Result<Vec<ConstraintRow>, String> {
    db.query_all_raw(Statement::from_sql_and_values(DbBackend::Postgres,
        "SELECT con.conname::text AS name, con.contype::text AS kind, coalesce((SELECT string_agg(a.attname,',' ORDER BY keys.ord) FROM unnest(con.conkey) WITH ORDINALITY keys(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=keys.attnum),'') AS columns, pg_get_expr(con.conbin,con.conrelid) AS expression FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=$2",
        [table.schema.clone().into(),table.name.clone().into()])).await.map_err(|e| e.to_string())?.iter().map(|r| ConstraintRow::from_query_result(r, "").map_err(|e|e.to_string())).collect()
}

fn matches_constraint(found: &ConstraintRow, expected: &Constraint) -> bool {
    found.kind == expected.kind
        && found.columns == expected.columns.as_deref().unwrap_or_default().join(",")
        && found.expression == expected.expression
}

async fn ensure_constraints(db: &impl ConnectionTrait, table: &Table) -> Result<(), String> {
    let actual = constraints(db, table).await?;
    for expected in &table.constraints {
        if actual
            .iter()
            .any(|c| c.name == expected.name && !matches_constraint(c, expected))
        {
            return Err(format!(
                "incompatible constraint {}.{}.{}; DBA review required",
                table.schema, table.name, expected.name
            ));
        }
        if !actual.iter().any(|c| matches_constraint(c, expected)) {
            db.execute_unprepared(&format!(
                "ALTER TABLE {} ADD {}",
                qualified(&table.schema, &table.name),
                constraint_ddl(expected)?
            ))
            .await
            .map_err(|e| format!("add constraint {}: {e}", expected.name))?;
        }
    }
    Ok(())
}

/// Missing is repairable; an existing incompatible index must not be silently skipped.
async fn verify_index(
    db: &impl ConnectionTrait,
    table: &Table,
    expected: &Index,
) -> Result<bool, String> {
    let row = db.query_one_raw(Statement::from_sql_and_values(DbBackend::Postgres,
        "SELECT c.relname::text AS target, i.indisunique AS unique, i.indisvalid AS valid, i.indoption::text AS options, am.amname::text AS method, pg_get_expr(i.indpred,i.indrelid) AS predicate, pg_get_expr(i.indexprs,i.indrelid) AS expressions, (SELECT string_agg(a.attname,',' ORDER BY keys.ord) FROM unnest(i.indkey) WITH ORDINALITY keys(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=keys.attnum) AS columns FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_class idx ON idx.oid=i.indexrelid JOIN pg_namespace n ON n.oid=idx.relnamespace JOIN pg_am am ON am.oid=idx.relam WHERE n.nspname=$1 AND idx.relname=$2",
        [table.schema.clone().into(),expected.name.clone().into()])).await.map_err(|e|e.to_string())?;
    let Some(row) = row else { return Ok(false) };
    let read = || -> Result<bool, sea_orm::DbErr> {
        Ok(row.try_get::<String>("", "target")? == table.name
            && row.try_get::<bool>("", "unique")? == expected.unique
            && row.try_get::<bool>("", "valid")?
            && row.try_get::<String>("", "method")? == "btree"
            && row
                .try_get::<String>("", "options")?
                .split_whitespace()
                .all(|s| s == "0")
            && row.try_get::<Option<String>>("", "predicate")?.is_none()
            && row.try_get::<Option<String>>("", "expressions")?.is_none()
            && row.try_get::<String>("", "columns")? == expected.columns.join(","))
    };
    if !read().map_err(|e| e.to_string())? {
        return Err(format!(
            "incompatible index {}.{}; DBA review required",
            table.schema, expected.name
        ));
    }
    Ok(true)
}

async fn verify_table(db: &impl ConnectionTrait, table: &Table) -> Result<(), String> {
    let actual = columns(db, table).await?;
    for column in &table.columns {
        let found = actual
            .get(&column.name)
            .ok_or_else(|| format!("missing {}.{}.{}", table.schema, table.name, column.name))?;
        verify_column(table, column, found)?;
    }
    let actual = constraints(db, table).await?;
    for expected in &table.constraints {
        if !actual.iter().any(|c| matches_constraint(c, expected)) {
            return Err(format!(
                "missing constraint {}.{}.{}",
                table.schema, table.name, expected.name
            ));
        }
    }
    for index in &table.indexes {
        if !verify_index(db, table, index).await? {
            return Err(format!("missing index {}.{}", table.schema, index.name));
        }
    }
    Ok(())
}

async fn ensure_views(db: &impl ConnectionTrait) -> Result<(), String> {
    for view in VIEWS.iter() {
        if !verify_view(db, view).await? {
            db.execute_unprepared(&format!(
                "CREATE VIEW {} AS {}",
                qualified(&view.schema, &view.name),
                view.definition
            ))
            .await
            .map_err(|e| format!("create audit view {}: {e}", view.name))?;
        }
    }
    Ok(())
}

async fn verify_view(db: &impl ConnectionTrait, view: &manifest::View) -> Result<bool, String> {
    let row = db
        .query_one_raw(Statement::from_sql_and_values(
            DbBackend::Postgres,
            "SELECT definition FROM pg_views WHERE schemaname=$1 AND viewname=$2",
            [view.schema.clone().into(), view.name.clone().into()],
        ))
        .await
        .map_err(|e| e.to_string())?;
    let Some(row) = row else { return Ok(false) };
    if row
        .try_get::<String>("", "definition")
        .map_err(|e| e.to_string())?
        != view.definition
    {
        return Err(format!(
            "incompatible view {}.{}; DBA review required",
            view.schema, view.name
        ));
    }
    Ok(true)
}

async fn ensure_audit_append_only(db: &impl ConnectionTrait) -> Result<(), String> {
    let function=db.query_one_raw(Statement::from_string(DbBackend::Postgres,"SELECT p.prosrc FROM pg_proc p JOIN pg_namespace n ON n.oid=p.pronamespace WHERE n.nspname='public' AND p.proname='brightcone_append_only' AND p.pronargs=0")).await.map_err(|e|e.to_string())?;
    if let Some(row) = function {
        if row
            .try_get::<String>("", "prosrc")
            .map_err(|e| e.to_string())?
            .trim()
            != AUDIT_BODY
        {
            return Err("incompatible append-only function; DBA review required".into());
        }
    } else {
        db.execute_unprepared(&format!("CREATE FUNCTION public.brightcone_append_only() RETURNS trigger LANGUAGE plpgsql AS $body${AUDIT_BODY}$body$")).await.map_err(|e|e.to_string())?;
    }
    for &(schema, table) in AUDIT_TABLES {
        for (name, kind, event) in [
            ("brightcone_no_change", 27, "UPDATE OR DELETE"),
            ("brightcone_no_truncate", 34, "TRUNCATE"),
        ] {
            if !verify_trigger(db, schema, table, name, kind).await? {
                db.execute_unprepared(&format!("CREATE TRIGGER {} BEFORE {event} ON {} FOR EACH {} EXECUTE FUNCTION public.brightcone_append_only()",quote(name),qualified(schema,table),if kind==27 {"ROW"}else{"STATEMENT"})).await.map_err(|e|e.to_string())?;
            }
        }
    }
    Ok(())
}

async fn verify_trigger(
    db: &impl ConnectionTrait,
    schema: &str,
    table: &str,
    name: &str,
    kind: i32,
) -> Result<bool, String> {
    let row=db.query_one_raw(Statement::from_sql_and_values(DbBackend::Postgres,"SELECT t.tgtype::integer AS kind,t.tgenabled::text AS enabled,p.proname::text AS function,pn.nspname::text AS namespace FROM pg_trigger t JOIN pg_class c ON c.oid=t.tgrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_proc p ON p.oid=t.tgfoid JOIN pg_namespace pn ON pn.oid=p.pronamespace WHERE n.nspname=$1 AND c.relname=$2 AND t.tgname=$3 AND NOT t.tgisinternal",[schema.into(),table.into(),name.into()])).await.map_err(|e|e.to_string())?;
    let Some(row) = row else { return Ok(false) };
    let read = || -> Result<bool, sea_orm::DbErr> {
        Ok(row.try_get::<i32>("", "kind")? == kind
            && row.try_get::<String>("", "enabled")? == "O"
            && row.try_get::<String>("", "function")? == "brightcone_append_only"
            && row.try_get::<String>("", "namespace")? == "public")
    };
    if !read().map_err(|e| e.to_string())? {
        return Err(format!(
            "incompatible append-only trigger {schema}.{table}.{name}; DBA review required"
        ));
    }
    Ok(true)
}

/// Non-mutating check; additional columns/tables are retained and allowed.
pub async fn verify(db: &impl ConnectionTrait) -> Result<(), String> {
    for table in TABLES.iter() {
        verify_table(db, table).await?;
    }
    for view in VIEWS.iter() {
        if !verify_view(db, view).await? {
            return Err(format!("missing audit view {}", view.name));
        }
    }
    for &(schema, table) in AUDIT_TABLES {
        for (name, kind) in [("brightcone_no_change", 27), ("brightcone_no_truncate", 34)] {
            if !verify_trigger(db, schema, table, name, kind).await? {
                return Err(format!(
                    "missing append-only trigger {schema}.{table}.{name}"
                ));
            }
        }
    }
    Ok(())
}
