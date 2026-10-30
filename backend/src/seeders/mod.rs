use crate::models::{self, Snapshot};
use sqlx::PgPool;
pub async fn seed_demo(pool: &PgPool) -> Result<(), sqlx::Error> {
    let mut tx = pool.begin().await?;
    sqlx::query("SELECT pg_advisory_xact_lock(48150001)")
        .execute(&mut *tx)
        .await?;
    let exists: bool = sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM demo.company)")
        .fetch_one(&mut *tx)
        .await?;
    if !exists {
        let mut snap = Snapshot {
            demo: serde_json::from_str(include_str!("demo.json")).unwrap(),
            live: serde_json::from_str(include_str!("live.json")).unwrap(),
        };
        snap.demo["resetAt"] = serde_json::json!(chrono::Utc::now().timestamp_millis());
        snap.live["created"] = serde_json::json!(models::now());
        models::persist(&mut tx, &Snapshot::empty(), &snap).await?;
    }
    tx.commit().await
}
pub async fn seed_empty_live(_pool: &PgPool) -> Result<(), sqlx::Error> {
    Ok(())
}
