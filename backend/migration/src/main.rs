use migration::{
    sea_orm::{ConnectOptions, Database},
    Migrator, MigratorTrait,
};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::from_path("../.env").ok();
    dotenvy::dotenv().ok();
    let action = std::env::args().nth(1).unwrap_or_else(|| "up".into());
    if !matches!(action.as_str(), "up" | "status" | "verify") {
        return Err("Use up, status or verify. Destructive reset commands are not exposed.".into());
    }
    let mut options = ConnectOptions::new(std::env::var("DATABASE_URL")?);
    options.max_connections(3).sqlx_logging(false);
    let db = Database::connect(options).await?;
    match action.as_str() {
        "up" => {
            migration::up(&db).await?;
            println!("SeaORM migrations applied; existing HR records retained.");
        }
        "verify" => {
            migration::verify(&db).await?;
            println!("Verified 113 application tables and 1,395 columns.");
        }
        _ => {
            for m in Migrator::get_migration_with_status_read_only(&db).await? {
                println!("{} {}", m.name(), m.status());
            }
        }
    }
    Ok(())
}
