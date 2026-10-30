use crate::{
    models::{n, s, today, Snapshot, REG_META},
    services::{access, auth::Actor, calculations::*, rules},
};
use serde_json::{json, Value};
fn compliance_area(key: &str, name: &str, link: &str, items: Vec<Value>) -> Value {
    let due: Vec<_> = items.iter().filter(|r| r["applies"] == true).collect();
    let ok = due.iter().filter(|r| r["ok"] == true).count();
    let gaps = due
        .iter()
        .filter(|r| r["ok"] != true)
        .map(|r| {
            let mut v = (*r).clone();
            v["area"] = json!(name);
            v["link"] = json!(link);
            v
        })
        .collect::<Vec<_>>();
    json!({"key":key,"name":name,"link":link,"total":due.len(),"ok":ok,"score":if due.is_empty(){Value::Null}else{json!((ok as f64/due.len()as f64*100.).round())},"gaps":gaps,"soon":items.iter().filter(|r|r["soon"]==true).collect::<Vec<_>>()})
}
fn item(
    rec: &str,
    r: &Value,
    title: String,
    due: &str,
    applies: bool,
    ok: bool,
    soon: bool,
) -> Value {
    json!({"rec":rec,"id":r["id"].as_str().unwrap_or(""),"emp":r["emp"].as_str().unwrap_or(""),"item":title,"due":due,"applies":applies,"ok":ok,"soon":soon})
}
pub fn compliance(snap: &Snapshot) -> Vec<Value> {
    let t = today();
    let mut areas = vec![];
    let mut stat = vec![];
    for k in ["statutory", "pfesi"] {
        for r in snap.live(k) {
            let (closed, paid, label) = if k == "statutory" {
                (
                    "Completed",
                    "filed",
                    format!("{}, {}", s(&r, "item"), s(&r, "period")),
                )
            } else {
                (
                    "Paid",
                    "paidOn",
                    format!("{} {}", s(&r, "scheme"), s(&r, "month")),
                )
            };
            let due = s(&r, "due");
            stat.push(item(
                k,
                &r,
                label,
                due,
                due <= t.as_str() || s(&r, "status") == closed,
                s(&r, "status") == closed && (s(&r, paid).is_empty() || s(&r, paid) <= due),
                s(&r, "status") != closed && due > t.as_str() && day_diff(&t, due) <= 30,
            ));
        }
    }
    areas.push(compliance_area(
        "stat",
        "Statutory filings",
        "m_statutory",
        stat,
    ));
    let acks = snap
        .live("acks")
        .iter()
        .map(|r| {
            let label = snap
                .recs("policies")
                .iter()
                .find(|p| p["id"] == r["policy"])
                .map(|p| format!("{} v{} ({})", s(p, "name"), s(p, "ver"), s(p, "id")))
                .unwrap_or_else(|| s(r, "policy").into());
            item(
                "acks",
                r,
                label,
                s(r, "due"),
                s(r, "due") <= t.as_str() || s(r, "status") == "Acknowledged",
                s(r, "status") == "Acknowledged",
                false,
            )
        })
        .collect();
    areas.push(compliance_area(
        "acks",
        "Policy acknowledgements",
        "m_acks",
        acks,
    ));
    let act: Vec<_> = snap
        .live("emp")
        .into_iter()
        .filter(|e| s(e, "status") != "Exited")
        .collect();
    let posh = snap.live("posh").iter().any(|p| {
        s(p, "rtype") == "Committee member"
            && s(p, "role") == "Presiding officer"
            && s(p, "status") == "Active"
            && (s(p, "valid").is_empty() || s(p, "valid") >= t.as_str())
    });
    let mut train = snap
        .live("sectrain")
        .iter()
        .map(|r| {
            item(
                "sectrain",
                r,
                s(r, "course").into(),
                s(r, "due"),
                s(r, "due") <= t.as_str() || s(r, "status") == "Completed",
                s(r, "status") == "Completed",
                false,
            )
        })
        .collect::<Vec<_>>();
    train.push(item(
        "posh",
        &json!({}),
        "POSH Internal Committee with a presiding officer".into(),
        "",
        !act.is_empty(),
        posh,
        false,
    ));
    areas.push(compliance_area(
        "train",
        "Mandatory training",
        "m_sectrain",
        train,
    ));
    let mut docs = vec![];
    for e in &act {
        for dt in [
            "PAN",
            "Aadhaar",
            "Address proof",
            "Degree certificate",
            "Appointment letter",
        ] {
            let ok = snap.live("docs").iter().any(|d| {
                d["emp"] == e["id"]
                    && s(d, "dtype") == dt
                    && s(d, "status") == "Verified"
                    && (s(d, "expiry").is_empty() || s(d, "expiry") >= t.as_str())
            });
            docs.push(item(
                "docs",
                &json!({"emp":e["id"]}),
                format!("{dt} not on file or not verified"),
                "",
                true,
                ok,
                false,
            ));
        }
    }
    areas.push(compliance_area(
        "docs",
        "Employee documents",
        "m_docs",
        docs,
    ));
    let prob = snap
        .live("probation")
        .iter()
        .map(|r| {
            let closed = ["Confirmed", "Extended"].contains(&s(r, "status"));
            item(
                "probation",
                r,
                "Probation decision".into(),
                s(r, "end"),
                s(r, "end") <= t.as_str() || closed,
                closed,
                !closed && s(r, "end") > t.as_str() && day_diff(&t, s(r, "end")) <= 30,
            )
        })
        .collect();
    areas.push(compliance_area(
        "prob",
        "Probation decisions",
        "m_probation",
        prob,
    ));
    let mut exits = vec![];
    let ff = n(&snap.live["settings"]["adv"], "ffDays") as i64;
    for r in snap
        .live("exit")
        .iter()
        .filter(|x| s(x, "lwd") < t.as_str())
    {
        let lim = add_days(s(r, "lwd"), ff);
        exits.push(item(
            "exit",
            r,
            "Assets returned".into(),
            s(r, "lwd"),
            true,
            s(r, "assets") != "Pending",
            false,
        ));
        exits.push(item(
            "exit",
            r,
            format!("F&F paid within {ff} days"),
            &lim,
            lim <= t || s(r, "ff") == "Paid",
            s(r, "ff") == "Paid",
            false,
        ));
    }
    for k in ["cards", "assets2"] {
        for r in snap.live(k).iter().filter(|r| {
            !s(r, "emp").is_empty()
                && snap
                    .employee(s(r, "emp"))
                    .is_some_and(|e| s(&e, "status") == "Exited")
        }) {
            let label = if k == "cards" {
                format!("Access card {} returned", s(r, "cardNo"))
            } else {
                format!("Asset {} returned", s(r, "tag"))
            };
            exits.push(item(
                k,
                r,
                label,
                "",
                true,
                s(r, "status") != if k == "cards" { "Active" } else { "Assigned" },
                false,
            ));
        }
    }
    areas.push(compliance_area("exit", "Exits", "m_exit", exits));
    let vendors = snap
        .live("vendors")
        .iter()
        .filter(|v| s(v, "status") == "Active" && !s(v, "end").is_empty())
        .map(|v| {
            item(
                "vendors",
                v,
                format!("{} contract", s(v, "name")),
                s(v, "end"),
                true,
                s(v, "end") >= t.as_str(),
                s(v, "end") >= t.as_str() && day_diff(&t, s(v, "end")) <= 30,
            )
        })
        .collect();
    areas.push(compliance_area(
        "vend",
        "Vendor contracts",
        "m_vendors",
        vendors,
    ));
    let lic = snap
        .live("licences")
        .iter()
        .map(|r| {
            item(
                "licences",
                r,
                format!("{} {}", s(r, "name"), s(r, "no")),
                s(r, "valid"),
                true,
                s(r, "valid").is_empty() || s(r, "valid") >= t.as_str(),
                !s(r, "valid").is_empty()
                    && s(r, "valid") >= t.as_str()
                    && day_diff(&t, s(r, "valid")) <= 30,
            )
        })
        .collect();
    areas.push(compliance_area(
        "lic",
        "Licences & registrations",
        "m_comp",
        lic,
    ));
    areas
}

fn survey_stats(snap: &Snapshot, sv: &Value, dept: Option<&str>) -> Value {
    let id = s(sv, "id");
    let rows = snap.live["data"]["resp"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|r| s(r, "s") == id && dept.is_none_or(|d| s(r, "dept") == d))
        .collect::<Vec<_>>();
    let count = rows.len();
    let visible = count >= n(&snap.live["settings"]["adv"], "minGroup") as usize;
    let p = rows.iter().filter(|r| n(r, "nps") >= 9.).count();
    let d = rows.iter().filter(|r| n(r, "nps") <= 6.).count();
    let avg = s(sv, "stmts")
        .lines()
        .filter(|s| !s.trim().is_empty())
        .enumerate()
        .map(|(i, q)| {
            json!([
                q.trim(),
                if visible {
                    json!(js_fixed(
                        rows.iter()
                            .map(|r| r["sc"][i].as_f64().unwrap_or(0.))
                            .sum::<f64>()
                            / count as f64,
                        2
                    ))
                } else {
                    Value::Null
                }
            ])
        })
        .collect::<Vec<_>>();
    json!({"n":count,"enps":if visible{json!(js_round((p as f64-d as f64)/count as f64*100.))}else{Value::Null},"avg":avg,"rs":[],"hidden":!visible})
}
pub fn survey_groups(snap: &Snapshot, a: &Actor, id: &str) -> Value {
    let Some(sv) = snap.live("surveys").into_iter().find(|r| s(r, "id") == id) else {
        return json!({});
    };
    let scope = access::scope(snap, a, "eng");
    if ["respond", "none"].contains(&scope.as_str()) {
        return json!({});
    }
    let own_dept = snap
        .employee(&access::my_emp(snap, a))
        .map(|e| s(&e, "department").to_owned())
        .unwrap_or_default();
    let depts = snap.live["data"]["resp"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|r| s(r, "s") == id && (scope != "team" || s(r, "dept") == own_dept))
        .map(|r| s(r, "dept").to_owned())
        .collect::<std::collections::BTreeSet<_>>();
    let groups = depts
        .iter()
        .map(|d| (d.clone(), survey_stats(snap, &sv, Some(d))))
        .collect::<serde_json::Map<_, _>>();
    json!({"all":survey_stats(snap,&sv,if scope=="team"{Some(&own_dept)}else{None}),"depts":groups})
}
pub fn performance(snap: &Snapshot, a: &Actor) -> Value {
    let scope = access::scope(snap, a, "perf");
    let employees = snap
        .live("emp")
        .into_iter()
        .filter(|e| {
            s(e, "status") != "Exited"
                && (scope == "summary" || access::emp_visible(snap, a, "perf", s(e, "id")))
        })
        .collect::<Vec<_>>();
    let mut rated = vec![];
    let mut progress = vec![];
    let mut by_dept: Vec<(String, Vec<f64>)> = vec![];
    let mut stale = 0;
    for e in &employees {
        let id = s(e, "id");
        if let Some(r) = rating(snap, a, id).as_f64() {
            rated.push(r)
        }
        let mut apps = snap
            .live("appraisal")
            .into_iter()
            .filter(|r| s(r, "emp") == id)
            .collect::<Vec<_>>();
        apps.sort_by(|a, b| s(b, "due").cmp(s(a, "due")));
        let cycle = apps.first().map(|r| s(r, "cycle")).unwrap_or("");
        let goals = snap
            .live("goals")
            .into_iter()
            .filter(|r| {
                s(r, "emp") == id
                    && (cycle.is_empty() || s(r, "cycle") == cycle)
                    && !["Dropped", "Draft"].contains(&s(r, "status"))
            })
            .collect::<Vec<_>>();
        let weight = goals.iter().map(|r| n(r, "weight")).sum::<f64>();
        if weight != 0. {
            let gp = (goals
                .iter()
                .map(|r| n(r, "weight") * n(r, "progress").min(100.))
                .sum::<f64>()
                / weight)
                .round();
            progress.push(gp);
            let dept = if s(e, "department").is_empty() {
                "Not set"
            } else {
                s(e, "department")
            };
            if let Some((_, v)) = by_dept.iter_mut().find(|(d, _)| d == dept) {
                v.push(gp)
            } else {
                by_dept.push((dept.into(), vec![gp]))
            }
        }
        let mut checks = snap
            .live("checkins")
            .into_iter()
            .filter(|r| s(r, "emp") == id && s(r, "status") == "Completed")
            .collect::<Vec<_>>();
        checks.sort_by(|a, b| s(b, "date").cmp(s(a, "date")));
        if checks
            .first()
            .is_none_or(|r| day_diff(s(r, "date"), &today()) > 60)
        {
            stale += 1;
        }
    }
    let overdue = snap
        .live("appraisal")
        .iter()
        .filter(|r| {
            eff_status(&REG_META["appraisal"], r) == "Overdue"
                && (scope == "summary" || access::emp_visible(snap, a, "perf", s(r, "emp")))
        })
        .count();
    json!({"employees":employees.len(),"rated":rated.len(),"avg":if rated.is_empty(){"—".into()}else{format!("{:.1}",rated.iter().sum::<f64>()/rated.len()as f64)},"goalCompletion":if progress.is_empty(){"—".into()}else{format!("{}%",(progress.iter().sum::<f64>()/progress.len()as f64).round())},"dist":(1..=5).map(|i|json!([format!("Rating {i}"),rated.iter().filter(|r|**r==i as f64).count()])).collect::<Vec<_>>(),"byDept":by_dept.iter().map(|(d,v)|json!([d,(v.iter().sum::<f64>()/v.len()as f64).round()])).collect::<Vec<_>>(),"stale":stale,"odr":overdue})
}
pub fn computed(snap: &Snapshot, a: &Actor) -> Value {
    let scoped = access::scoped(snap, a);
    let full = a.role == "HR Admin" && a.viewas.is_none();
    let salary = snap.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|e| full || s(e, "name") == a.name)
        .map(|e| (s(e, "id").into(), crate::services::money::salary(snap, e)))
        .collect::<serde_json::Map<_, _>>();
    let eligibility = scoped
        .live("emp")
        .iter()
        .filter(|e| {
            !["none", "summary"].contains(&access::scope(snap, a, "promo").as_str())
                && access::emp_visible(snap, a, "promo", s(e, "id"))
        })
        .map(|e| (s(e, "id").into(), eligibility(snap, s(e, "id"))))
        .collect::<serde_json::Map<_, _>>();
    let ratings = scoped
        .live("emp")
        .iter()
        .filter(|e| {
            !["none", "summary"].contains(&access::scope(snap, a, "perf").as_str())
                && access::emp_visible(snap, a, "perf", s(e, "id"))
        })
        .map(|e| (s(e, "id").into(), rating(snap, a, s(e, "id"))))
        .collect::<serde_json::Map<_, _>>();
    let summaries = REG_META
        .as_object()
        .unwrap()
        .iter()
        .filter(|(_, d)| {
            !s(d, "acc").is_empty() && access::scope(snap, a, s(d, "acc")) == "summary"
        })
        .map(|(k, d)| {
            let rows = snap.live(k);
            let counts = rows.iter().fold(serde_json::Map::new(), |mut m, r| {
                let key = eff_status(d, r);
                let v = m.get(&key).and_then(Value::as_u64).unwrap_or(0);
                m.insert(key, json!(v + 1));
                m
            });
            (k.clone(), json!({"total":rows.len(),"counts":counts}))
        })
        .collect::<serde_json::Map<_, _>>();
    let mut comp = if access::scope(snap, a, "comp") != "none" {
        compliance(snap)
    } else {
        vec![]
    };
    if access::scope(snap, a, "comp") == "statutory" {
        comp.retain(|x| s(x, "key") == "stat")
    }
    if access::scope(snap, a, "comp") == "scores" {
        for x in &mut comp {
            x["gaps"] = json!([]);
            x["soon"] = json!([])
        }
    }
    let surveys = snap
        .live("surveys")
        .iter()
        .map(|sv| (s(sv, "id").into(), survey_groups(snap, a, s(sv, "id"))))
        .collect::<serde_json::Map<_, _>>();
    let payslips = snap
        .live("payslips2")
        .into_iter()
        .filter(|r| full || s(r, "emp") == access::my_emp(snap, a))
        .collect::<Vec<_>>();
    let attendance = snap
        .live("att")
        .into_iter()
        .filter(|r| full || s(r, "emp") == access::my_emp(snap, a))
        .collect::<Vec<_>>();
    let logs = snap
        .live("logs")
        .into_iter()
        .filter(|r| full || s(r, "emp") == access::my_emp(snap, a))
        .collect::<Vec<_>>();
    json!({"salary":salary,"attendance":attendance,"logs":logs,"payslips":payslips,"eligibility":eligibility,"ratings":ratings,"performance":performance(snap,a),"summaries":summaries,"compliance":comp,"surveys":surveys,"dueActions":rules::due_actions(snap,a)})
}
pub fn area(snap: &Snapshot, a: &Actor, area: &str) -> Value {
    let scoped = access::scoped(snap, a);
    let keys = REG_META
        .as_object()
        .unwrap()
        .iter()
        .filter(|(_, d)| s(d, "acc") == area)
        .map(|(k, _)| (k.clone(), scoped.live["data"][k].clone()))
        .collect::<serde_json::Map<_, _>>();
    let c = computed(snap, a);
    json!({"scope":access::scope(snap,a,area),"records":keys,"computed":match area{"perf"=>json!({"ratings":c["ratings"],"summaries":c["summaries"]}),"promo"=>json!({"eligibility":c["eligibility"]}),"comp"=>c["compliance"].clone(),"eng"=>c["surveys"].clone(),"act"=>json!({"due":c["dueActions"]}),_=>json!({})}})
}
