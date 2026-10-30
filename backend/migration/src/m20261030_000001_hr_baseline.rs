use sea_orm_migration::prelude::*;

#[derive(DeriveMigrationName)]
pub struct Migration;

#[async_trait::async_trait]
impl MigrationTrait for Migration {
    async fn up(&self, manager: &SchemaManager) -> Result<(), DbErr> {
        crate::schema::create(manager).await?;
        crate::schema::verify(manager.get_connection()).await?;
        // Only migration bookkeeping is retired. Business records are untouched.
        // The caller runs everything inside one advisory-locked transaction.
        manager
            .drop_table(
                Table::drop()
                    .table("_sqlx_migrations")
                    .if_exists()
                    .to_owned(),
            )
            .await
    }

    async fn down(&self, _manager: &SchemaManager) -> Result<(), DbErr> {
        Err(DbErr::Custom(
            "The adopted HR baseline cannot be rolled back by dropping employee/payroll data. Restore the database backup if a full rollback is required.".into(),
        ))
    }
}
