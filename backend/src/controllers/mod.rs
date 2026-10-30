use crate::{
    app::db,
    models::{self, now, s, today, Snapshot, REG_META},
    services::{
        self, access, advanced,
        auth::{self, Actor},
        registry, rules,
    },
};
use axum::{
    extract::Path,
    http::{HeaderMap, StatusCode},
    response::{IntoResponse, Response},
    Json,
};
use loco_rs::prelude::{get, patch, post, Routes};
use serde_json::{json, Value};

#[derive(Debug)]
pub struct ApiError(pub StatusCode, pub String);
pub type ApiResult<T> = Result<T, ApiError>;
impl ApiError {
    pub fn bad(m: impl Into<String>) -> Self {
        Self(StatusCode::BAD_REQUEST, m.into())
    }
    pub fn forbidden() -> Self {
        Self(
            StatusCode::FORBIDDEN,
            "You don’t have access to this record".into(),
        )
    }
    pub fn unauthorized() -> Self {
        Self(StatusCode::UNAUTHORIZED, "Please sign in.".into())
    }
    pub fn not_found() -> Self {
        Self(StatusCode::NOT_FOUND, "Not found".into())
    }
    pub fn conflict() -> Self {
        Self(
            StatusCode::CONFLICT,
            "This record changed in another session. Reload and try again.".into(),
        )
    }
}
impl From<sqlx::Error> for ApiError {
    fn from(e: sqlx::Error) -> Self {
        tracing::error!(error=%e,"database request failed");
        Self(
            StatusCode::INTERNAL_SERVER_ERROR,
            "Couldn’t save your changes. Please try again.".into(),
        )
    }
}
impl IntoResponse for ApiError {
    fn into_response(self) -> Response {
        (self.0, Json(json!({"error":self.1}))).into_response()
    }
}
async fn transaction() -> ApiResult<(sqlx::Transaction<'static, sqlx::Postgres>, Snapshot)> {
    let mut tx = db().begin().await?;
    sqlx::query("SELECT pg_advisory_xact_lock(48150001)")
        .execute(&mut *tx)
        .await?;
    let snap = models::load(&mut tx).await?;
    Ok((tx, snap))
}
async fn finish(
    mut tx: sqlx::Transaction<'static, sqlx::Postgres>,
    old: &Snapshot,
    mut next: Snapshot,
    a: &Actor,
) -> ApiResult<Snapshot> {
    services::money::reconcile_employees(old, &mut next, a);
    rules::run_rules(&mut next, a);
    if old.live != next.live {
        next.live["saved"] = json!(now());
    }
    models::persist(&mut tx, old, &next).await?;
    tx.commit().await?;
    Ok(next)
}
async fn read_snapshot() -> ApiResult<Snapshot> {
    let mut conn = db().acquire().await?;
    Ok(models::load(&mut conn).await?)
}
async fn response(snap: &Snapshot, a: &Actor) -> ApiResult<Value> {
    let mut scoped = access::scoped(snap, a);
    let my_id = access::my_emp(snap, a);
    let open = snap
        .live("logs")
        .into_iter()
        .find(|r| s(r, "emp") == my_id && s(r, "date") == today() && s(r, "logout").is_empty());
    scoped.demo["clockedIn"] = json!(open.is_some());
    scoped.demo["clockStart"] = open.map(|r| r["startedAt"].clone()).unwrap_or(Value::Null);
    for sv in snap.live("surveys") {
        let id = s(&sv, "id");
        let hash = auth::hash_token(&format!(
            "{}|{}|{}",
            std::env::var("SESSION_SECRET").unwrap(),
            a.email,
            id
        ));
        let answered:bool=sqlx::query_scalar("SELECT EXISTS(SELECT 1 FROM public.survey_answers WHERE survey_id=$1 AND user_email_hash=$2)").bind(id).bind(hash).fetch_one(db()).await?;
        if answered {
            scoped.live["settings"]["answered"][id] = json!([a.email]);
        }
    }
    Ok(
        json!({"user":{"email":a.email,"name":a.name,"role":a.role},"demo":scoped.demo,"live":scoped.live,"registry":*REG_META,"access":access::access(snap,a),"computed":advanced::computed(snap,a)}),
    )
}
async fn health() -> ApiResult<Json<Value>> {
    sqlx::query("SELECT 1").execute(db()).await?;
    Ok(Json(json!({"status":"ok"})))
}
async fn signin(Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    Ok(Json(auth::signin(body).await?))
}
async fn refresh(Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    Ok(Json(auth::refresh(body).await?))
}
async fn forgot(Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let email = s(&body, "email").trim();
    if email.is_empty() {
        return Err(ApiError::bad("Enter your work email."));
    }
    Ok(Json(
        json!({"message":format!("If an account exists for {email}, a reset link is on its way. It expires in 30 minutes.")}),
    ))
}
async fn me(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let next = finish(tx, &old, old.clone(), &a).await?;
    Ok(Json(response(&next, &a).await?))
}
async fn signout(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (mut tx, old) = transaction().await?;
    let mut next = old.clone();
    auth::demo_audit(&mut next, &a.name, "Signed out");
    models::persist(&mut tx, &old, &next).await?;
    sqlx::query("UPDATE public.sessions SET revoked=true WHERE id=$1")
        .bind(a.sid)
        .execute(&mut *tx)
        .await?;
    tx.commit().await?;
    Ok(Json(json!({})))
}
async fn sync_state(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let base: Snapshot =
        serde_json::from_value(body["base"].clone()).map_err(|_| ApiError::bad("Invalid state"))?;
    let next: Snapshot =
        serde_json::from_value(body["next"].clone()).map_err(|_| ApiError::bad("Invalid state"))?;
    let (tx, old) = transaction().await?;
    let mut merged = old.clone();
    services::sync::apply(&mut merged, &base, &next, &a)?;
    let result = finish(tx, &old, merged, &a).await?;
    Ok(Json(response(&result, &a).await?))
}
async fn reg_meta(headers: HeaderMap) -> ApiResult<Json<Value>> {
    auth::authenticate(&headers).await?;
    Ok(Json(REG_META.clone()))
}
async fn reg_list(headers: HeaderMap, Path(k): Path<String>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    if REG_META.get(&k).is_none() {
        return Err(ApiError::not_found());
    }
    let snap = read_snapshot().await?;
    let rows: Vec<_> = snap
        .recs(&k)
        .into_iter()
        .filter(|r| access::can_see(&snap, &a, &k, r))
        .map(|mut r| {
            if k == "appraisal"
                && access::role(&snap, &a) == "Employee"
                && s(&r, "released") != "Yes"
            {
                r["rating"] = Value::Null;
            }
            r
        })
        .collect();
    Ok(Json(json!(rows)))
}
async fn reg_create(
    headers: HeaderMap,
    Path(k): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    reg_write(headers, k, None, body).await
}
async fn reg_patch(
    headers: HeaderMap,
    Path(k): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let id = s(&body, "id").to_owned();
    reg_write(headers, k, Some(id), body).await
}
async fn reg_patch_id(
    headers: HeaderMap,
    Path((k, id)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    reg_write(headers, k, Some(id), body).await
}
async fn reg_write(
    headers: HeaderMap,
    k: String,
    id: Option<String>,
    body: Value,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let mut next = old.clone();
    let source = body["__source"].clone();
    let r = registry::upsert(&mut next, &k, body, id.as_deref(), &a)?;
    if k == "emp" {
        services::actions::converted(&mut next, &source, &r, &a)?;
    }
    let result = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"record":r,"warning":registry::warning(&old,&k,&r),"state":response(&result,&a).await?}),
    ))
}
async fn reg_archive(
    headers: HeaderMap,
    Path(k): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    do_archive(headers, k, s(&body, "id").into(), false).await
}
async fn reg_archive_id(
    headers: HeaderMap,
    Path((k, id)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    do_archive(headers, k, id, false).await
}
async fn reg_restore(
    headers: HeaderMap,
    Path((k, id)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    do_archive(headers, k, id, true).await
}
async fn do_archive(
    headers: HeaderMap,
    k: String,
    id: String,
    restore: bool,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let mut next = old.clone();
    let r = registry::archive(&mut next, &k, &id, restore, &a)?;
    let result = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"record":r,"state":response(&result,&a).await?}),
    ))
}
async fn reg_show(
    headers: HeaderMap,
    Path((k, id)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let mut next = old.clone();
    let r = next
        .recs(&k)
        .into_iter()
        .find(|r| s(r, "id") == id)
        .ok_or_else(ApiError::not_found)?;
    if !access::can_see(&next, &a, &k, &r) {
        return Err(ApiError::forbidden());
    }
    if ["pips", "promos", "succession"].contains(&k.as_str()) {
        next.audit(
            &a.email,
            format!(
                "Viewed confidential {} {id}{}",
                s(&REG_META[&k], "one").to_lowercase(),
                if s(&r, "emp").is_empty() {
                    String::new()
                } else {
                    format!(" ({})", s(&r, "emp"))
                }
            ),
        );
    }
    finish(tx, &old, next, &a).await?;
    Ok(Json(r))
}
async fn access_me(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    Ok(Json(access::access(&snap, &a)))
}
async fn viewas(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let mut a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    if access::real_role(&snap, &a) != "HR Admin" {
        return Err(ApiError::forbidden());
    }
    let role = s(&body, "role");
    if ![
        "",
        "HR Executive",
        "Manager",
        "Finance",
        "Leadership",
        "Employee",
    ]
    .contains(&role)
    {
        return Err(ApiError::forbidden());
    }
    a.viewas = if role.is_empty() {
        None
    } else {
        Some(role.into())
    };
    sqlx::query("UPDATE public.sessions SET viewas=$1 WHERE id=$2")
        .bind(&a.viewas)
        .bind(a.sid)
        .execute(db())
        .await?;
    Ok(Json(response(&snap, &a).await?))
}
async fn notifications(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let snap = finish(tx, &old, old.clone(), &a).await?;
    Ok(Json(json!({"due":rules::due_actions(&snap,&a)})))
}
async fn advanced_area(headers: HeaderMap, Path(area): Path<String>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    if access::scope(&snap, &a, &area) == "none" {
        return Err(ApiError::forbidden());
    }
    Ok(Json(advanced::area(&snap, &a, &area)))
}
async fn dashboards(headers: HeaderMap, Path(app): Path<String>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    if ![
        "plus", "people", "recruit", "payroll", "expense", "sign", "connect", "learn", "shift",
    ]
    .contains(&app.as_str())
    {
        return Err(ApiError::not_found());
    }
    Ok(Json(
        json!({"app":app,"records":access::scoped(&snap,&a).demo,"computed":advanced::computed(&snap,&a)}),
    ))
}
async fn backup(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    if access::real_role(&old, &a) != "HR Admin" || a.viewas.is_some() {
        return Err(ApiError::forbidden());
    }
    let mut next = old.clone();
    next.audit(&a.email, "Downloaded a backup");
    let mut backup = old.live.clone();
    backup["exportedAt"] = json!(now());
    backup["exportedBy"] = json!(a.email);
    finish(tx, &old, next, &a).await?;
    Ok(Json(backup))
}
async fn backup_import(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (mut tx, old) = transaction().await?;
    if access::real_role(&old, &a) != "HR Admin" || a.viewas.is_some() {
        return Err(ApiError::forbidden());
    }
    let mut next = old.clone();
    let mut added = 0;
    let mut skipped = 0;
    let incoming = body.get("bc-pp-records-v1").unwrap_or(&body);
    if !incoming["data"].is_object() && body.get("bc-hr-state").is_none() {
        return Err(ApiError::bad(
            "This doesn’t look like a People Plus backup.",
        ));
    }
    for (k, list) in incoming["data"].as_object().into_iter().flatten() {
        if k == "resp" {
            let mut rows = next.live["data"]["resp"]
                .as_array()
                .cloned()
                .unwrap_or_default();
            for r in list
                .as_array()
                .into_iter()
                .flatten()
                .filter(|r| r.is_object())
            {
                let mut clean = r.clone();
                for key in ["user_email", "email", "userEmail"] {
                    clean.as_object_mut().unwrap().remove(key);
                }
                let mut identity = clean.clone();
                identity.as_object_mut().unwrap().remove("id");
                let exists = rows.iter().any(|old| {
                    let mut old = old.clone();
                    old.as_object_mut().unwrap().remove("id");
                    old == identity
                }) || (!s(&clean, "id").is_empty()
                    && rows.iter().any(|old| old["id"] == clean["id"]));
                if exists {
                    continue;
                }
                if s(&clean, "id").is_empty() {
                    clean["id"] =
                        json!(auth::hash_token(&serde_json::to_string(&identity).unwrap()));
                }
                let inserted=sqlx::query("INSERT INTO live.responses(id,record) VALUES($1,$2) ON CONFLICT(id) DO NOTHING").bind(s(&clean,"id")).bind(&clean).execute(&mut *tx).await?;
                if inserted.rows_affected() == 1 {
                    rows.push(clean);
                    added += 1;
                }
            }
            next.live["data"]["resp"] = json!(rows);
            continue;
        }
        if REG_META.get(k).is_none() {
            continue;
        }
        let mut rows = next.recs(k);
        for r in list.as_array().into_iter().flatten() {
            if s(r, "id").is_empty() || rows.iter().any(|x| x["id"] == r["id"]) {
                skipped += 1
            } else {
                rows.push(r.clone());
                added += 1
            }
        }
        next.set_recs(k, rows);
    }
    if let Some(settings) = incoming["settings"].as_object() {
        for (k, v) in settings {
            if next.live["settings"].get(k).is_none() {
                next.live["settings"][k] = v.clone();
            }
        }
    }
    for (k, v) in incoming["seq"].as_object().into_iter().flatten() {
        if v.as_u64() > next.live["seq"][k].as_u64() {
            next.live["seq"][k] = v.clone();
        }
    }
    if let Some(demo) = body.get("bc-hr-state") {
        for (k, meta) in models::TABLES["demo"].as_object().unwrap() {
            if s(meta, "kind") != "array" {
                continue;
            }
            let mut rows = next.demo[k].as_array().cloned().unwrap_or_default();
            for r in demo[k].as_array().into_iter().flatten() {
                let nk = s(meta, "natural");
                if r[nk].is_string() && !rows.iter().any(|x| x[nk] == r[nk]) {
                    rows.push(r.clone());
                    added += 1
                }
            }
            next.demo[k] = json!(rows);
        }
    }
    next.audit(
        &a.email,
        format!("Imported backup: {added} records added, {skipped} already present"),
    );
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"added":added,"skipped":skipped,"state":response(&snap,&a).await?}),
    ))
}
async fn survey_read(headers: HeaderMap, Path(id): Path<String>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    if access::scope(&snap, &a, "eng") == "none" {
        return Err(ApiError::forbidden());
    }
    Ok(Json(advanced::survey_groups(&snap, &a, &id)))
}
async fn survey_respond(
    headers: HeaderMap,
    Path(id): Path<String>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (mut tx, old) = transaction().await?;
    let mut next = old.clone();
    let emp = access::my_emp(&next, &a);
    let e = next.employee(&emp).ok_or_else(ApiError::forbidden)?;
    let sv = next
        .live("surveys")
        .into_iter()
        .find(|r| s(r, "id") == id && s(r, "status") == "Open")
        .ok_or_else(ApiError::not_found)?;
    if s(&sv, "aud") != "All employees" && s(&sv, "aud") != s(&e, "department") {
        return Err(ApiError::forbidden());
    }
    let scores = body["sc"]
        .as_array()
        .ok_or_else(|| ApiError::bad("Please answer every question."))?;
    let count = s(&sv, "stmts")
        .lines()
        .filter(|x| !x.trim().is_empty())
        .count();
    let nps = body["nps"]
        .as_u64()
        .filter(|x| *x <= 10)
        .ok_or_else(|| ApiError::bad("Please answer every question."))?;
    if scores.len() != count
        || scores
            .iter()
            .any(|v| !v.as_u64().is_some_and(|v| (1..=5).contains(&v)))
    {
        return Err(ApiError::bad("Please answer every question."));
    }
    let email_hash = auth::hash_token(&format!(
        "{}|{}|{}",
        std::env::var("SESSION_SECRET").unwrap(),
        a.email,
        id
    ));
    let result=sqlx::query("INSERT INTO public.survey_answers (survey_id,user_email_hash) VALUES ($1,$2) ON CONFLICT DO NOTHING").bind(&id).bind(email_hash).execute(&mut *tx).await?;
    if result.rows_affected() == 0 {
        return Err(ApiError::bad("You’ve already answered this survey."));
    }
    let resp = json!({"id":uuid::Uuid::new_v4().to_string(),"s":id,"dept":s(&e,"department"),"band":services::calculations::band(&e),"nps":nps,"sc":scores,"d":today()});
    sqlx::query("INSERT INTO live.responses (id,record) VALUES ($1,$2)")
        .bind(s(&resp, "id"))
        .bind(&resp)
        .execute(&mut *tx)
        .await?;
    next.live["data"]["resp"].as_array_mut().unwrap().push(resp);
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"message":"Thanks. Your answers were saved anonymously.","state":response(&snap,&a).await?}),
    ))
}
async fn attendance_clock(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let id = access::my_emp(&old, &a);
    if id.is_empty() {
        return Err(ApiError::bad(
            "Link your account to an Employee ID in Access control.",
        ));
    }
    let action = s(&body, "action");
    if !["in", "out"].contains(&action) {
        return Err(ApiError::bad("Choose clock in or out."));
    }
    let mut next = old.clone();
    let t = today();
    let time = chrono::Utc::now()
        .with_timezone(&chrono_tz::Asia::Kolkata)
        .format("%H:%M")
        .to_string();
    let mut rows = next.recs("logs");
    let pos = rows
        .iter()
        .position(|r| s(r, "emp") == id && s(r, "date") == t);
    if action == "in" {
        if pos.is_some_and(|i| s(&rows[i], "logout").is_empty()) {
            return Err(ApiError::bad("You are already clocked in."));
        }
        if pos.is_some() {
            return Err(ApiError::bad(
                "A completed time log already exists today. Request regularisation.",
            ));
        }
        registry::add_auto(
            &mut next,
            "logs",
            json!({"emp":id,"date":t,"source":"Portal clock","login":time,"logout":"","place":"Office","startedAt":chrono::Utc::now().timestamp_millis()}),
            &a,
        );
    } else {
        let i = pos.ok_or_else(|| ApiError::bad("Clock in first."))?;
        if !s(&rows[i], "logout").is_empty() {
            return Err(ApiError::bad("Already clocked out."));
        }
        rows[i]["logout"] = json!(time);
        let mut row = rows[i].clone();
        registry::calculate(&next, "logs", &mut row);
        rows[i] = row;
        next.set_recs("logs", rows);
    }
    let log = next
        .live("logs")
        .into_iter()
        .find(|r| s(r, "emp") == id && s(r, "date") == t)
        .unwrap();
    let mut att = next.recs("att");
    if let Some(r) = att
        .iter_mut()
        .find(|r| s(r, "emp") == id && s(r, "date") == t)
    {
        r["in"] = log["login"].clone();
        r["out"] = log["logout"].clone();
        r["hours"] = log["hours"].clone();
        next.set_recs("att", att);
    } else {
        registry::add_auto(
            &mut next,
            "att",
            json!({"emp":id,"date":t,"mark":"Present","in":log["login"],"out":log["logout"],"status":"Recorded"}),
            &a,
        );
    }
    next.audit(&a.email, format!("Clocked {action} {id} on {t} at {time}"));
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(response(&snap, &a).await?))
}
fn money_admin(a: &Actor) -> ApiResult<()> {
    if a.role != "HR Admin" || a.viewas.is_some() {
        return Err(ApiError::forbidden());
    }
    Ok(())
}
async fn money_settings(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let snap = read_snapshot().await?;
    Ok(Json(
        json!({"policy":services::money::policy(&snap),"employees":snap.demo["employees"]}),
    ))
}
async fn money_settings_save(
    headers: HeaderMap,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let mut p: services::money::Policy =
        serde_json::from_value(body).map_err(|e| ApiError::bad(format!("Invalid policy: {e}")))?;
    services::money::validate(&p)?;
    let (mut tx, old) = transaction().await?;
    let current = services::money::policy(&old);
    if p.revision != current.revision {
        return Err(ApiError::conflict());
    }
    p.revision += 1;
    for e in old.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| models::n(e, "ctc") > 0.)
    {
        services::money::salary_with(&p, e, &[])?;
    }
    let value = json!(p);
    sqlx::query(
        "INSERT INTO public.money_policy_history(revision,record,created_by) VALUES($1,$2,$3)",
    )
    .bind(p.revision as i64)
    .bind(&value)
    .bind(&a.email)
    .execute(&mut *tx)
    .await?;
    let mut next = old.clone();
    next.live["settings"]["money"] = value;
    next.audit(
        &a.email,
        format!("Updated money policy revision {}", p.revision),
    );
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(json!({"policy":p,"state":response(&snap,&a).await?})))
}
async fn money_preview(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let snap = read_snapshot().await?;
    let mut e = if s(&body, "employee").is_empty() {
        json!({"id":"preview","ctc":body["ctc"]})
    } else {
        snap.demo["employees"]
            .as_array()
            .unwrap()
            .iter()
            .find(|e| s(e, "id") == s(&body, "employee"))
            .cloned()
            .ok_or_else(ApiError::not_found)?
    };
    if body.get("ctc").is_some() {
        e["ctc"] = body["ctc"].clone();
    }
    if !e["ctc"].is_number() {
        return Err(ApiError::bad("Enter a numeric CTC."));
    }
    let p = if let Some(value) = body.get("policy") {
        let p: services::money::Policy =
            serde_json::from_value(value.clone()).map_err(|_| ApiError::bad("Invalid policy"))?;
        services::money::validate(&p)?;
        p
    } else {
        services::money::policy(&snap)
    };
    let inputs = body["inputs"].as_array().cloned().unwrap_or_default();
    Ok(Json(services::money::salary_with(&p, &e, &inputs)?))
}
async fn money_records(headers: HeaderMap) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let rows = sqlx::query_scalar::<_, Value>(
        "SELECT record FROM public.money_runs ORDER BY created_at DESC",
    )
    .fetch_all(db())
    .await?;
    Ok(Json(json!(rows)))
}
async fn money_run(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let (mut tx, old) = transaction().await?;
    let request = s(&body, "requestId");
    if request.is_empty() || request.len() > 150 {
        return Err(ApiError::bad("A requestId is required."));
    }
    if let Some(record) =
        sqlx::query_scalar::<_, Value>("SELECT record FROM public.money_runs WHERE request_id=$1")
            .bind(request)
            .fetch_optional(&mut *tx)
            .await?
    {
        return Ok(Json(
            json!({"record":record,"state":response(&old,&a).await?}),
        ));
    }
    let month = s(&body, "month");
    if !regex::Regex::new(r"^\d{4}-(0[1-9]|1[0-2])$")
        .unwrap()
        .is_match(month)
    {
        return Err(ApiError::bad("Use a YYYY-MM payroll month."));
    }
    let p = services::money::policy(&old);
    let ids = body["employees"].as_array();
    let mut rows = vec![];
    let mut next = old.clone();
    for e in old.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| s(e, "status") != "Inactive" && ids.is_none_or(|ids| ids.contains(&e["id"])))
    {
        let mut inputs = old.demo["payroll"]["inputs"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|i| {
                s(i, "emp") == s(e, "name")
                    && (s(i, "month").is_empty()
                        || s(i, "month") == month
                        || s(i, "month") == s(&old.demo["payroll"], "month"))
            })
            .cloned()
            .collect::<Vec<_>>();
        inputs.extend(
            old.demo["expenses"]
                .as_array()
                .into_iter()
                .flatten()
                .filter(|r| s(r, "emp") == s(e, "name") && s(r, "status") == "Approved")
                .map(|r| json!({"k":"Reimbursement","amt":r["amt"],"expense":r["id"]})),
        );
        let sal = services::money::salary_with(&p, e, &inputs)?;
        let mut slip = registry::add_auto(
            &mut next,
            "payslips2",
            json!({"emp":e["id"],"month":month,"issued":today(),"gross":sal["gross"],"ded":sal["deductions"],"status":"Issued","calculation":sal}),
            &a,
        );
        slip["employeeName"] = e["name"].clone();
        rows.push(slip);
    }
    if rows.is_empty() {
        return Err(ApiError::bad("Select at least one active employee."));
    }
    let id = uuid::Uuid::new_v4();
    let gross: f64 = rows.iter().map(|r| models::n(r, "gross")).sum();
    let net: f64 = rows.iter().map(|r| models::n(r, "net")).sum();
    let gross = services::calculations::js_fixed(gross, 2);
    let net = services::calculations::js_fixed(net, 2);
    let record = json!({"id":id,"kind":"payroll","requestId":request,"month":month,"policy":p,"rows":rows,"gross":gross,"net":net,"created":now(),"by":a.email});
    sqlx::query("INSERT INTO public.money_runs(id,request_id,kind,period,policy_revision,record,created_by) VALUES($1,$2,'payroll',$3,$4,$5,$6)").bind(id).bind(request).bind(month).bind(p.revision as i64).bind(&record).bind(&a.email).execute(&mut *tx).await?;
    next.demo["payroll"]["step"] = json!(5);
    for claim in next.demo["expenses"].as_array_mut().into_iter().flatten() {
        if s(claim, "status") == "Approved"
            && rows.iter().any(|r| s(r, "employeeName") == s(claim, "emp"))
        {
            claim["status"] = json!("Paid");
            claim["payrollRun"] = json!(id);
        }
    }
    for input in next.demo["payroll"]["inputs"]
        .as_array_mut()
        .into_iter()
        .flatten()
    {
        if s(input, "month").is_empty()
            && rows.iter().any(|r| s(r, "employeeName") == s(input, "emp"))
        {
            input["month"] = json!(month);
        }
    }
    next.demo["payroll"]["runs"].as_array_mut().unwrap().insert(0,json!({"id":id,"m":month,"emps":rows.len(),"gross":gross,"net":net,"d":today(),"policyRevision":p.revision}));
    next.audit(&a.email, format!("Recorded payroll {month} run {id}"));
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"record":record,"state":response(&snap,&a).await?}),
    ))
}
async fn money_settlement(headers: HeaderMap, Json(body): Json<Value>) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    money_admin(&a)?;
    let (mut tx, old) = transaction().await?;
    let e = old.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .find(|e| s(e, "id") == s(&body, "employee"))
        .ok_or_else(ApiError::not_found)?;
    if services::calculations::date(s(&body, "date")).is_none() {
        return Err(ApiError::bad("A valid settlement date is required."));
    }
    let mut record = services::money::settlement(&old, e, &body)?;
    if body["save"] != true {
        return Ok(Json(json!({"record":record})));
    }
    let request = s(&body, "requestId");
    if request.is_empty() {
        return Err(ApiError::bad("A requestId is required."));
    }
    if let Some(r) =
        sqlx::query_scalar::<_, Value>("SELECT record FROM public.money_runs WHERE request_id=$1")
            .bind(request)
            .fetch_optional(&mut *tx)
            .await?
    {
        return Ok(Json(json!({"record":r,"state":response(&old,&a).await?})));
    }
    let id = uuid::Uuid::new_v4();
    record["id"] = json!(id);
    record["kind"] = json!("settlement");
    record["by"] = json!(a.email);
    record["created"] = json!(now());
    sqlx::query("INSERT INTO public.money_runs(id,request_id,kind,employee_id,period,policy_revision,record,created_by) VALUES($1,$2,'settlement',$3,$4,$5,$6,$7)").bind(id).bind(request).bind(s(e,"id")).bind(s(&body,"date")).bind(services::money::policy(&old).revision as i64).bind(&record).bind(&a.email).execute(&mut *tx).await?;
    let mut next = old.clone();
    next.audit(
        &a.email,
        format!("Recorded F&F calculation for {} ({id})", s(e, "id")),
    );
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(
        json!({"record":record,"state":response(&snap,&a).await?}),
    ))
}
async fn module_list(
    headers: HeaderMap,
    Path((_module, table)): Path<(String, String)>,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let snap = read_snapshot().await?;
    if models::TABLES["demo"].get(&table).is_none() {
        return Err(ApiError::not_found());
    }
    Ok(Json(access::scoped(&snap, &a).demo[table].clone()))
}
async fn module_create(
    headers: HeaderMap,
    Path((_module, table)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    module_write(headers, table, body, "create").await
}
async fn module_patch(
    headers: HeaderMap,
    Path((_module, table)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    module_write(headers, table, body, "patch").await
}
async fn module_delete(
    headers: HeaderMap,
    Path((_module, table)): Path<(String, String)>,
    Json(body): Json<Value>,
) -> ApiResult<Json<Value>> {
    module_write(headers, table, body, "delete").await
}
async fn module_write(
    headers: HeaderMap,
    table: String,
    body: Value,
    operation: &str,
) -> ApiResult<Json<Value>> {
    let a = auth::authenticate(&headers).await?;
    let (tx, old) = transaction().await?;
    let meta = models::TABLES["demo"]
        .get(&table)
        .ok_or_else(ApiError::not_found)?;
    if ["role", "clockedIn", "clockStart"].contains(&table.as_str()) {
        return Err(ApiError::bad(
            "This value is derived from the signed-in session or saved time logs.",
        ));
    }
    if table == "audit" && operation != "create" {
        return Err(ApiError::bad("Audit events are append-only."));
    }
    let base = access::scoped(&old, &a);
    let mut draft = base.clone();
    if s(meta, "kind") == "array" {
        let natural = s(meta, "natural");
        let mut record = body
            .get("value")
            .filter(|_| body.get("_row").is_some())
            .unwrap_or(&body)
            .clone();
        if operation == "create" && natural == "id" && record.is_object() && record["id"].is_null()
        {
            record["id"] = json!(uuid::Uuid::new_v4().to_string());
        }
        let rows = draft.demo[&table]
            .as_array_mut()
            .ok_or_else(ApiError::not_found)?;
        let index = if let Some(i) = body["_row"].as_u64() {
            Some(i as usize).filter(|i| *i < rows.len())
        } else {
            rows.iter()
                .position(|r| !record[natural].is_null() && r[natural] == record[natural])
        };
        match operation {
            "create" => {
                if index.is_some() {
                    return Err(ApiError::bad("That record already exists."));
                }
                rows.insert(0, record);
            }
            "patch" => {
                let row = rows
                    .get_mut(index.ok_or_else(ApiError::not_found)?)
                    .unwrap();
                if let (Some(row), Some(fields)) = (row.as_object_mut(), record.as_object()) {
                    for (k, v) in fields {
                        row.insert(k.clone(), v.clone());
                    }
                } else {
                    *row = record;
                }
            }
            "delete" => {
                rows.remove(index.ok_or_else(ApiError::not_found)?);
            }
            _ => unreachable!(),
        }
    } else if operation == "delete" {
        return Err(ApiError::bad("This setting can’t be deleted."));
    } else if let (Some(current), Some(fields)) =
        (draft.demo[&table].as_object_mut(), body.as_object())
    {
        for (k, v) in fields {
            current.insert(k.clone(), v.clone());
        }
    } else {
        if draft.demo[&table].is_object() != body.is_object()
            || draft.demo[&table].is_boolean() != body.is_boolean()
            || draft.demo[&table].is_number() != body.is_number()
        {
            return Err(ApiError::bad(
                "The value does not match this setting's type.",
            ));
        }
        draft.demo[&table] = body.clone();
    }
    let mut next = old.clone();
    if table == "accounts" && operation == "delete" {
        money_admin(&a)?;
        if s(&body, "email") == a.email {
            return Err(ApiError::bad(
                "Disable another account; keep your own administrator account.",
            ));
        }
        next.demo["accounts"] = draft.demo["accounts"].clone();
        next.audit(&a.email, format!("Deleted account {}", s(&body, "email")));
    } else {
        services::sync::apply(&mut next, &base, &draft, &a)?;
    }
    let snap = finish(tx, &old, next, &a).await?;
    Ok(Json(response(&snap, &a).await?))
}

pub fn routes() -> Routes {
    Routes::new()
        .prefix("api")
        .add("health", get(health))
        .add("auth/signin", post(signin))
        .add("auth/signout", post(signout))
        .add("auth/forgot", post(forgot))
        .add("auth/me", get(me))
        .add("auth/refresh", post(refresh))
        .add("state", patch(sync_state))
        .add("attendance/clock", post(attendance_clock))
        .add(
            "money/settings",
            get(money_settings).patch(money_settings_save),
        )
        .add("money/preview", post(money_preview))
        .add("money/records", get(money_records))
        .add("money/run", post(money_run))
        .add("money/settlement", post(money_settlement))
        .add("reg/meta", get(reg_meta))
        .add(
            "reg/{key}",
            get(reg_list)
                .post(reg_create)
                .patch(reg_patch)
                .delete(reg_archive),
        )
        .add(
            "reg/{key}/{id}",
            get(reg_show).patch(reg_patch_id).delete(reg_archive_id),
        )
        .add("reg/{key}/{id}/restore", post(reg_restore))
        .add("access/me", get(access_me))
        .add("access/viewas", post(viewas))
        .add("notifications", get(notifications))
        .add("advanced/{area}", get(advanced_area))
        .add("dashboards/{app}", get(dashboards))
        .add("backup", get(backup))
        .add("backup/import", post(backup_import))
        .add(
            "surveys/{id}/respond",
            get(survey_read).post(survey_respond),
        )
        .add(
            "{module}/{table}",
            get(module_list)
                .post(module_create)
                .patch(module_patch)
                .delete(module_delete),
        )
}
