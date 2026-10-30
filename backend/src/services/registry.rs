use crate::{
    controllers::{ApiError, ApiResult},
    models::{n, now, s, today, Snapshot, REG_META},
    services::{access, auth::Actor, calculations::*},
};
use serde_json::{json, Value};

pub fn next_id(snap: &mut Snapshot, k: &str) -> String {
    let prefix = if k == "emp" {
        s(&snap.live["settings"], "empPrefix").to_owned()
    } else {
        s(&REG_META[k], "idp").to_owned()
    };
    let mut seq = snap.live["seq"][k].as_u64().unwrap_or(0);
    loop {
        seq += 1;
        let id = format!("{prefix}{seq:04}");
        if !snap.recs(k).iter().any(|r| s(r, "id") == id) {
            snap.live["seq"][k] = json!(seq);
            return id;
        }
    }
}
pub fn warning(snap: &Snapshot, k: &str, r: &Value) -> String {
    if k == "leaves2" && !["Rejected", "Cancelled"].contains(&s(r, "status")) {
        let quota = snap.live["settings"]["quotas"][s(r, "ltype")]
            .as_f64()
            .unwrap_or(0.);
        if quota != 0. {
            let balance = quota
                - taken_days(
                    snap,
                    s(r, "emp"),
                    s(r, "ltype"),
                    s(r, "from").get(..4).unwrap_or(""),
                    s(r, "id"),
                );
            if n(r, "days") > balance {
                return format!(
                    "Only {balance} day(s) of {} left this year.",
                    s(r, "ltype").to_lowercase()
                );
            }
        }
    }
    if k == "goals" {
        let total = snap
            .live("goals")
            .iter()
            .filter(|g| {
                s(g, "emp") == s(r, "emp")
                    && s(g, "cycle") == s(r, "cycle")
                    && s(g, "status") != "Dropped"
            })
            .map(|g| n(g, "weight"))
            .sum::<f64>();
        if total != 100. {
            return format!("weights for {} total {total}%, not 100%.", s(r, "cycle"));
        }
    }
    String::new()
}
pub fn default_values(snap: &Snapshot, k: &str, a: &Actor) -> Value {
    let mut defaults = REG_META[k]["defaults"].clone();
    if !defaults.is_object() {
        defaults = json!({})
    }
    let key = match k {
        "att" | "logs" | "feedback" | "checkins" => Some("date"),
        "wfh" => Some("reqOn"),
        "sectrain" => Some("assigned"),
        "acks" => Some("sent"),
        "actions" => Some("due"),
        _ => None,
    };
    if let Some(key) = key {
        defaults[key] = json!(today());
    }
    if k == "surveys" {
        defaults["open"] = json!(today());
        defaults["close"] = json!(add_days(&today(), 14));
    }
    if k == "promos" {
        defaults["nomBy"] = json!(access::my_emp(snap, a));
    }
    defaults
}
pub fn add_auto(snap: &mut Snapshot, k: &str, mut vals: Value, a: &Actor) -> Value {
    let id = next_id(snap, k);
    vals["id"] = json!(id);
    vals["_c"] = json!(now());
    vals["_u"] = vals["_c"].clone();
    vals["_cb"] = json!(a.email);
    calculate(snap, k, &mut vals);
    let st = REG_META[k]["st"]
        .as_str()
        .map(|key| vals[key].clone())
        .unwrap_or(json!("Created"));
    vals["_h"] = json!([{"t":vals["_c"],"by":a.email,"s":st}]);
    let mut rows = snap.recs(k);
    rows.insert(0, vals.clone());
    snap.set_recs(k, rows);
    snap.audit(
        &a.email,
        format!(
            "Created {} {id} (automatic)",
            s(&REG_META[k], "one").to_lowercase()
        ),
    );
    vals
}

pub fn calculate(snap: &Snapshot, k: &str, r: &mut Value) {
    round_money(k, r);
    let t = today();
    match k {
        "emp" => {
            if s(r, "probEnd").is_empty() && !s(r, "doj").is_empty() {
                r["probEnd"] = json!(add_months(s(r, "doj"), 6))
            }
        }
        "probation" => {
            if s(r, "status") == "Extended" && !s(r, "extTill").is_empty() {
                r["end"] = r["extTill"].clone()
            }
        }
        "docs" => {
            if !s(r, "expiry").is_empty()
                && s(r, "expiry") < t.as_str()
                && s(r, "status") != "Rejected"
            {
                r["status"] = json!("Expired")
            }
        }
        "increments" | "revisions" => {
            let (prev, next) = if k == "increments" {
                ("prev", "next")
            } else {
                ("cur", "rev")
            };
            r["pct"] = if n(r, prev) != 0. {
                json!(js_fixed((n(r, next) - n(r, prev)) / n(r, prev) * 100., 2))
            } else {
                json!("")
            }
        }
        "joining" => {
            let count = ["idcard", "mail", "laptop", "bankd", "pf", "appt"]
                .iter()
                .filter(|k| s(r, k) == "Yes")
                .count();
            if count == 6 && s(r, "docs") == "All collected" {
                r["status"] = json!("Completed")
            } else if s(r, "status") == "Completed" || count > 0 && s(r, "status") == "Pending" {
                r["status"] = json!("In progress")
            }
        }
        "onboard2" => {
            if s(r, "status") == "Completed" && s(r, "done").is_empty() {
                r["done"] = json!(t)
            }
        }
        "att" | "logs" => {
            let (a, b) = if k == "att" {
                ("in", "out")
            } else {
                ("login", "logout")
            };
            r["hours"] = hours(s(r, a), s(r, b));
        }
        "leaves2" => {
            r["days"] = json!(if s(r, "half") == "Yes" {
                0.5
            } else {
                weekdays(s(r, "from"), s(r, "to")) as f64
            })
        }
        "wfh" => {
            let notice = day_diff(s(r, "reqOn"), s(r, "date"));
            r["notice"] = json!(notice);
            let same = snap
                .live("wfh")
                .iter()
                .filter(|x| {
                    s(x, "emp") == s(r, "emp")
                        && s(x, "id") != s(r, "id")
                        && s(x, "date").get(..7) == s(r, "date").get(..7)
                        && s(x, "status") != "Rejected"
                })
                .count();
            let mut f = vec![];
            if notice < 15 {
                f.push("Under 15 days notice")
            }
            if same >= 1 {
                f.push("2nd WFH this month")
            }
            r["flag"] = json!(if f.is_empty() {
                "Within policy".into()
            } else {
                f.join("; ")
            });
        }
        "compoff" => {
            if !s(r, "availed").is_empty() && s(r, "status") == "Approved" {
                r["status"] = json!("Availed")
            }
        }
        "holidays2" => {
            r["day"] = json!(date(s(r, "date"))
                .map(|d| d.format("%A").to_string())
                .unwrap_or_default());
            if s(r, "loc").is_empty() {
                r["loc"] = json!("All locations")
            }
        }
        "payroll2" => {
            r["pdays"] = json!(n(r, "wdays") - n(r, "lop"));
            r["net"] = json!(n(r, "gross") - n(r, "ded"));
        }
        "payslips2" => r["net"] = json!(n(r, "gross") - n(r, "ded")),
        "structure" => {
            r["mgross"] = json!(["basic", "hra", "special", "other"]
                .iter()
                .map(|k| n(r, k))
                .sum::<f64>())
        }
        "pfesi" => {
            r["total"] = json!(n(r, "ee") + n(r, "er"));
            if !s(r, "paidOn").is_empty() && s(r, "status") == "Pending" {
                r["status"] = json!("Paid")
            }
        }
        "statutory" => {
            if !s(r, "filed").is_empty() && s(r, "status") == "Pending" {
                r["status"] = json!("Completed")
            }
        }
        "feedback" => {
            if s(r, "anon") == "Yes" {
                r["emp"] = json!("")
            }
        }
        "sectrain" => {
            if !s(r, "done").is_empty() {
                r["status"] = json!("Completed")
            }
        }
        "acks" => {
            if !s(r, "ackOn").is_empty() {
                r["status"] = json!("Acknowledged")
            }
        }
        "officeexp" => r["total"] = json!(n(r, "amount") + n(r, "gst")),
        "goals" => {
            if s(r, "status") == "Active"
                && !s(r, "due").is_empty()
                && day_diff(&t, s(r, "due")) <= 14
                && n(r, "progress") < 70.
            {
                r["status"] = json!("At risk")
            }
            if n(r, "progress") >= 100. && ["Active", "At risk"].contains(&s(r, "status")) {
                r["status"] = json!("Achieved")
            }
        }
        "checkins" | "pips" => {
            if s(r, "mgr").is_empty() {
                r["mgr"] = snap
                    .employee(s(r, "emp"))
                    .map(|e| e["manager"].clone())
                    .unwrap_or(json!(""))
            }
        }
        "promos" => {
            let id = s(r, "emp");
            if let Some(e) = snap.employee(id).filter(|_| s(r, "status") != "Effected") {
                r["curDes"] = e["designation"].clone();
                r["curGrade"] = e["grade"].clone();
                r["curCtc"] = snap
                    .live("structure")
                    .iter()
                    .find(|st| s(st, "emp") == s(r, "emp") && s(st, "status") == "Active")
                    .map(|st| json!(n(st, "ctc")))
                    .unwrap_or(json!(""));
                r["rating"] = latest_appraisal(snap, s(r, "emp"))
                    .map(|a| a["rating"].clone())
                    .unwrap_or(json!(""));
                let el = eligibility(snap, s(r, "emp"));
                r["elig"] = json!(if el["ok"] == true {
                    "Eligible".into()
                } else {
                    format!(
                        "Not yet: {}",
                        el["why"]
                            .as_array()
                            .unwrap()
                            .iter()
                            .filter_map(Value::as_str)
                            .collect::<Vec<_>>()
                            .join("; ")
                    )
                });
            }
            r["pct"] = if n(r, "curCtc") != 0. && n(r, "propCtc") != 0. {
                json!(js_fixed(
                    (n(r, "propCtc") - n(r, "curCtc")) / n(r, "curCtc") * 100.,
                    2
                ))
            } else {
                json!("")
            }
        }
        _ => {}
    }
    round_money(k, r);
}
fn round_money(k: &str, r: &mut Value) {
    for field in REG_META[k]["f"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|f| s(f, "t") == "money")
    {
        let key = s(field, "k");
        if let Some(value) = r[key].as_f64() {
            r[key] = json!(js_fixed(value, 2));
        }
    }
}
fn re(pattern: &str, v: &str) -> bool {
    regex::Regex::new(pattern).unwrap().is_match(v)
}
pub fn validate(
    snap: &Snapshot,
    k: &str,
    v: &Value,
    old: Option<&Value>,
    a: &Actor,
) -> ApiResult<()> {
    let meta = &REG_META[k];
    let fail = |m: &str| Err(ApiError::bad(m));
    for f in meta["f"].as_array().unwrap() {
        let key = s(f, "k");
        if f["ro"] == 1 || f["noForm"] == 1 {
            continue;
        }
        let val = &v[key];
        let text = val.as_str().unwrap_or("");
        let blank = val.is_null() || val == "";
        if f["req"] == 1 && blank {
            return fail(&format!("{} is required.", s(f, "l")));
        }
        if !blank {
            let message = match s(f, "t") {
                "email" if !re(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", text) => {
                    Some(format!("{} doesn’t look like a valid email.", s(f, "l")))
                }
                "tel" if !re(r"^[+\d][\d\s-]{6,}$", text) => {
                    Some(format!("{} doesn’t look like a phone number.", s(f, "l")))
                }
                "money" | "number" if val.as_f64().is_none() || n(v, key) < 0. => {
                    Some(format!("{} must be a positive number.", s(f, "l")))
                }
                _ => None,
            };
            if let Some(m) = message {
                return fail(&m);
            }
        }
    }
    for key in meta["unique"]
        .as_array()
        .into_iter()
        .flatten()
        .filter_map(Value::as_str)
    {
        if !s(v, key).is_empty()
            && snap
                .live(k)
                .iter()
                .any(|r| s(r, "id") != s(v, "id") && s(r, key).eq_ignore_ascii_case(s(v, key)))
        {
            let label = meta["f"]
                .as_array()
                .unwrap()
                .iter()
                .find(|f| s(f, "k") == key)
                .map(|f| s(f, "l"))
                .unwrap_or(key);
            return fail(&format!(
                "Another record already has this {}.",
                label.to_lowercase()
            ));
        }
    }
    let pair = |x: &str, y: &str| !s(v, x).is_empty() && !s(v, y).is_empty() && s(v, x) < s(v, y);
    let duplicate = |keys: &[&str]| {
        snap.live(k)
            .iter()
            .any(|x| s(x, "id") != s(v, "id") && keys.iter().all(|key| x[*key] == v[*key]))
    };
    let msg = match k {
        "profile" => {
            if !s(v, "aadhaar").is_empty() && !re(r"^\d{4}$", s(v, "aadhaar")) {
                "Enter only the last 4 digits of Aadhaar."
            } else if !s(v, "pan").is_empty() && !re(r"(?i)^[A-Z]{5}\d{4}[A-Z]$", s(v, "pan")) {
                "PAN should look like ABCDE1234F."
            } else if !s(v, "ifsc").is_empty() && !re(r"(?i)^[A-Z]{4}0[A-Z0-9]{6}$", s(v, "ifsc")) {
                "IFSC should look like HDFC0001234."
            } else {
                ""
            }
        }
        "probation" => {
            if pair("end", "start") {
                "Probation end must be after the start date."
            } else if s(v, "status") == "Extended" && s(v, "extTill").is_empty() {
                "Add the date the probation is extended till."
            } else {
                ""
            }
        }
        "exit" => {
            if pair("lwd", "resDate") {
                "Last working day can’t be before the resignation date."
            } else if s(v, "status") == "Completed"
                && (s(v, "assets") == "Pending" || s(v, "ff") != "Paid")
            {
                "Before completing, mark assets returned and F&F paid."
            } else {
                ""
            }
        }
        "reviews" if pair("to", "from") => "Period end must be after the start.",
        "assets2" if s(v, "status") == "Assigned" && s(v, "emp").is_empty() => {
            "Choose who the asset is assigned to."
        }
        "cards" if s(v, "emp").is_empty() && s(v, "holder").is_empty() => {
            "Choose an employee or enter the holder’s name."
        }
        "vendors"
            if !s(v, "gstin").is_empty()
                && !re(
                    r"(?i)^\d{2}[A-Z]{5}\d{4}[A-Z][A-Z0-9]Z[A-Z0-9]$",
                    s(v, "gstin"),
                ) =>
        {
            "GSTIN should be 15 characters, like 36ABCDE1234F1Z5."
        }
        "manpower" => {
            if s(v, "reason") == "Replacement" && s(v, "replacing").is_empty() {
                "Choose the employee being replaced."
            } else if n(v, "positions") < 1. {
                "Positions must be at least 1."
            } else {
                ""
            }
        }
        "cands" if s(v, "consent") != "Yes" => {
            "You need the candidate’s consent to store their data."
        }
        "offers2" if pair("valid", "odate") => "Valid-till must be after the offer date.",
        "interns" if pair("end", "start") => "End date must be after the start date.",
        "att" => {
            if duplicate(&["emp", "date"]) {
                "This employee already has an entry for that date. Edit it instead."
            } else if pair("out", "in") {
                "Out time is before in time."
            } else {
                ""
            }
        }
        "logs" if pair("logout", "login") => "Logout is before login.",
        "leaves2" => {
            if pair("to", "from") {
                "“To” must be on or after “From”."
            } else if weekdays(s(v, "from"), s(v, "to")) == 0 {
                "Those dates fall on a weekend."
            } else if s(v, "half") == "Yes" && v["from"] != v["to"] {
                "A half day must be a single date."
            } else {
                ""
            }
        }
        "compoff" if pair("useBy", "worked") => "Use-by date must be after the day worked.",
        "payroll2" => {
            if duplicate(&["emp", "month"]) {
                "This employee already has a payroll line for that month."
            } else if n(v, "ded") > n(v, "gross") {
                "Deductions can’t exceed gross pay."
            } else if n(v, "lop") > n(v, "wdays") {
                "LOP days can’t exceed working days."
            } else {
                ""
            }
        }
        "pfesi" if s(v, "status") == "Paid" && s(v, "challan").is_empty() => {
            "Add the challan or TRRN number when marking as paid."
        }
        "acks" if duplicate(&["policy", "emp"]) => {
            "This employee already has this policy assigned."
        }
        "pips" => {
            if pair("end", "start") {
                "End must be after start."
            } else if s(v, "status") == "Completed" && s(v, "outcome").is_empty() {
                "Choose an outcome before completing."
            } else {
                ""
            }
        }
        "surveys" if pair("close", "open") => "Close date must be after the open date.",
        _ => "",
    };
    if !msg.is_empty() {
        return fail(msg);
    }
    if k == "succession" {
        let list: Vec<_> = ["s1", "s2", "s3"]
            .iter()
            .map(|k| s(v, k))
            .filter(|x| !x.is_empty())
            .collect();
        if list.contains(&s(v, "inc")) {
            return fail("The incumbent can’t be their own successor.");
        }
        if list.iter().collect::<std::collections::HashSet<_>>().len() != list.len() {
            return fail("Each successor can appear only once.");
        }
    }
    if k == "goals" {
        if n(v, "progress") > 100. || n(v, "weight") > 100. {
            return fail("Weight and progress can’t be above 100.");
        }
        let tot = snap
            .live("goals")
            .iter()
            .filter(|g| {
                s(g, "emp") == s(v, "emp")
                    && s(g, "cycle") == s(v, "cycle")
                    && s(g, "status") != "Dropped"
                    && s(g, "id") != s(v, "id")
            })
            .map(|g| n(g, "weight"))
            .sum::<f64>()
            + if s(v, "status") == "Dropped" {
                0.
            } else {
                n(v, "weight")
            };
        if tot > 100. {
            return fail(&format!(
                "Weights for this cycle would total {tot}%. Keep them at 100% or below."
            ));
        }
        if access::role(snap, a) == "Employee"
            && !["Draft", "Pending approval"].contains(&s(v, "status"))
            && old.is_none_or(|r| r["status"] != v["status"])
        {
            return fail("Only your manager or HR can set this status.");
        }
    }
    if k == "promos" {
        let changed = old.is_none_or(|r| r["status"] != v["status"]);
        let st = s(v, "status");
        if ["Approved", "Rejected", "Effected"].contains(&st)
            && access::role(snap, a) != "HR Admin"
            && changed
        {
            return fail("Only HR Admin can approve, reject or effect a promotion.");
        }
        if st == "HR reviewed" && !access::hr(snap, a) && changed {
            return fail("Only HR can mark a nomination as reviewed.");
        }
        if ["Manager endorsed", "HR reviewed", "Approved", "Effected"].contains(&st)
            && !s(v, "elig").starts_with("Eligible")
            && s(v, "override").is_empty()
        {
            return fail(
                "This employee isn’t eligible yet. Add an override reason to move it forward.",
            );
        }
        if st == "Effected"
            && old.is_some_and(|r| !["Approved", "Effected"].contains(&s(r, "status")))
        {
            return fail("Approve the nomination before marking it Effected.");
        }
    }
    Ok(())
}
pub fn after(snap: &mut Snapshot, k: &str, r: &mut Value, is_new: bool, prev: &str, a: &Actor) {
    let empid = s(r, "emp").to_owned();
    let mut emps = snap.recs("emp");
    match k {
        "emp" => {
            if is_new
                && s(r, "status") == "Probation"
                && !snap.live("probation").iter().any(|p| p["emp"] == r["id"])
            {
                add_auto(
                    snap,
                    "probation",
                    json!({"emp":r["id"],"start":r["doj"],"end":r["probEnd"],"status":"Pending"}),
                    a,
                );
            }
        }
        "probation" => {
            if let Some(e) = emps.iter_mut().find(|e| s(e, "id") == empid) {
                if s(r, "status") == "Confirmed" && s(e, "status") == "Probation" {
                    e["status"] = json!("Active")
                }
                e["probEnd"] = r["end"].clone()
            }
        }
        "exit" => {
            if let Some(e) = emps.iter_mut().find(|e| s(e, "id") == empid) {
                if s(r, "status") == "Completed" {
                    e["status"] = json!("Exited")
                } else if ["Approved", "In clearance"].contains(&s(r, "status"))
                    && s(e, "status") != "Exited"
                {
                    e["status"] = json!("Notice period")
                }
            }
        }
        "probrev" => {
            if s(r, "status") == "Completed" {
                let mut ps = snap.recs("probation");
                for p in ps.iter_mut().filter(|p| s(p, "emp") == empid) {
                    match s(r, "rec") {
                        "Confirm" => {
                            p["status"] = json!("Confirmed");
                            p["outcome"] = json!("Confirm")
                        }
                        "Extend" => {
                            p["status"] = json!("Extended");
                            p["outcome"] = json!("Extend")
                        }
                        _ => p["outcome"] = json!("Terminate"),
                    }
                }
                snap.set_recs("probation", ps);
                if s(r, "rec") == "Confirm" {
                    if let Some(e) = emps
                        .iter_mut()
                        .find(|e| s(e, "id") == empid && s(e, "status") == "Probation")
                    {
                        e["status"] = json!("Active")
                    }
                }
            }
        }
        "interviews2" | "offers2" => {
            let mut cs = snap.recs("cands");
            if let Some(c) = cs.iter_mut().find(|c| c["id"] == r["cand"]) {
                if k == "interviews2" {
                    if s(r, "status") == "Scheduled"
                        && ["Applied", "Screening"].contains(&s(c, "stage"))
                    {
                        c["stage"] = json!("Interview")
                    }
                    if s(r, "result") == "Selected"
                        && ["Applied", "Screening", "Interview"].contains(&s(c, "stage"))
                        && s(r, "round") == "Final / founder"
                    {
                        c["stage"] = json!("Selected")
                    }
                    if s(r, "result") == "Rejected" && s(r, "status") == "Completed" {
                        c["stage"] = json!("Rejected")
                    }
                } else if ["Sent", "Accepted"].contains(&s(r, "status"))
                    && !["Joined", "Rejected"].contains(&s(c, "stage"))
                {
                    c["stage"] = json!("Offered")
                }
            }
            snap.set_recs("cands", cs);
        }
        "structure" | "handbook" => {
            let mut rows = snap.recs(k);
            for x in &mut rows {
                if x["id"] != r["id"]
                    && if k == "structure" {
                        x["emp"] == r["emp"]
                            && s(x, "status") == "Active"
                            && s(r, "status") == "Active"
                    } else {
                        s(x, "status") == "Published" && s(r, "status") == "Published"
                    }
                {
                    x["status"] = json!(if k == "structure" {
                        "Superseded"
                    } else {
                        "Archived"
                    })
                }
            }
            snap.set_recs(k, rows);
        }
        "revisions" => {
            if ["Approved", "Completed"].contains(&s(r, "status")) && s(r, "incId").is_empty() {
                let inc = add_auto(
                    snap,
                    "increments",
                    json!({"emp":r["emp"],"eff":r["eff"],"itype":"Annual increment","prev":r["cur"],"next":r["rev"],"approver":r["approver"],"letter":"No","status":"Approved"}),
                    a,
                );
                r["incId"] = inc["id"].clone();
            }
        }
        "checkins" => {
            if s(r, "status") == "Completed"
                && !s(r, "next").is_empty()
                && !snap
                    .live("checkins")
                    .iter()
                    .any(|x| x["emp"] == r["emp"] && x["date"] == r["next"])
            {
                add_auto(
                    snap,
                    "checkins",
                    json!({"emp":r["emp"],"mgr":r["mgr"],"date":r["next"],"status":"Scheduled"}),
                    a,
                );
            }
        }
        "promos" => {
            if s(r, "status") == "Effected" && r["applied"] != true {
                if let Some(e) = emps.iter_mut().find(|e| s(e, "id") == empid) {
                    if !s(r, "propDes").is_empty() {
                        e["designation"] = r["propDes"].clone()
                    }
                    if !s(r, "propGrade").is_empty() {
                        e["grade"] = r["propGrade"].clone()
                    }
                    e["_u"] = json!(now());
                    if !e["_h"].is_array() {
                        e["_h"] = json!([])
                    }
                    e["_h"].as_array_mut().unwrap().push(json!({"t":now(),"by":a.email,"s":format!("Promoted to {} ({})",s(r,"propDes"),s(r,"id"))}));
                }
                if n(r, "curCtc") != 0. && n(r, "propCtc") != 0. {
                    add_auto(
                        snap,
                        "increments",
                        json!({"emp":r["emp"],"eff":r["eff"],"itype":"Promotion","prev":r["curCtc"],"next":r["propCtc"],"approver":access::my_emp(snap,a),"letter":"No","status":"Approved"}),
                        a,
                    );
                }
                add_auto(
                    snap,
                    "actions",
                    json!({"title":format!("Issue promotion letter to {}",emp_text(snap,&empid)),"cat":"Promotion","emp":empid,"src":format!("Promotion {}",s(r,"id")),"pri":"High","due":add_days(&today(),3),"remind":"1 day before","repeat":"None","status":"Open"}),
                    a,
                );
                r["applied"] = json!(true);
            }
        }
        "actions" => {
            if s(r, "status") == "Done" && prev != "Done" && !["", "None"].contains(&s(r, "repeat"))
            {
                let months = match s(r, "repeat") {
                    "Monthly" => 1,
                    "Quarterly" => 3,
                    _ => 12,
                };
                let mut next = r.clone();
                next["due"] = json!(add_months(s(r, "due"), months));
                next["status"] = json!("Open");
                next.as_object_mut().unwrap().remove("rk");
                add_auto(snap, "actions", next, a);
            }
        }
        _ => {}
    }
    if !["emp"].contains(&k) {
        snap.set_recs("emp", emps);
    }
}

pub fn upsert(
    snap: &mut Snapshot,
    k: &str,
    body: Value,
    id: Option<&str>,
    a: &Actor,
) -> ApiResult<Value> {
    if REG_META.get(k).is_none() {
        return Err(ApiError::not_found());
    }
    if !access::can_add(snap, a, k) {
        return Err(ApiError::forbidden());
    }
    let old = id.and_then(|id| snap.recs(k).into_iter().find(|r| s(r, "id") == id));
    if id.is_some() && old.is_none() {
        return Err(ApiError::not_found());
    }
    if old
        .as_ref()
        .is_some_and(|r| !access::can_see(snap, a, k, r))
    {
        return Err(ApiError::forbidden());
    }
    let mut r = old.clone().unwrap_or_else(|| default_values(snap, k, a));
    if !r.is_object() {
        r = json!({})
    }
    for f in REG_META[k]["f"].as_array().unwrap() {
        let key = s(f, "k");
        if f["ro"] == 1 || f["noForm"] == 1 {
            continue;
        }
        if let Some(v) = body.get(key) {
            r[key] = v.clone();
        }
    }
    if old.is_none() {
        r["id"] = json!(next_id(snap, k));
        r["_c"] = json!(now());
        r["_cb"] = json!(a.email);
    }
    r["_u"] = json!(now());
    if old.is_some() {
        r["_ub"] = json!(a.email)
    }
    calculate(snap, k, &mut r);
    validate(snap, k, &r, old.as_ref(), a)?;
    if !s(&REG_META[k], "acc").is_empty() && !access::can_see(snap, a, k, &r) {
        return Err(ApiError::forbidden());
    }
    let prev = old
        .as_ref()
        .map(|r| s(r, "status"))
        .unwrap_or("")
        .to_owned();
    if !r["_h"].is_array() {
        r["_h"] = json!([])
    }
    let st = REG_META[k]["st"]
        .as_str()
        .map(|key| r[key].clone())
        .unwrap_or(json!("Created"));
    if old.is_none() || old.as_ref().unwrap()[REG_META[k]["st"].as_str().unwrap_or("status")] != st
    {
        r["_h"]
            .as_array_mut()
            .unwrap()
            .push(json!({"t":now(),"by":a.email,"s":st}));
    }
    let mut rows = snap.recs(k);
    if let Some(i) = rows.iter().position(|x| x["id"] == r["id"]) {
        rows[i] = r.clone()
    } else {
        rows.insert(0, r.clone())
    }
    snap.set_recs(k, rows);
    after(snap, k, &mut r, old.is_none(), &prev, a);
    let mut rows = snap.recs(k);
    if let Some(x) = rows.iter_mut().find(|x| x["id"] == r["id"]) {
        *x = r.clone()
    }
    snap.set_recs(k, rows);
    snap.audit(
        &a.email,
        format!(
            "{} {} {}",
            if old.is_some() { "Edited" } else { "Added" },
            s(&REG_META[k], "one").to_lowercase(),
            s(&r, "id")
        ),
    );
    Ok(r)
}
pub fn archive(
    snap: &mut Snapshot,
    k: &str,
    id: &str,
    restore: bool,
    a: &Actor,
) -> ApiResult<Value> {
    let r = snap
        .recs(k)
        .into_iter()
        .find(|r| s(r, "id") == id)
        .ok_or_else(ApiError::not_found)?;
    if !access::can_add(snap, a, k) || !access::can_see(snap, a, k, &r) {
        return Err(ApiError::forbidden());
    }
    let mut rows = snap.recs(k);
    let r = rows.iter_mut().find(|r| s(r, "id") == id).unwrap();
    r["_arch"] = json!(!restore);
    r["_u"] = json!(now());
    if !r["_h"].is_array() {
        r["_h"] = json!([])
    }
    r["_h"]
        .as_array_mut()
        .unwrap()
        .push(json!({"t":now(),"by":a.email,"s":if restore{"Restored"}else{"Archived"}}));
    let result = r.clone();
    snap.set_recs(k, rows);
    snap.audit(
        &a.email,
        format!(
            "{} {} {id}",
            if restore { "Restored" } else { "Archived" },
            s(&REG_META[k], "one").to_lowercase()
        ),
    );
    Ok(result)
}
