use crate::{
    models::{now, s, today, Snapshot},
    services::{access, auth::Actor, calculations::*, registry::add_auto},
};
use serde_json::{json, Value};
fn source_resolved(snap: &Snapshot, key: &str) -> bool {
    let Some((rk, id)) = key.split_once('|') else {
        return false;
    };
    let tables: &[&str] = match rk {
        "prob" => &["probation"],
        "appr" => &["appraisal"],
        "doc" => &["docs"],
        "stat" => &["statutory", "pfesi"],
        "offer" => &["offers2"],
        "exit" => &["exit"],
        "renew" => &["vendors", "licences"],
        "chk" => {
            let id = id.split('|').next().unwrap_or("");
            return snap.live("checkins").iter().any(|c| {
                s(c, "emp") == id
                    && s(c, "status") == "Completed"
                    && day_diff(s(c, "date"), &today()) <= 60
            });
        }
        _ => return false,
    };
    let row = tables
        .iter()
        .flat_map(|t| snap.recs(t))
        .find(|r| s(r, "id") == id);
    let Some(r) = row else { return true };
    if r["_arch"] == true {
        return true;
    }
    let st = s(&r, "status");
    match rk {
        "prob" => {
            ["Confirmed", "Extended"].contains(&st)
                || snap
                    .live("probrev")
                    .iter()
                    .any(|p| p["emp"] == r["emp"] && s(p, "status") == "Completed")
        }
        "appr" => st == "Completed",
        "doc" => s(&r, "expiry").is_empty() || day_diff(&today(), s(&r, "expiry")) > 30,
        "stat" => ["Completed", "Paid"].contains(&st),
        "offer" => ["Accepted", "Declined"].contains(&st),
        "exit" => st == "Completed" || s(&r, "assets") != "Pending" && s(&r, "ff") == "Paid",
        "renew" => {
            if !s(&r, "cat").is_empty() {
                st != "Active" || day_diff(&today(), s(&r, "end")) > 30
            } else {
                day_diff(&today(), s(&r, "valid")) > 30
            }
        }
        _ => false,
    }
}
pub fn run_rules(snap: &mut Snapshot, a: &Actor) {
    if !access::hr(snap, a) {
        return;
    }
    let t = today();
    let mut pending: Vec<(String, Value)> = vec![];
    let mut add = |rk: &str,
                   cat: &str,
                   r: &Value,
                   title: String,
                   due: &str,
                   src: String,
                   high: bool,
                   key: Option<String>| {
        pending.push((format!("{rk}|{}",key.unwrap_or_else(||s(r,"id").into())),json!({"title":title,"cat":cat,"emp":r["emp"].as_str().unwrap_or(""),"owner":"","pri":if high{"High"}else{"Normal"},"due":due,"remind":"1 day before","repeat":"None","status":"Open","src":src+" (automatic)"})));
    };
    for p in snap.live("probation").iter().filter(|p| {
        !["Confirmed", "Extended"].contains(&s(p, "status"))
            && day_diff(&t, s(p, "end")) <= 15
            && !snap
                .live("probrev")
                .iter()
                .any(|r| r["emp"] == p["emp"] && s(r, "status") == "Completed")
    }) {
        add(
            "prob",
            "Probation",
            p,
            format!(
                "Complete probation review for {}",
                emp_text(snap, s(p, "emp"))
            ),
            s(p, "end"),
            format!("Probation {}", s(p, "id")),
            false,
            None,
        )
    }
    for r in snap.live("appraisal").iter().filter(|r| {
        s(r, "status") != "Completed" && !s(r, "due").is_empty() && day_diff(&t, s(r, "due")) <= 7
    }) {
        add(
            "appr",
            "Appraisal",
            r,
            format!("Chase appraisal for {}", emp_text(snap, s(r, "emp"))),
            s(r, "due"),
            format!("Appraisal {}", s(r, "id")),
            false,
            None,
        )
    }
    for r in snap.live("docs").iter().filter(|r| {
        !s(r, "expiry").is_empty()
            && s(r, "status") != "Rejected"
            && day_diff(&t, s(r, "expiry")) <= 30
    }) {
        add(
            "doc",
            "Documents",
            r,
            format!(
                "Collect renewed {} from {}",
                s(r, "dtype"),
                emp_text(snap, s(r, "emp"))
            ),
            s(r, "expiry"),
            format!("Document {}", s(r, "id")),
            false,
            None,
        )
    }
    for k in ["statutory", "pfesi"] {
        for r in snap.live(k).iter().filter(|r| {
            s(r, "status")
                != if k == "statutory" {
                    "Completed"
                } else {
                    "Paid"
                }
                && day_diff(&t, s(r, "due")) <= 7
        }) {
            add(
                "stat",
                "Compliance",
                r,
                format!(
                    "File {} for {} and record the challan",
                    if s(r, "item").is_empty() {
                        s(r, "scheme")
                    } else {
                        s(r, "item")
                    },
                    if s(r, "period").is_empty() {
                        s(r, "month")
                    } else {
                        s(r, "period")
                    }
                ),
                s(r, "due"),
                format!(
                    "{} {}",
                    if s(r, "item").is_empty() {
                        "PF/ESI"
                    } else {
                        "Statutory"
                    },
                    s(r, "id")
                ),
                true,
                None,
            )
        }
    }
    for r in snap.live("offers2").iter().filter(|r| {
        !["Accepted", "Declined"].contains(&s(r, "status")) && day_diff(&t, s(r, "valid")) <= 2
    }) {
        let cand = snap
            .recs("cands")
            .into_iter()
            .find(|c| c["id"] == r["cand"]);
        let label = cand
            .map(|c| format!("{} ({})", s(&c, "name"), s(&c, "id")))
            .unwrap_or_else(|| s(r, "cand").into());
        add(
            "offer",
            "Onboarding",
            r,
            format!("Follow up offer {} ({label})", s(r, "id")),
            s(r, "valid"),
            format!("Offer {}", s(r, "id")),
            true,
            None,
        )
    }
    for r in snap.live("exit").iter().filter(|r| {
        s(r, "status") != "Completed"
            && day_diff(&t, s(r, "lwd")) <= 7
            && (s(r, "assets") == "Pending" || s(r, "ff") != "Paid")
    }) {
        add(
            "exit",
            "Exit",
            r,
            format!(
                "Complete exit clearance for {}",
                emp_text(snap, s(r, "emp"))
            ),
            s(r, "lwd"),
            format!("Exit {}", s(r, "id")),
            true,
            None,
        )
    }
    for k in ["vendors", "licences"] {
        for r in snap.live(k).iter().filter(|r| {
            if k == "vendors" {
                s(r, "status") == "Active"
                    && !s(r, "end").is_empty()
                    && day_diff(&t, s(r, "end")) <= 30
            } else {
                !s(r, "valid").is_empty() && day_diff(&t, s(r, "valid")) <= 30
            }
        }) {
            let vendor = !s(r, "cat").is_empty();
            add(
                "renew",
                "Compliance",
                r,
                if vendor {
                    format!("Renew or close vendor contract: {}", s(r, "name"))
                } else {
                    format!("Renew {} ({})", s(r, "name"), s(r, "no"))
                },
                if s(r, "end").is_empty() {
                    s(r, "valid")
                } else {
                    s(r, "end")
                },
                format!(
                    "{} {}",
                    if vendor { "Vendor" } else { "Licence" },
                    s(r, "id")
                ),
                false,
                None,
            )
        }
    }
    for e in snap.live("emp").iter().filter(|e| {
        s(e, "status") != "Exited"
            && snap
                .live("goals")
                .iter()
                .any(|g| g["emp"] == e["id"] && ["Active", "At risk"].contains(&s(g, "status")))
            && !snap.live("checkins").iter().any(|c| {
                c["emp"] == e["id"]
                    && s(c, "status") == "Completed"
                    && day_diff(s(c, "date"), &t) <= 60
            })
            && !s(e, "doj").is_empty()
            && day_diff(s(e, "doj"), &t) > 60
    }) {
        let mut src = e.clone();
        src["emp"] = e["id"].clone();
        add(
            "chk",
            "Performance",
            &src,
            format!("Schedule a check-in with {}", emp_text(snap, s(e, "id"))),
            &add_days(&t, 7),
            format!("Employee {}", s(e, "id")),
            false,
            Some(format!("{}|{}", s(e, "id"), &t[..7])),
        )
    }
    for (key, vals) in pending {
        if snap.recs("actions").iter().any(|r| s(r, "rk") == key) {
            continue;
        }
        let r = add_auto(snap, "actions", vals, a);
        let mut rows = snap.recs("actions");
        rows.iter_mut().find(|x| x["id"] == r["id"]).unwrap()["rk"] = json!(key);
        snap.set_recs("actions", rows);
    }
    let mut actions = snap.recs("actions");
    for r in actions.iter_mut().filter(|r| {
        !s(r, "rk").is_empty()
            && r["_arch"] != true
            && !["Done", "Cancelled"].contains(&s(r, "status"))
    }) {
        if source_resolved(snap, s(r, "rk")) {
            r["status"] = json!("Done");
            r["_u"] = json!(now());
            r["_h"]
                .as_array_mut()
                .unwrap()
                .push(json!({"t":now(),"by":"system","s":"Done (source resolved)"}));
        }
    }
    snap.set_recs("actions", actions);
}
pub fn due_actions(snap: &Snapshot, a: &Actor) -> usize {
    snap.live("actions")
        .iter()
        .filter(|r| {
            access::can_see(snap, a, "actions", r)
                && !["Done", "Cancelled", "Snoozed"].contains(&s(r, "status"))
                && !s(r, "due").is_empty()
                && s(r, "due") <= today().as_str()
                && (access::hr(snap, a)
                    || !access::my_emp(snap, a).is_empty()
                        && s(r, "owner") == access::my_emp(snap, a))
        })
        .count()
}
