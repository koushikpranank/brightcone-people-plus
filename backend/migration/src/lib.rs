//! SeaORM owns schema creation, adoption of the former SQLx schema, and history.
use sea_orm::{DatabaseConnection, TransactionTrait};
use sea_orm_migration::prelude::async_trait;
pub use sea_orm_migration::prelude::{
    sea_orm, ConnectionTrait, DbErr, MigrationTrait, MigratorTrait,
};

mod m20261030_000001_hr_baseline;
mod schema;

pub struct Migrator;

#[async_trait::async_trait]
impl MigratorTrait for Migrator {
    fn migrations() -> Vec<Box<dyn MigrationTrait>> {
        vec![Box::new(m20261030_000001_hr_baseline::Migration)]
    }
}

/// Serialize concurrent startups and atomically adopt/create the schema.
pub async fn up(db: &DatabaseConnection) -> Result<(), DbErr> {
    let tx = db.begin().await?;
    tx.execute_unprepared("SELECT pg_advisory_xact_lock(48150002)")
        .await?;
    Migrator::up(&tx, None).await?;
    tx.commit().await
}

pub async fn verify<C: ConnectionTrait>(db: &C) -> Result<(), DbErr> {
    schema::verify(db).await
}
