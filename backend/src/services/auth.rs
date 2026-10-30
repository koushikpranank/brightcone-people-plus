use crate::{
    app::db,
    controllers::{ApiError, ApiResult},
    models::{self, s, Snapshot},
};
use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, SaltString},
    Argon2, PasswordHasher, PasswordVerifier,
};
use axum::http::HeaderMap;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::Row;
use uuid::Uuid;

#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub sid: Uuid,
    pub exp: usize,
    pub iat: usize,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
pub struct Actor {
    pub email: String,
    pub name: String,
    pub role: String,
    pub viewas: Option<String>,
    pub sid: Uuid,
}
pub fn hash_password(password: &str) -> String {
    Argon2::default()
        .hash_password(password.as_bytes(), &SaltString::generate(&mut OsRng))
        .expect("argon2")
        .to_string()
}
fn secret() -> String {
    std::env::var("JWT_SECRET").expect("JWT_SECRET must be set")
}
pub fn issue(email: &str, sid: Uuid, seconds: i64) -> String {
    let now = chrono::Utc::now().timestamp();
    encode(
        &Header::default(),
        &Claims {
            sub: email.into(),
            sid,
            iat: now as usize,
            exp: (now + seconds) as usize,
        },
        &EncodingKey::from_secret(secret().as_bytes()),
    )
    .unwrap()
}
pub async fn authenticate(headers: &HeaderMap) -> ApiResult<Actor> {
    let token = headers
        .get("authorization")
        .and_then(|h| h.to_str().ok())
        .and_then(|h| h.strip_prefix("Bearer "))
        .ok_or_else(ApiError::unauthorized)?;
    let claims = decode::<Claims>(
        token,
        &DecodingKey::from_secret(secret().as_bytes()),
        &Validation::default(),
    )
    .map_err(|_| ApiError::unauthorized())?
    .claims;
    let row=sqlx::query("SELECT a.record,s.viewas FROM public.sessions s JOIN demo.accounts a ON a.id=s.email WHERE s.id=$1 AND s.email=$2 AND NOT s.revoked AND s.expires>now()")
        .bind(claims.sid).bind(&claims.sub).fetch_optional(db()).await?.ok_or_else(ApiError::unauthorized)?;
    let a: Value = row.get("record");
    let active:bool=sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM demo.employees WHERE record->>'name'=$1 AND record->>'status'<>'Inactive')").bind(s(&a,"name")).fetch_one(db()).await?;
    if s(&a, "status") != "Active" || !active {
        return Err(ApiError::unauthorized());
    }
    Ok(Actor {
        email: s(&a, "email").into(),
        name: s(&a, "name").into(),
        role: s(&a, "role").into(),
        viewas: row.get("viewas"),
        sid: claims.sid,
    })
}
pub async fn signin(body: Value) -> ApiResult<Value> {
    let email = s(&body, "email").trim().to_lowercase();
    let password = s(&body, "password");
    if email.is_empty() || password.is_empty() {
        return Err(ApiError::bad("Enter your work email and password."));
    }
    if !regex::Regex::new(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
        .unwrap()
        .is_match(&email)
    {
        return Err(ApiError::bad(
            "Enter a valid email address, like name@brightcone.ai.",
        ));
    }
    let mut tx = db().begin().await?;
    sqlx::query("SELECT pg_advisory_xact_lock(48150001)")
        .execute(&mut *tx)
        .await?;
    let row =
        sqlx::query("SELECT record,pass_hash FROM demo.accounts WHERE lower(id)=$1 FOR UPDATE")
            .bind(&email)
            .fetch_optional(&mut *tx)
            .await?
            .ok_or_else(|| {
                ApiError::bad(
            "We couldn’t find an account with that email. Check the spelling or contact HR.",
        )
            })?;
    let mut a: Value = row.get("record");
    let hash: String = row
        .get::<Option<String>, _>("pass_hash")
        .ok_or_else(|| ApiError::bad("This account needs a password reset. Ask HR to reset it."))?;
    if s(&a, "status") == "Locked" {
        return Err(ApiError::bad(
            "This account is locked after too many attempts. Ask HR to unlock it.",
        ));
    }
    let e:bool=sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM demo.employees WHERE record->>'name'=$1 AND record->>'status'<>'Inactive')").bind(s(&a,"name")).fetch_one(&mut *tx).await?;
    if s(&a, "status") != "Active" || !e {
        return Err(ApiError::bad(
            "This account is disabled. Contact HR if you think this is a mistake.",
        ));
    }
    let valid = PasswordHash::new(&hash).ok().is_some_and(|p| {
        Argon2::default()
            .verify_password(password.as_bytes(), &p)
            .is_ok()
    });
    if !valid {
        let fails = a["fails"].as_u64().unwrap_or(0) + 1;
        a["fails"] = json!(fails);
        if fails >= 5 {
            a["status"] = json!("Locked")
        }
        sqlx::query("UPDATE demo.accounts SET record=$1 WHERE id=$2")
            .bind(a)
            .bind(&email)
            .execute(&mut *tx)
            .await?;
        tx.commit().await?;
        return Err(ApiError::bad(if fails >= 5 {
            "Too many incorrect attempts. Your account is now locked. Ask HR to unlock it.".into()
        } else {
            format!(
                "That password isn’t right. {} attempt{} left before the account locks.",
                5 - fails,
                if fails < 4 { "s" } else { "" }
            )
        }));
    }
    a["fails"] = json!(0);
    a["last"] = json!(chrono::Utc::now().format("%Y-%m-%d %H:%M").to_string());
    sqlx::query("UPDATE demo.accounts SET record=$1 WHERE id=$2")
        .bind(&a)
        .bind(&email)
        .execute(&mut *tx)
        .await?;
    let remember = body["remember"].as_bool().unwrap_or(false);
    let sid = Uuid::new_v4();
    let refresh = if remember {
        Some(Uuid::new_v4().to_string() + &Uuid::new_v4().to_string())
    } else {
        None
    };
    let seconds = if remember { 30 * 86400 } else { 8 * 3600 };
    sqlx::query("INSERT INTO public.sessions (id,email,expires,refresh_hash) VALUES ($1,$2,now()+make_interval(secs=>$3),$4)").bind(sid).bind(&email).bind(seconds as f64).bind(refresh.as_ref().map(|r|hash_token(r))).execute(&mut *tx).await?;
    let old = models::load(&mut tx).await?;
    let mut next = old.clone();
    demo_audit(&mut next, s(&a, "name"), "Signed in");
    models::persist(&mut tx, &old, &next).await?;
    tx.commit().await?;
    Ok(
        json!({"token":issue(&email,sid,if remember{900}else{8*3600}),"refreshToken":refresh,"user":{"email":email,"name":a["name"],"role":a["role"]}}),
    )
}
pub fn hash_token(token: &str) -> String {
    use sha2::{Digest, Sha256};
    hex::encode(Sha256::digest(token.as_bytes()))
}
pub fn demo_audit(snap: &mut Snapshot, who: &str, action: &str) {
    let at = chrono::Utc::now();
    let t = format!(
        "{} {}",
        at.format("%Y-%m-%d"),
        at.with_timezone(&chrono_tz::Asia::Kolkata).format("%H:%M")
    );
    snap.demo["audit"]
        .as_array_mut()
        .unwrap()
        .insert(0, json!({"t":t,"who":who,"a":action}));
}
pub async fn refresh(body: Value) -> ApiResult<Value> {
    let refresh = s(&body, "refreshToken");
    let row=sqlx::query("SELECT id,email FROM public.sessions WHERE refresh_hash=$1 AND NOT revoked AND expires>now() FOR UPDATE").bind(hash_token(refresh)).fetch_optional(db()).await?.ok_or_else(ApiError::unauthorized)?;
    let sid: Uuid = row.get("id");
    let email: String = row.get("email");
    // Authentication is checked again by /me before data is returned.
    Ok(json!({"token":issue(&email,sid,900)}))
}
