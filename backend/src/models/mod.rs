use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use sqlx::{PgConnection, Row};
use std::{collections::BTreeMap, sync::LazyLock};
mod queries;

pub static REG_META: LazyLock<Value> =
    LazyLock::new(|| serde_json::from_str(include_str!("registry.json")).expect("registry"));
pub static TABLES: LazyLock<Value> =
    LazyLock::new(|| serde_json::from_str(include_str!("tables.json")).expect("tables"));
pub static INVENTORY: LazyLock<Value> = LazyLock::new(|| {
    serde_json::from_str(include_str!("../../../specification/inventory.json")).expect("inventory")
});

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq)]
pub struct Snapshot {
    pub demo: Value,
    pub live: Value,
}
impl Snapshot {
    pub fn empty() -> Self {
        Self {
            demo: json!({}),
            live: json!({"data":{},"seq":{},"settings":{},"audit":[]}),
        }
    }
    pub fn recs(&self, k: &str) -> Vec<Value> {
        self.live["data"][k].as_array().cloned().unwrap_or_default()
    }
    pub fn live(&self, k: &str) -> Vec<Value> {
        self.recs(k)
            .into_iter()
            .filter(|r| !r["_arch"].as_bool().unwrap_or(false))
            .collect()
    }
    pub fn set_recs(&mut self, k: &str, rows: Vec<Value>) {
        self.live["data"][k] = json!(rows);
    }
    pub fn employee(&self, id: &str) -> Option<Value> {
        self.recs("emp").into_iter().find(|e| s(e, "id") == id)
    }
    pub fn audit(&mut self, by: &str, a: impl Into<String>) {
        let list = self.live["audit"].as_array_mut().expect("audit");
        list.insert(0, json!({"t":now(),"by":by,"a":a.into()}));
        list.truncate(500);
    }
}
pub fn s<'a>(v: &'a Value, k: &str) -> &'a str {
    v[k].as_str().unwrap_or("")
}
pub fn n(v: &Value, k: &str) -> f64 {
    v[k].as_f64()
        .or_else(|| v[k].as_str().and_then(|x| x.parse().ok()))
        .unwrap_or(0.)
}
pub fn now() -> String {
    chrono::Utc::now().to_rfc3339_opts(chrono::SecondsFormat::Millis, true)
}
pub fn today() -> String {
    chrono::Utc::now()
        .with_timezone(&chrono_tz::Asia::Kolkata)
        .format("%Y-%m-%d")
        .to_string()
}

pub async fn load(db: &mut PgConnection) -> Result<Snapshot, sqlx::Error> {
    let mut snap = Snapshot::empty();
    for group in ["demo", "live"] {
        for (key, meta) in TABLES[group].as_object().unwrap() {
            if group == "demo" && key == "audit" {
                snap.demo[key] = json!(
                    sqlx::query_scalar::<_, Value>(
                        "SELECT record FROM demo.audit ORDER BY position,id LIMIT 500"
                    )
                    .fetch_all(&mut *db)
                    .await?
                );
                continue;
            }
            let rows = queries::select(&mut *db, group, key).await?;
            let val = if s(meta, "kind") == "array" {
                Value::Array(
                    rows.iter()
                        .map(|r| {
                            debug_assert!(!r.id.is_empty());
                            r.record.clone()
                        })
                        .collect(),
                )
            } else {
                rows.first()
                    .map(|r| r.record.clone())
                    .unwrap_or(Value::Null)
            };
            if group == "demo" {
                snap.demo[key] = val
            } else {
                snap.live["data"][key] = val
            }
        }
    }
    for row in sqlx::query("SELECT key,value FROM public.app_meta")
        .fetch_all(&mut *db)
        .await?
    {
        snap.live[row.get::<String, _>("key")] = row.get::<Value, _>("value");
    }
    snap.live["data"]["resp"] = json!(
        sqlx::query_scalar::<_, Value>("SELECT record FROM live.responses ORDER BY d,id")
            .fetch_all(&mut *db)
            .await?
    );
    snap.live["audit"] = json!(
        sqlx::query_scalar::<_, Value>(
            "SELECT record FROM live.audit ORDER BY position,id LIMIT 500"
        )
        .fetch_all(&mut *db)
        .await?
    );
    if let Some(adv) =
        sqlx::query_scalar::<_, Value>("SELECT record FROM live.settings_adv WHERE id")
            .fetch_optional(&mut *db)
            .await?
    {
        snap.live["settings"]["adv"] = adv;
    }
    let quotas = sqlx::query("SELECT id,record FROM live.settings_quotas")
        .fetch_all(&mut *db)
        .await?;
    if !quotas.is_empty() {
        snap.live["settings"]["quotas"] = json!(quotas
            .iter()
            .map(|r| (r.get::<String, _>("id"), r.get::<Value, _>("record")))
            .collect::<serde_json::Map<_, _>>());
    }
    if let Some(prefix) =
        sqlx::query_scalar::<_, String>("SELECT value FROM live.settings_emp_prefix WHERE id")
            .fetch_optional(&mut *db)
            .await?
    {
        snap.live["settings"]["empPrefix"] = json!(prefix);
    }
    Ok(snap)
}

fn rows(value: &Value, meta: &Value) -> BTreeMap<String, (usize, Value)> {
    if s(meta, "kind") != "array" {
        return BTreeMap::from([("singleton".into(), (0, value.clone()))]);
    }
    value
        .as_array()
        .into_iter()
        .flatten()
        .enumerate()
        .map(|(i, r)| {
            let key = r
                .get(s(meta, "natural"))
                .and_then(Value::as_str)
                .map(str::to_owned)
                .unwrap_or_else(|| format!("row-{i:06}"));
            (key, (i, r.clone()))
        })
        .collect()
}
pub async fn persist(
    db: &mut PgConnection,
    old: &Snapshot,
    next: &Snapshot,
) -> Result<(), sqlx::Error> {
    for group in ["demo", "live"] {
        for (key, meta) in TABLES[group].as_object().unwrap() {
            let (a, b) = if group == "demo" {
                (&old.demo[key], &next.demo[key])
            } else {
                (&old.live["data"][key], &next.live["data"][key])
            };
            if a == b {
                continue;
            }
            if group == "demo" && key == "audit" {
                append_audit(db, "demo.audit", a, b).await?;
                continue;
            }
            let before = rows(a, meta);
            let after = rows(b, meta);
            for (id, (pos, record)) in &after {
                if before.get(id) == Some(&(*pos, record.clone())) {
                    continue;
                }
                let mut clean = record.clone();
                if key == "accounts" && group == "demo" {
                    if let Some(o) = clean.as_object_mut() {
                        o.remove("pass");
                        o.remove("pass_hash");
                    }
                }
                queries::upsert(&mut *db, group, key, id, *pos as i32, &clean).await?;
                if key == "accounts" && group == "demo" {
                    let initial_password = if s(record, "role") == "HR Admin" {
                        "Admin@123"
                    } else {
                        "Welcome@123"
                    };
                    let password = record["pass"]
                        .as_str()
                        .filter(|p| !p.is_empty())
                        .or_else(|| (!before.contains_key(id)).then_some(initial_password));
                    if let Some(pass) = password {
                        let hash = crate::services::auth::hash_password(pass);
                        sqlx::query("UPDATE demo.accounts SET pass_hash=$1 WHERE id=$2")
                            .bind(hash)
                            .bind(id)
                            .execute(&mut *db)
                            .await?;
                    }
                }
            }
            for id in before.keys().filter(|id| !after.contains_key(*id)) {
                queries::delete(&mut *db, group, key, id).await?;
            }
        }
    }
    for (k, v) in next
        .live
        .as_object()
        .unwrap()
        .iter()
        .filter(|(k, _)| *k != "data")
    {
        if k == "audit" {
            if old.live[k] != *v {
                append_audit(db, "live.audit", &old.live[k], v).await?;
            }
            continue;
        }
        if old.live[k] == *v {
            continue;
        }
        if k == "settings" {
            sqlx::query("INSERT INTO live.settings_adv(id,record) VALUES(true,$1) ON CONFLICT(id) DO UPDATE SET record=EXCLUDED.record").bind(&v["adv"]).execute(&mut *db).await?;
            sqlx::query("INSERT INTO live.settings_emp_prefix(id,value) VALUES(true,$1) ON CONFLICT(id) DO UPDATE SET value=EXCLUDED.value").bind(s(v,"empPrefix")).execute(&mut *db).await?;
            for (q, n) in v["quotas"].as_object().into_iter().flatten() {
                sqlx::query("INSERT INTO live.settings_quotas(id,record) VALUES($1,$2) ON CONFLICT(id) DO UPDATE SET record=EXCLUDED.record").bind(q).bind(n).execute(&mut *db).await?;
            }
            let mut rest = v.clone();
            for k in ["adv", "quotas", "empPrefix"] {
                rest.as_object_mut().unwrap().remove(k);
            }
            sqlx::query("INSERT INTO public.app_meta(key,value) VALUES('settings',$1) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value").bind(rest).execute(&mut *db).await?;
            continue;
        }
        sqlx::query("INSERT INTO public.app_meta (key,value) VALUES ($1,$2) ON CONFLICT(key) DO UPDATE SET value=EXCLUDED.value").bind(k).bind(v).execute(&mut *db).await?;
    }
    Ok(())
}

/// The UI retains its newest 500 events; PostgreSQL retains the full append-only history.
async fn append_audit(
    db: &mut PgConnection,
    table: &str,
    old: &Value,
    next: &Value,
) -> Result<(), sqlx::Error> {
    let (select, insert) = match table {
        "demo.audit" => (
            "SELECT coalesce(min(position),0)::bigint FROM demo.audit",
            "INSERT INTO demo.audit(id,position,record) VALUES($1,$2,$3)",
        ),
        "live.audit" => (
            "SELECT coalesce(min(position),0)::bigint FROM live.audit",
            "INSERT INTO live.audit(id,position,record) VALUES($1,$2,$3)",
        ),
        _ => return Err(sqlx::Error::Protocol("Unknown audit store".into())),
    };
    let mut counts = BTreeMap::<String, usize>::new();
    for row in old.as_array().into_iter().flatten() {
        *counts.entry(row.to_string()).or_default() += 1;
    }
    let mut added = Vec::new();
    for row in next.as_array().into_iter().flatten() {
        let count = counts.entry(row.to_string()).or_default();
        if *count > 0 {
            *count -= 1;
        } else {
            added.push(row);
        }
    }
    if added.is_empty() {
        return Ok(());
    }
    let minimum: i64 = sqlx::query_scalar(select).fetch_one(&mut *db).await?;
    let first = minimum
        .checked_sub(added.len() as i64)
        .filter(|n| *n >= i32::MIN as i64)
        .ok_or_else(|| sqlx::Error::Protocol("Audit position capacity exceeded".into()))?;
    for (index, row) in added.into_iter().enumerate() {
        sqlx::query(insert)
            .bind(uuid::Uuid::new_v4().to_string())
            .bind((first + index as i64) as i32)
            .bind(row)
            .execute(&mut *db)
            .await?;
    }
    Ok(())
}
