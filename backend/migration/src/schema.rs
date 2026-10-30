//! Frozen baseline metadata describes the existing schema, not employee values.
//! SeaQuery creates tables, generated columns, constraints and indexes in Rust.
use sea_orm::{DbBackend, Statement};
use sea_orm_migration::prelude::*;
use serde::Deserialize;

#[derive(Deserialize)]
struct Definition {
    tables: Vec<Relation>,
    views: Vec<ViewDefinition>,
}
#[derive(Deserialize)]
struct Relation {
    schema: String,
    name: String,
    columns: Vec<Column>,
    constraints: Vec<Constraint>,
    indexes: Vec<IndexDefinition>,
}
#[derive(Deserialize)]
struct Column {
    name: String,
    #[serde(rename = "type")]
    kind: String,
    nullable: bool,
    generated: bool,
    expression: Option<String>,
}
#[derive(Deserialize)]
struct Constraint {
    name: String,
    kind: String,
    columns: Option<Vec<String>>,
    expression: Option<String>,
}
#[derive(Deserialize)]
struct IndexDefinition {
    name: String,
    unique: bool,
    columns: Vec<String>,
}
#[derive(Deserialize)]
struct ViewDefinition {
    schema: String,
    name: String,
    definition: String,
}

fn definition() -> Result<Definition, DbErr> {
    serde_json::from_str(include_str!("schema.json")).map_err(|e| DbErr::Custom(e.to_string()))
}

fn column(c: &Column) -> Result<ColumnDef, DbErr> {
    let mut result = ColumnDef::new(Alias::new(c.name.clone()));
    match c.kind.as_str() {
        "text" => result.text(),
        "integer" => result.integer(),
        "bigint" => result.big_integer(),
        "jsonb" => result.json_binary(),
        "double precision" => result.double(),
        "boolean" => result.boolean(),
        "timestamp with time zone" => result.timestamp_with_time_zone(),
        "uuid" => result.uuid(),
        other => return Err(DbErr::Custom(format!("Unsupported baseline type {other}"))),
    };
    if !c.nullable {
        result.not_null();
    }
    if let Some(expr) = &c.expression {
        if c.generated {
            result.generated(Expr::cust(expr.clone()), true);
        } else {
            result.default(Expr::cust(expr.clone()));
        }
    }
    Ok(result)
}

pub async fn create(manager: &SchemaManager<'_>) -> Result<(), DbErr> {
    for name in ["demo", "live"] {
        manager
            .get_connection()
            .execute_unprepared(&format!("CREATE SCHEMA IF NOT EXISTS \"{name}\""))
            .await?;
    }
    let metadata = definition()?;
    for t in &metadata.tables {
        let mut table = Table::create();
        table
            .table((Alias::new(t.schema.clone()), Alias::new(t.name.clone())))
            .if_not_exists();
        for c in &t.columns {
            table.col(column(c)?);
        }
        for c in &t.constraints {
            match c.kind.as_str() {
                "p" | "u" => {
                    let mut index = Index::create();
                    index.name(&c.name);
                    for name in c.columns.as_deref().unwrap_or_default() {
                        index.col(Alias::new(name.clone()));
                    }
                    if c.kind == "p" {
                        table.primary_key(&mut index);
                    } else {
                        table.index(index.unique());
                    }
                }
                "c" => {
                    table.check(Expr::cust(
                        c.expression
                            .clone()
                            .ok_or_else(|| DbErr::Custom("Missing check expression".into()))?,
                    ));
                }
                other => return Err(DbErr::Custom(format!("Unsupported constraint {other}"))),
            }
        }
        manager.create_table(table).await?;
        for i in &t.indexes {
            let mut index = Index::create();
            index
                .name(&i.name)
                .table((Alias::new(t.schema.clone()), Alias::new(t.name.clone())))
                .if_not_exists();
            if i.unique {
                index.unique();
            }
            for name in &i.columns {
                index.col(Alias::new(name.clone()));
            }
            manager.create_index(index).await?;
        }
    }
    // PostgreSQL audit views retain their exact, trusted source expressions.
    for view in metadata.views {
        let sql = format!(
            "CREATE OR REPLACE VIEW \"{}\".\"{}\" AS {}",
            view.schema, view.name, view.definition
        );
        manager.get_connection().execute_unprepared(&sql).await?;
    }
    Ok(())
}

/// Verify every stored/generated column and the key/index/check definitions.
/// A mismatched existing database fails adoption; it is never silently reset.
pub async fn verify<C: ConnectionTrait>(db: &C) -> Result<(), DbErr> {
    for t in definition()?.tables {
        let rows=db.query_all_raw(Statement::from_sql_and_values(DbBackend::Postgres,
            "SELECT a.attname::text AS name,format_type(a.atttypid,a.atttypmod) AS kind,NOT a.attnotnull AS nullable,a.attgenerated='s' AS generated,pg_get_expr(d.adbin,d.adrelid) AS expression FROM pg_attribute a JOIN pg_class c ON c.oid=a.attrelid JOIN pg_namespace n ON n.oid=c.relnamespace LEFT JOIN pg_attrdef d ON d.adrelid=a.attrelid AND d.adnum=a.attnum WHERE n.nspname=$1 AND c.relname=$2 AND a.attnum>0 AND NOT a.attisdropped ORDER BY a.attnum",
            [t.schema.clone().into(),t.name.clone().into()])).await?;
        if rows.len() != t.columns.len() {
            return Err(DbErr::Custom(format!(
                "Schema mismatch: {}.{} column count",
                t.schema, t.name
            )));
        }
        for (actual, expected) in rows.iter().zip(&t.columns) {
            let matches = actual.try_get::<String>("", "name")? == expected.name
                && actual.try_get::<String>("", "kind")? == expected.kind
                && actual.try_get::<bool>("", "nullable")? == expected.nullable
                && actual.try_get::<bool>("", "generated")? == expected.generated
                && actual.try_get::<Option<String>>("", "expression")? == expected.expression;
            if !matches {
                return Err(DbErr::Custom(format!(
                    "Schema mismatch: {}.{}.{}",
                    t.schema, t.name, expected.name
                )));
            }
        }
        let constraints=db.query_all_raw(Statement::from_sql_and_values(DbBackend::Postgres,
            "SELECT con.contype::text AS kind,coalesce((SELECT string_agg(a.attname,',' ORDER BY keys.ord) FROM unnest(con.conkey) WITH ORDINALITY keys(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=keys.attnum),'') AS columns,pg_get_expr(con.conbin,con.conrelid) AS expression FROM pg_constraint con JOIN pg_class c ON c.oid=con.conrelid JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=$2",
            [t.schema.clone().into(),t.name.clone().into()])).await?;
        if constraints.len() != t.constraints.len() {
            return Err(DbErr::Custom(format!(
                "Constraint count mismatch: {}.{}",
                t.schema, t.name
            )));
        }
        for expected in &t.constraints {
            let cols = expected.columns.as_deref().unwrap_or_default().join(",");
            let matched = constraints.iter().any(|row| {
                row.try_get::<String>("", "kind").ok().as_deref() == Some(expected.kind.as_str())
                    && row.try_get::<String>("", "columns").ok().as_deref() == Some(cols.as_str())
                    && row.try_get::<Option<String>>("", "expression").ok()
                        == Some(expected.expression.clone())
            });
            if !matched {
                return Err(DbErr::Custom(format!(
                    "Constraint mismatch: {}.{} / {}",
                    t.schema, t.name, expected.name
                )));
            }
        }
        for expected in &t.indexes {
            let row=db.query_one_raw(Statement::from_sql_and_values(DbBackend::Postgres,
                "SELECT i.indisunique AS unique, (SELECT string_agg(a.attname,',' ORDER BY keys.ord) FROM unnest(i.indkey) WITH ORDINALITY keys(attnum,ord) JOIN pg_attribute a ON a.attrelid=c.oid AND a.attnum=keys.attnum) AS columns FROM pg_index i JOIN pg_class c ON c.oid=i.indrelid JOIN pg_namespace n ON n.oid=c.relnamespace JOIN pg_class idx ON idx.oid=i.indexrelid WHERE n.nspname=$1 AND c.relname=$2 AND idx.relname=$3",
                [t.schema.clone().into(),t.name.clone().into(),expected.name.clone().into()])).await?
                .ok_or_else(||DbErr::Custom(format!("Missing index {}",expected.name)))?;
            if row.try_get::<bool>("", "unique")? != expected.unique
                || row.try_get::<String>("", "columns")? != expected.columns.join(",")
            {
                return Err(DbErr::Custom(format!("Index mismatch {}", expected.name)));
            }
        }
    }
    Ok(())
}
