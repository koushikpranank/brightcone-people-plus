use brightcone_people_plus::app::App;
#[tokio::main]
async fn main() -> loco_rs::Result<()> {
    dotenvy::from_path("../.env").ok();
    dotenvy::dotenv().ok();
    loco_rs::cli::main::<App>().await
}
