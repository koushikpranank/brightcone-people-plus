use crate::{
    controllers::{ApiError, ApiResult},
    models::{n, now, s, Snapshot, REG_META, TABLES},
    services::{access, auth::Actor, calculations, registry},
};
use serde_json::{json, Value};
fn key(k: &str, r: &Value, i: usize) -> String {
    for field in ["id", s(&TABLES["demo"][k], "natural")] {
        if let Some(id) = r[field].as_str() {
            return id.into();
        }
    }
    match k {
        "empDocs" => format!("{}|{}", s(r, "emp"), s(r, "doc")),
        "feedback" => format!(
            "{}|{}|{}|{}",
            s(r, "from"),
            s(r, "to"),
            s(r, "d"),
            s(r, "t")
        ),
        "onboard" => s(r, "emp").into(),
        _ => format!("#{i}"),
    }
}
fn merge_fields(current: &Value, base: &Value, next: &Value) -> ApiResult<Value> {
    if !next.is_object() || !base.is_object() {
        if current != base && current != next {
            tracing::warn!("Concurrent edit of scalar or list");
            return Err(ApiError::conflict());
        }
        return Ok(next.clone());
    }
    let mut out = current.clone();
    if !out.is_object() {
        out = json!({})
    }
    let keys = base
        .as_object()
        .unwrap()
        .keys()
        .chain(next.as_object().unwrap().keys())
        .collect::<std::collections::BTreeSet<_>>();
    for k in keys {
        if base[k] != next[k] {
            if current[k] != base[k] && current[k] != next[k] {
                tracing::warn!(field = %k, "Concurrent edit of record field");
                return Err(ApiError::conflict());
            }
            if let Some(v) = next.get(k) {
                out[k] = v.clone()
            } else {
                out.as_object_mut().unwrap().remove(k);
            }
        }
    }
    Ok(out)
}
fn own_demo(a: &Actor, k: &str, r: &Value, old: Option<&Value>) -> bool {
    let owner = |r: &Value| s(r, "emp") == a.name || s(r, "by") == a.name || s(r, "from") == a.name;
    match k {
        "employees" => {
            s(r, "name") == a.name
                && old.is_some_and(|old| {
                    let allowed = ["phone", "address", "emergency", "blood"];
                    old.as_object()
                        .unwrap()
                        .keys()
                        .chain(r.as_object().unwrap().keys())
                        .all(|key| old[key] == r[key] || allowed.contains(&key.as_str()))
                })
        }
        "leaves" | "regs" | "expenses" | "letters" | "assetReqs" | "tickets" | "resignations" => {
            owner(r) && old.is_none_or(owner)
        }
        "goals" | "feedback" | "referrals" => owner(r) && old.is_none_or(owner),
        "empDocs" => owner(r) && s(r, "status") == "Submitted",
        "posts" => {
            s(r, "by") == a.name
                || old.is_some_and(|old| {
                    let mut old = old.clone();
                    let mut new = r.clone();
                    for k in ["likes", "comments"] {
                        old.as_object_mut().unwrap().remove(k);
                        new.as_object_mut().unwrap().remove(k);
                    }
                    old == new
                })
        }
        "sign" => old.is_some_and(|old| s(old, "to") == a.name || s(old, "emp") == a.name),
        "policies" => old.is_some_and(|old| {
            let mut old = old.clone();
            let mut new = r.clone();
            old.as_object_mut().unwrap().remove("ack");
            new.as_object_mut().unwrap().remove("ack");
            old == new
        }),
        "swaps" => owner(r),
        _ => false,
    }
}

pub fn apply(snap: &mut Snapshot, base: &Snapshot, next: &Snapshot, a: &Actor) -> ApiResult<()> {
    let full = a.role == "HR Admin" && a.viewas.is_none();
    for k in TABLES["demo"].as_object().unwrap().keys() {
        if base.demo[k] == next.demo[k] || k == "role" {
            continue;
        }
        if k == "audit" {
            let mut seen = std::collections::HashMap::<String, usize>::new();
            for r in next.demo[k].as_array().into_iter().flatten().rev() {
                let identity = serde_json::to_string(r).unwrap();
                let count = seen.entry(identity).or_default();
                *count += 1;
                let had = base.demo[k]
                    .as_array()
                    .map(|old| old.iter().filter(|old| *old == r).count())
                    .unwrap_or(0);
                if (full || s(r, "who") == a.name) && *count > had {
                    crate::services::auth::demo_audit(snap, &a.name, s(r, "a"));
                }
            }
            continue;
        }
        if let (Some(b), Some(v)) = (base.demo[k].as_array(), next.demo[k].as_array()) {
            if b.iter().chain(v.iter()).any(|r| !r.is_object())
                || (!["empDocs", "feedback", "onboard"].contains(&k.as_str())
                    && b.iter()
                        .chain(v.iter())
                        .any(|r| r[s(&TABLES["demo"][k], "natural")].as_str().is_none()))
            {
                if !full {
                    return Err(ApiError::forbidden());
                }
                if snap.demo[k] != base.demo[k] && snap.demo[k] != next.demo[k] {
                    return Err(ApiError::conflict());
                }
                snap.demo[k] = next.demo[k].clone();
                continue;
            }
            let mut rows = snap.demo[k].as_array().cloned().unwrap_or_default();
            let bm = b
                .iter()
                .enumerate()
                .map(|(i, r)| (key(k, r, i), r))
                .collect::<std::collections::BTreeMap<_, _>>();
            let nm = v
                .iter()
                .enumerate()
                .map(|(i, r)| (key(k, r, i), r))
                .collect::<std::collections::BTreeMap<_, _>>();
            for (id, nr) in &nm {
                let br = bm.get(id).copied().unwrap_or(&Value::Null);
                if br == *nr {
                    continue;
                }
                let pos = rows
                    .iter()
                    .enumerate()
                    .find(|(i, r)| key(k, r, *i) == *id)
                    .map(|(i, _)| i);
                let current = pos.map(|i| rows[i].clone()).unwrap_or(Value::Null);
                let mut merged = merge_fields(&current, br, nr)?;
                let own_candidate =
                    k == "cands"
                        && br.is_null()
                        && ((s(&merged, "n") == a.name
                            && s(&merged, "src") == "Internal"
                            && s(&merged, "s") == "Screening")
                            || (s(&merged, "src") == "Referral"
                                && s(&merged, "s") == "Applied"
                                && next.demo["referrals"].as_array().into_iter().flatten().any(
                                    |r| s(r, "by") == a.name && s(r, "cand") == s(&merged, "n"),
                                )));
                if !full && own_candidate {
                    merged["sc"] = json!(if s(&merged, "src") == "Internal" {
                        85
                    } else {
                        80
                    });
                }
                if !full
                    && !own_candidate
                    && !own_demo(a, k, &merged, (!br.is_null()).then_some(br))
                {
                    return Err(ApiError::forbidden());
                }
                if k == "employees" {
                    if s(&merged, "name").trim().is_empty()
                        || s(&merged, "role").is_empty()
                        || n(&merged, "ctc") < 0.
                    {
                        return Err(ApiError::bad("First name and last name are required."));
                    }
                    if rows.iter().any(|e| {
                        s(e, "id") != s(&merged, "id")
                            && !s(&merged, "email").is_empty()
                            && s(e, "email") == s(&merged, "email")
                    }) {
                        return Err(ApiError::bad(
                            "Another employee already uses this work email.",
                        ));
                    }
                }
                if k == "leaves" {
                    if s(&merged, "reason").starts_with("Adjustment:") {
                        if !full || merged["days"].as_f64().is_none() {
                            return Err(ApiError::forbidden());
                        }
                    } else {
                        let days = calculations::weekdays(s(&merged, "from"), s(&merged, "to"));
                        if days <= 0 {
                            return Err(ApiError::bad("Those dates fall on a weekend."));
                        }
                        merged["days"] = json!(days);
                    }
                }
                for field in match k.as_str() {
                    "employees" => vec!["ctc"],
                    "expenses" => vec!["amt"],
                    "jobs" => vec!["bonus"],
                    _ => vec![],
                } {
                    if merged.get(field).is_some()
                        && (merged[field].as_f64().is_none() || n(&merged, field) < 0.)
                    {
                        return Err(ApiError::bad(format!(
                            "{field} must be a non-negative number."
                        )));
                    }
                }
                if !full
                    && [
                        "leaves",
                        "regs",
                        "expenses",
                        "letters",
                        "assetReqs",
                        "tickets",
                        "resignations",
                    ]
                    .contains(&k.as_str())
                {
                    if br.is_null() {
                        let required = if k == "tickets" { "Open" } else { "Pending" };
                        if s(&merged, "status") != required {
                            return Err(ApiError::forbidden());
                        }
                    } else if merged["status"] != br["status"]
                        && !["Withdrawn", "Cancelled"].contains(&s(&merged, "status"))
                    {
                        return Err(ApiError::forbidden());
                    }
                }
                if k == "audit" && !full {
                    return Err(ApiError::forbidden());
                }
                if k == "accounts" {
                    if !full {
                        return Err(ApiError::forbidden());
                    }
                    merged["fails"] = if s(&merged, "status") == "Active" {
                        json!(0)
                    } else {
                        merged["fails"].clone()
                    };
                }
                if let Some(i) = pos {
                    rows[i] = merged
                } else {
                    rows.insert(0, merged)
                }
            }
            for (id, br) in bm.iter().filter(|(id, _)| !nm.contains_key(*id)) {
                if k == "accounts" {
                    return Err(ApiError::conflict());
                }
                if !full {
                    return Err(ApiError::forbidden());
                }
                if let Some(i) = rows
                    .iter()
                    .enumerate()
                    .position(|(i, r)| key(k, r, i) == *id)
                {
                    if &rows[i] != *br {
                        return Err(ApiError::conflict());
                    }
                    rows.remove(i);
                }
            }
            snap.demo[k] = json!(rows);
        } else {
            if !full {
                if ["clockedIn", "clockStart"].contains(&k.as_str()) {
                } else if ["decl", "dependents", "reviews", "progress"].contains(&k.as_str()) {
                    let changed = next.demo[k].as_object().ok_or_else(ApiError::forbidden)?;
                    if changed
                        .iter()
                        .any(|(name, v)| name != &a.name && base.demo[k][name] != *v)
                    {
                        return Err(ApiError::forbidden());
                    }
                } else {
                    return Err(ApiError::forbidden());
                }
            }
            if ["decl", "dependents", "reviews", "progress"].contains(&k.as_str()) && !full {
                let merged = merge_fields(
                    &snap.demo[k][&a.name],
                    &base.demo[k][&a.name],
                    &next.demo[k][&a.name],
                )?;
                snap.demo[k][&a.name] = merged;
            } else {
                snap.demo[k] = merge_fields(&snap.demo[k], &base.demo[k], &next.demo[k])?;
            }
        }
    }
    // Each changed live record is recalculated and validated on the server.
    let mut keys: Vec<_> = REG_META.as_object().unwrap().keys().cloned().collect();
    keys.sort_by_key(|k| {
        if k == "emp" {
            0
        } else if k == "profile" {
            1
        } else {
            2
        }
    });
    for k in keys {
        let b = base.recs(&k);
        let next_rows = next.recs(&k);
        for nr in next_rows.iter().rev() {
            let id = s(nr, "id");
            let br = b.iter().find(|r| s(r, "id") == id);
            if br == Some(nr) {
                continue;
            }
            let current = snap.recs(&k).into_iter().find(|r| s(r, "id") == id);
            if !access::can_add(snap, a, &k)
                || current
                    .as_ref()
                    .is_some_and(|r| !access::can_see(snap, a, &k, r))
            {
                return Err(ApiError::forbidden());
            }
            let mut merged = merge_fields(
                current.as_ref().unwrap_or(&Value::Null),
                br.unwrap_or(&Value::Null),
                nr,
            )?;
            let master_id = if k == "emp" { id } else { s(nr, "emp") };
            let master_changed = base.demo["employees"]
                .as_array()
                .into_iter()
                .flatten()
                .find(|e| s(e, "id") == master_id)
                != next.demo["employees"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .find(|e| s(e, "id") == master_id);
            let hydration = full
                && ["emp", "profile"].contains(&k.as_str())
                && (current.is_none() || master_changed)
                && snap.demo["employees"]
                    .as_array()
                    .unwrap()
                    .iter()
                    .any(|e| s(e, "id") == if k == "emp" { id } else { s(nr, "emp") });
            if !hydration {
                registry::calculate(snap, &k, &mut merged);
                if merged["_arch"] != true {
                    registry::validate(snap, &k, &merged, current.as_ref(), a)?;
                }
            }
            merged["_u"] = json!(now());
            if current.is_none() {
                merged["_c"] = json!(now());
                merged["_cb"] = json!(a.email);
                merged["_h"] = json!([{"t":now(),"by":a.email,"s":merged["status"].as_str().unwrap_or("Created")}]);
            } else {
                merged["_ub"] = json!(a.email);
                merged["_h"] = current.as_ref().unwrap()["_h"].clone();
                if !merged["_h"].is_array() {
                    merged["_h"] = json!([])
                }
                if current.as_ref().unwrap()["status"] != merged["status"] {
                    let status = merged["status"].clone();
                    merged["_h"]
                        .as_array_mut()
                        .unwrap()
                        .push(json!({"t":now(),"by":a.email,"s":status}));
                }
            }
            let old_status = current
                .as_ref()
                .map(|r| s(r, "status"))
                .unwrap_or("")
                .to_owned();
            let mut rows = snap.recs(&k);
            if let Some(x) = rows.iter_mut().find(|r| s(r, "id") == id) {
                *x = merged.clone()
            } else {
                rows.insert(0, merged.clone())
            }
            snap.set_recs(&k, rows);
            if !hydration {
                registry::after(snap, &k, &mut merged, current.is_none(), &old_status, a);
            }
            let mut rows = snap.recs(&k);
            if let Some(r) = rows.iter_mut().find(|r| s(r, "id") == id) {
                *r = merged;
            }
            snap.set_recs(&k, rows);
        }
    }
    if base.live["settings"] != next.live["settings"] {
        if base.live["settings"]["money"] != next.live["settings"]["money"] {
            return Err(ApiError::bad(
                "Use Money calculations to change salary policy.",
            ));
        }
        if !full {
            return Err(ApiError::forbidden());
        }
        snap.live["settings"] = merge_fields(
            &snap.live["settings"],
            &base.live["settings"],
            &next.live["settings"],
        )?;
    }
    if full && base.live["audit"] != next.live["audit"] {
        let existing = snap.live["audit"].as_array().unwrap().clone();
        let list = snap.live["audit"].as_array_mut().unwrap();
        for entry in next.live["audit"].as_array().into_iter().flatten().rev() {
            if !base.live["audit"]
                .as_array()
                .is_some_and(|a| a.contains(entry))
                && !existing.contains(entry)
            {
                list.insert(0, entry.clone())
            }
        }
        list.truncate(500);
    }
    // Sequence counters can only increase; identifiers remain stable across imported backups.
    for (k, v) in next.live["seq"].as_object().into_iter().flatten() {
        if v.as_u64() > snap.live["seq"][k].as_u64() {
            snap.live["seq"][k] = v.clone();
        }
    }
    Ok(())
}
