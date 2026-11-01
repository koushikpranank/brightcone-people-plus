use brightcone_people_plus::schema;
use sea_orm::{ConnectOptions, Database};

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    dotenvy::from_path("../.env").ok();
    dotenvy::dotenv().ok();
    let action = std::env::args().nth(1).unwrap_or_else(|| "verify".into());
    if !matches!(action.as_str(), "sync" | "verify" | "status") {
        return Err(
            "Use sync, verify or status. The schema tool has no migration/reset commands.".into(),
        );
    }
    let mut options = ConnectOptions::new(std::env::var("DATABASE_URL")?);
    options.max_connections(3).sqlx_logging(false);
    let db = Database::connect(options).await?;
    let result = if action == "sync" {
        schema::run_autonomous_sync(&db).await
    } else {
        schema::verify(&db).await
    };
    result.map_err(std::io::Error::other)?;
    println!(
        "Schema {}: {} tables and {} declared columns verified; no versioned migrations.",
        if action == "sync" {
            "synchronized"
        } else {
            "ready"
        },
        schema::TABLES.len(),
        schema::TABLES
            .iter()
            .map(|t| t.columns.len())
            .sum::<usize>()
    );
    Ok(())
}
