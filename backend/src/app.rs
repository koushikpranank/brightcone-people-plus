use async_trait::async_trait;
use loco_rs::{
    app::{AppContext, Hooks},
    bgworker::Queue,
    boot::{create_app, BootResult, StartMode},
    config::Config,
    controller::AppRoutes,
    environment::Environment,
    task::Tasks,
    Result,
};
use sea_orm::{ConnectOptions, Database, DatabaseConnection};
use sqlx::PgPool;
use std::sync::OnceLock;
static POOL: OnceLock<PgPool> = OnceLock::new();
static ORM: OnceLock<DatabaseConnection> = OnceLock::new();
pub fn orm() -> &'static DatabaseConnection {
    ORM.get().expect("SeaORM initialized by Loco")
}
pub fn db() -> &'static PgPool {
    POOL.get().expect("database initialized by Loco")
}
pub struct App;
#[async_trait]
impl Hooks for App {
    fn app_name() -> &'static str {
        env!("CARGO_PKG_NAME")
    }
    async fn boot(mode: StartMode, env: &Environment, config: Config) -> Result<BootResult> {
        create_app::<Self>(mode, env, config).await
    }
    async fn after_context(ctx: AppContext) -> Result<AppContext> {
        let url = std::env::var("DATABASE_URL")
            .map_err(|_| loco_rs::Error::Message("Set DATABASE_URL in .env".into()))?;
        let jwt = std::env::var("JWT_SECRET").unwrap_or_default();
        let session = std::env::var("SESSION_SECRET").unwrap_or_default();
        if jwt.len() < 32 || session.len() < 32 {
            return Err(loco_rs::Error::Message(
                "JWT_SECRET and SESSION_SECRET must each contain at least 32 characters".into(),
            ));
        }
        let mut options = ConnectOptions::new(url);
        options.max_connections(12).sqlx_logging(false);
        let orm = Database::connect(options)
            .await
            .map_err(|e| loco_rs::Error::Message(e.to_string()))?;
        crate::schema::run_autonomous_sync(&orm)
            .await
            .map_err(|e| loco_rs::Error::Message(e.to_string()))?;
        // Existing checked SQLx queries share SeaORM's pool; no second pool or driver.
        let pool = orm.get_postgres_connection_pool().clone();
        crate::seeders::seed_demo(&pool)
            .await
            .map_err(|e| loco_rs::Error::Message(e.to_string()))?;
        POOL.set(pool).ok();
        ORM.set(orm).ok();
        Ok(ctx)
    }
    fn routes(_ctx: &AppContext) -> AppRoutes {
        AppRoutes::with_default_routes().add_route(crate::controllers::routes())
    }
    async fn connect_workers(_ctx: &AppContext, _queue: &Queue) -> Result<()> {
        Ok(())
    }
    fn register_tasks(_tasks: &mut Tasks) {}
}
