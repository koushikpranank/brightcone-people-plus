use crate::{
    controllers::{ApiError, ApiResult},
    models::{now, s, today, Snapshot},
    services::{access, auth::Actor, calculations::*, registry::add_auto},
};
use serde_json::{json, Value};
pub fn checklist(snap: &mut Snapshot, e: &Value, a: &Actor) -> usize {
    let base = if s(e, "doj").is_empty() {
        today()
    } else {
        s(e, "doj").to_owned()
    };
    let tasks = [
        ("Offer letter signed and filed", -3),
        ("ID, address and education documents verified", 0),
        ("Work email and system accounts created", 0),
        ("Laptop and accessories issued", 0),
        ("Access card issued", 1),
        ("Bank, PAN and PF details collected", 3),
        ("Induction and policy walkthrough", 3),
        ("30-day check-in with manager", 30),
    ];
    let mut n = 0;
    for (task, offset) in tasks {
        if !snap
            .live("onboard2")
            .iter()
            .any(|x| x["emp"] == e["id"] && s(x, "task") == task)
        {
            add_auto(
                snap,
                "onboard2",
                json!({"emp":e["id"],"task":task,"due":add_days(&base,offset),"status":"Pending"}),
                a,
            );
            n += 1
        }
    }
    n
}
pub fn converted(snap: &mut Snapshot, source: &Value, e: &Value, a: &Actor) -> ApiResult<()> {
    if source.is_null() {
        return Ok(());
    }
    if !access::hr(snap, a) {
        return Err(ApiError::forbidden());
    }
    let kind = s(source, "kind");
    let id = s(source, "id");
    let table = if kind == "candidate" {
        "cands"
    } else if kind == "intern" {
        "interns"
    } else {
        return Err(ApiError::bad("Invalid conversion"));
    };
    let mut rows = snap.recs(table);
    let r = rows
        .iter_mut()
        .find(|x| s(x, "id") == id && x["_arch"] != true)
        .ok_or_else(ApiError::not_found)?;
    if !s(r, "empId").is_empty() {
        return Err(ApiError::bad("This person has already been converted."));
    }
    r["empId"] = e["id"].clone();
    r[if kind == "candidate" {
        "stage"
    } else {
        "status"
    }] = json!(if kind == "candidate" {
        "Joined"
    } else {
        "Converted"
    });
    let reqid = s(r, "req").to_owned();
    if !r["_h"].is_array() {
        r["_h"] = json!([])
    }
    r["_h"].as_array_mut().unwrap().push(json!({"t":now(),"by":a.email,"s":format!("{} {}",if kind=="candidate"{"Joined as"}else{"Converted to"},s(e,"id"))}));
    snap.set_recs(table, rows);
    if kind == "candidate" {
        let mut offers = snap.recs("offers2");
        offers.sort_by(|a, b| s(b, "odate").cmp(s(a, "odate")));
        if let Some(o) = offers
            .iter_mut()
            .find(|o| s(o, "cand") == id && o["_arch"] != true)
        {
            o["status"] = json!("Accepted");
            if o["ctc"].is_number() {
                let mut es = snap.recs("emp");
                if let Some(emp) = es.iter_mut().find(|x| x["id"] == e["id"]) {
                    emp["ctc"] = o["ctc"].clone();
                }
                snap.set_recs("emp", es);
            }
        }
        snap.set_recs("offers2", offers);
        let joined = snap
            .live("cands")
            .iter()
            .filter(|c| s(c, "req") == reqid && s(c, "stage") == "Joined")
            .count();
        let mut reqs = snap.recs("manpower");
        if let Some(req) = reqs.iter_mut().find(|x| s(x, "id") == reqid) {
            if joined as f64 >= crate::models::n(req, "positions") {
                req["status"] = json!("Closed")
            }
        }
        snap.set_recs("manpower", reqs);
    }
    add_auto(
        snap,
        "joining",
        json!({"emp":e["id"],"doj":e["doj"],"docs":"Not started","status":"Pending"}),
        a,
    );
    checklist(snap, e, a);
    snap.audit(
        &a.email,
        format!("Converted {kind} {id} to employee {}", s(e, "id")),
    );
    Ok(())
}
