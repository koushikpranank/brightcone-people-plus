use crate::{
    models::{s, Snapshot, INVENTORY, REG_META},
    services::auth::Actor,
};
use serde_json::{json, Value};
use std::collections::HashSet;
pub fn real_role(snap: &Snapshot, a: &Actor) -> String {
    snap.live["settings"]["acc"][&a.email]["role"]
        .as_str()
        .unwrap_or(if a.role == "HR Admin" {
            "HR Admin"
        } else {
            "Employee"
        })
        .to_owned()
}
pub fn role(snap: &Snapshot, a: &Actor) -> String {
    if real_role(snap, a) == "HR Admin" {
        a.viewas.clone().unwrap_or_else(|| real_role(snap, a))
    } else {
        real_role(snap, a)
    }
}
pub fn my_emp(snap: &Snapshot, a: &Actor) -> String {
    s(&snap.live["settings"]["acc"][&a.email], "emp").to_owned()
}
pub fn scope(snap: &Snapshot, a: &Actor, area: &str) -> String {
    INVENTORY["ACC"][area][role(snap, a)]
        .as_str()
        .unwrap_or("none")
        .to_owned()
}
pub fn hr(snap: &Snapshot, a: &Actor) -> bool {
    ["HR Admin", "HR Executive"].contains(&role(snap, a).as_str())
}
pub fn team(snap: &Snapshot, id: &str) -> HashSet<String> {
    let mut out = HashSet::new();
    if id.is_empty() {
        return out;
    }
    let mut frontier = vec![id.to_owned()];
    while !frontier.is_empty() {
        let mut next = vec![];
        for e in snap.live("emp") {
            let eid = s(&e, "id");
            if frontier.iter().any(|f| f == s(&e, "manager"))
                && eid != id
                && out.insert(eid.to_owned())
            {
                next.push(eid.to_owned())
            }
        }
        frontier = next;
    }
    out
}
pub fn emp_visible(snap: &Snapshot, a: &Actor, area: &str, id: &str) -> bool {
    let me = my_emp(snap, a);
    match scope(snap, a, area).as_str() {
        "all" | "view" | "pay" | "statutory" | "scores" | "assigned" => true,
        "team" => id == me || team(snap, &me).contains(id),
        "teamx" => id != me && team(snap, &me).contains(id),
        "own" | "ownshared" | "respond" => !me.is_empty() && id == me,
        _ => false,
    }
}
pub fn can_see(snap: &Snapshot, a: &Actor, k: &str, r: &Value) -> bool {
    let d = &REG_META[k];
    let area = s(d, "acc");
    // The original gives all generic registers to admin navigation only.
    if area.is_empty() {
        if a.role == "HR Admin" && a.viewas.is_none() || hr(snap, a) {
            return true;
        }
        return match k {
            "surveys" => scope(snap, a, "eng") != "none",
            "structure" => scope(snap, a, "pay") == "all",
            "appraisal" | "reviews" => {
                !["none", "summary"].contains(&scope(snap, a, "perf").as_str())
                    && emp_visible(snap, a, "perf", s(r, "emp"))
            }
            "statutory" | "pfesi" => scope(snap, a, "comp") == "statutory",
            _ => false,
        };
    }
    let sc = scope(snap, a, area);
    let me = my_emp(snap, a);
    if ["none", "summary"].contains(&sc.as_str()) {
        return false;
    }
    if k == "pips" {
        if sc == "assigned" {
            return !me.is_empty() && s(r, "hrp") == me;
        }
        if sc == "ownshared" {
            return !me.is_empty() && s(r, "emp") == me && s(r, "shared") == "Yes";
        }
    }
    if k == "promos" && sc == "teamx" {
        return s(r, "emp") != me
            && (team(snap, &me).contains(s(r, "emp")) || s(r, "nomBy") == me && !me.is_empty());
    }
    if k == "actions" {
        if sc == "all" {
            return true;
        }
        let own = (!me.is_empty() && s(r, "owner") == me) || s(r, "_cb") == a.email;
        return if sc == "team" {
            own || team(snap, &me).contains(s(r, "owner")) || team(snap, &me).contains(s(r, "emp"))
        } else {
            sc == "own" && own
        };
    }
    emp_visible(snap, a, area, s(r, d["accEmp"].as_str().unwrap_or("emp")))
}
pub fn can_add(snap: &Snapshot, a: &Actor, k: &str) -> bool {
    let d = &REG_META[k];
    let area = s(d, "acc");
    if area.is_empty() {
        return a.role == "HR Admin" && a.viewas.is_none() || hr(snap, a);
    }
    let sc = scope(snap, a, area);
    if [
        "none",
        "summary",
        "view",
        "pay",
        "respond",
        "scores",
        "statutory",
    ]
    .contains(&sc.as_str())
    {
        return false;
    }
    if k == "pips" && sc == "ownshared" {
        return false;
    }
    if k == "succession" {
        return role(snap, a) == "HR Admin";
    }
    true
}
pub fn access(snap: &Snapshot, a: &Actor) -> Value {
    let scopes = INVENTORY["ACC"]
        .as_object()
        .unwrap()
        .keys()
        .map(|k| (k.clone(), json!(scope(snap, a, k))))
        .collect::<serde_json::Map<_, _>>();
    json!({"realRole":real_role(snap,a),"curRole":role(snap,a),"myEmp":my_emp(snap,a),"scopes":scopes})
}
pub fn scoped(snap: &Snapshot, a: &Actor) -> Snapshot {
    let mut out = snap.clone();
    let full = a.role == "HR Admin" && a.viewas.is_none();
    for k in REG_META.as_object().unwrap().keys() {
        let rows = snap
            .recs(k)
            .into_iter()
            .filter(|r| can_see(snap, a, k, r))
            .map(|mut r| {
                if k == "appraisal" && role(snap, a) == "Employee" && s(&r, "released") != "Yes" {
                    r["rating"] = Value::Null;
                }
                r
            })
            .collect();
        out.set_recs(k, rows);
    }
    // Employee labels needed for own/team references; do not expose personal data or CTC.
    if !full {
        let emps = snap
            .live("emp")
            .into_iter()
            .filter(|e| {
                INVENTORY["ACC"]
                    .as_object()
                    .unwrap()
                    .keys()
                    .any(|area| emp_visible(snap, a, area, s(e, "id")))
            })
            .map(|e| {
                let mut m = serde_json::Map::new();
                for k in [
                    "id",
                    "first",
                    "last",
                    "department",
                    "designation",
                    "location",
                    "manager",
                    "doj",
                    "status",
                    "grade",
                    "type",
                ] {
                    if let Some(v) = e.get(k) {
                        m.insert(k.into(), v.clone());
                    }
                }
                Value::Object(m)
            })
            .collect();
        out.set_recs("emp", emps);
        for key in [
            "leaves",
            "regs",
            "expenses",
            "tickets",
            "letters",
            "empDocs",
            "assetReqs",
            "goals",
            "resignations",
            "referrals",
        ] {
            if let Some(arr) = snap.demo[key].as_array() {
                out.demo[key] = json!(arr
                    .iter()
                    .filter(|r| s(r, "emp") == a.name || s(r, "by") == a.name)
                    .collect::<Vec<_>>());
            }
        }
        if let Some(arr) = out.demo["employees"].as_array_mut() {
            for e in arr {
                if s(e, "name") != a.name {
                    for k in [
                        "ctc",
                        "address",
                        "emergency",
                        "blood",
                        "dob",
                        "pan",
                        "uan",
                        "bank",
                        "aadhaar",
                        "acct",
                        "ifsc",
                    ] {
                        e.as_object_mut().unwrap().remove(k);
                    }
                }
            }
        }
        for k in ["reviews", "progress", "decl", "dependents"] {
            let own = snap.demo[k][&a.name].clone();
            out.demo[k] = json!({&a.name:own});
        }
        out.demo["accounts"] = json!(snap.demo["accounts"]
            .as_array()
            .unwrap()
            .iter()
            .filter(|x| s(x, "email") == a.email)
            .collect::<Vec<_>>());
        for key in ["onboard", "swaps", "assets"] {
            out.demo[key] = json!(snap.demo[key]
                .as_array()
                .into_iter()
                .flatten()
                .filter(|r| s(r, "emp") == a.name)
                .collect::<Vec<_>>());
        }
        out.demo["feedback"] = json!(snap.demo["feedback"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|r| s(r, "from") == a.name || s(r, "to") == a.name)
            .collect::<Vec<_>>());
        out.demo["sign"] = json!(snap.demo["sign"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|r| s(r, "to") == a.name)
            .collect::<Vec<_>>());
        let mine = snap.demo["referrals"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|r| s(r, "by") == a.name)
            .map(|r| s(r, "cand"))
            .collect::<Vec<_>>();
        out.demo["cands"] = json!(snap.demo["cands"]
            .as_array()
            .into_iter()
            .flatten()
            .filter(|r| s(r, "n") == a.name || mine.contains(&s(r, "n")))
            .collect::<Vec<_>>());
        out.demo["interviews"] = json!([]);
        if let Some(payroll) = out.demo["payroll"].as_object_mut() {
            payroll.insert(
                "inputs".into(),
                json!(snap.demo["payroll"]["inputs"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .filter(|r| s(r, "emp") == a.name)
                    .collect::<Vec<_>>()),
            );
            payroll.insert(
                "runs".into(),
                json!(snap.demo["payroll"]["runs"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .map(|r| json!({"m":r["m"],"d":r["d"]}))
                    .collect::<Vec<_>>()),
            );
        }
        out.demo["audit"] = json!([]);
        out.live["audit"] = json!([]);
        let own = snap.live["settings"]["acc"][&a.email].clone();
        out.live["settings"]["acc"] = json!({&a.email:own});
    }
    // Survey response rows and other users' participation never cross the API boundary.
    out.live["data"]["resp"] = json!([]);
    let answered = snap.live["settings"]["answered"]
        .as_object()
        .map(|m| {
            m.iter()
                .map(|(k, v)| {
                    (
                        k.clone(),
                        json!(if v
                            .as_array()
                            .is_some_and(|list| list.iter().any(|x| x == &json!(a.email)))
                        {
                            vec![a.email.clone()]
                        } else {
                            vec![]
                        }),
                    )
                })
                .collect::<serde_json::Map<_, _>>()
        })
        .unwrap_or_default();
    out.live["settings"]["answered"] = json!(answered);
    if !full {
        if let Some(money) = out.live["settings"].as_object_mut() {
            money.remove("money");
        }
    }
    for account in out.demo["accounts"].as_array_mut().into_iter().flatten() {
        if let Some(fields) = account.as_object_mut() {
            fields.remove("pass");
            fields.remove("pass_hash");
        }
    }
    out
}
