use crate::{
    controllers::{ApiError, ApiResult},
    models::{n, s, Snapshot},
    services::calculations::js_fixed,
};
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::collections::BTreeMap;

#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Component {
    pub id: String,
    pub name: String,
    pub kind: String,
    pub basis: String,
    pub value: f64,
}
#[derive(Clone, Debug, Serialize, Deserialize, Default)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct Override {
    pub components: Vec<Component>,
}
#[derive(Clone, Debug, Serialize, Deserialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
#[allow(non_snake_case)]
pub struct Policy {
    pub revision: u64,
    pub annualTaxAllowance: f64,
    pub settlementDivisor: f64,
    pub leaveEncashPercent: f64,
    pub gratuityDays: f64,
    pub gratuityDivisor: f64,
    pub gratuityMinYears: f64,
    pub components: Vec<Component>,
    pub overrides: BTreeMap<String, Override>,
}
pub fn defaults() -> Policy {
    serde_json::from_value(json!({"revision":0,"annualTaxAllowance":1000000,"settlementDivisor":26,"leaveEncashPercent":40,"gratuityDays":15,"gratuityDivisor":26,"gratuityMinYears":5,"overrides":{},"components":[
 {"id":"basic","name":"Basic","kind":"earning","basis":"monthly_ctc","value":40},
 {"id":"hra","name":"House rent allowance","kind":"earning","basis":"basic","value":50},
 {"id":"special","name":"Special allowance","kind":"earning","basis":"balance","value":0},
 {"id":"employer_pf","name":"Employer PF","kind":"employer","basis":"basic","value":12},
 {"id":"pf","name":"Provident fund","kind":"deduction","basis":"basic","value":12},
 {"id":"pt","name":"Professional tax","kind":"deduction","basis":"fixed","value":200},
 {"id":"tds","name":"Income tax (TDS)","kind":"deduction","basis":"taxable_ctc","value":20}
 ]})).unwrap()
}
pub fn policy(snap: &Snapshot) -> Policy {
    serde_json::from_value(snap.live["settings"]["money"].clone()).unwrap_or_else(|_| defaults())
}
pub fn validate(p: &Policy) -> ApiResult<()> {
    for (name, v, max) in [
        ("Annual allowance", p.annualTaxAllowance, 1e10),
        ("Settlement divisor", p.settlementDivisor, 366.),
        ("Leave encash percent", p.leaveEncashPercent, 100.),
        ("Gratuity days", p.gratuityDays, 366.),
        ("Gratuity divisor", p.gratuityDivisor, 366.),
        ("Gratuity eligibility", p.gratuityMinYears, 100.),
    ] {
        if !v.is_finite() || v < 0. || v > max {
            return Err(ApiError::bad(format!(
                "{name} is outside the allowed range."
            )));
        }
    }
    if p.settlementDivisor == 0. || p.gratuityDivisor == 0. {
        return Err(ApiError::bad("Divisors must be greater than zero."));
    }
    if p.overrides.len() > 10000 {
        return Err(ApiError::bad("Too many employee overrides."));
    }
    for cs in std::iter::once(&p.components).chain(p.overrides.values().map(|v| &v.components)) {
        if cs.is_empty() || cs.len() > 60 {
            return Err(ApiError::bad("Use between 1 and 60 components."));
        }
        let mut ids = std::collections::HashSet::new();
        let mut balances = 0;
        for c in cs {
            if c.id.trim().is_empty()
                || c.name.trim().is_empty()
                || !ids.insert(&c.id)
                || c.name.len() > 100
                || !["earning", "deduction", "employer"].contains(&c.kind.as_str())
                || ![
                    "fixed",
                    "monthly_ctc",
                    "basic",
                    "gross",
                    "taxable_ctc",
                    "balance",
                ]
                .contains(&c.basis.as_str())
                || !c.value.is_finite()
                || c.value < 0.
                || c.value > 1e10
            {
                return Err(ApiError::bad(
                    "Invalid, duplicate or negative money component.",
                ));
            }
            if c.basis != "fixed" && c.value > 100. {
                return Err(ApiError::bad(
                    "Percentage components must be between 0 and 100.",
                ));
            }
            if c.basis == "balance" {
                balances += 1;
                if c.kind != "earning" {
                    return Err(ApiError::bad("Only an earning may use Remaining CTC."));
                }
            }
            if c.kind != "deduction" && ["gross", "taxable_ctc"].contains(&c.basis.as_str()) {
                return Err(ApiError::bad(
                    "Gross and taxable CTC bases are for deductions.",
                ));
            }
            if c.id == "basic"
                && (c.kind != "earning" || !["fixed", "monthly_ctc"].contains(&c.basis.as_str()))
            {
                return Err(ApiError::bad(
                    "Basic must be an earning based on fixed amount or monthly CTC.",
                ));
            }
        }
        if balances > 1 {
            return Err(ApiError::bad("Use at most one Remaining CTC earning."));
        }
    }
    Ok(())
}
pub fn salary_with(p: &Policy, e: &Value, inputs: &[Value]) -> ApiResult<Value> {
    let ctc = n(e, "ctc");
    if !ctc.is_finite() || ctc < 0. {
        return Err(ApiError::bad("CTC must be a non-negative number."));
    }
    let m = ctc / 12.;
    let cs = p
        .overrides
        .get(s(e, "id"))
        .map(|o| &o.components)
        .unwrap_or(&p.components);
    let basic = cs
        .iter()
        .find(|c| c.id == "basic")
        .map(|c| {
            if c.basis == "fixed" {
                c.value
            } else {
                m * c.value / 100.
            }
        })
        .unwrap_or(0.);
    let amount = |c: &Component, gross: f64| -> f64 {
        js_fixed(
            match c.basis.as_str() {
                "fixed" => c.value,
                "basic" => basic * c.value / 100.,
                "gross" => gross * c.value / 100.,
                "taxable_ctc" => (ctc - p.annualTaxAllowance).max(0.) * c.value / 1200.,
                _ => m * c.value / 100.,
            },
            2,
        )
    };
    let employer: Vec<Value> = cs
        .iter()
        .filter(|c| c.kind == "employer")
        .map(|c| json!([c.name, amount(c, 0.)]))
        .collect();
    let employer_total: f64 = employer.iter().map(|x| x[1].as_f64().unwrap()).sum();
    let mut earn: Vec<Value> = cs
        .iter()
        .filter(|c| c.kind == "earning" && c.basis != "balance")
        .map(|c| json!([c.name, amount(c, 0.)]))
        .collect();
    let fixed_total: f64 = earn.iter().map(|x| x[1].as_f64().unwrap()).sum();
    if let Some(c) = cs.iter().find(|c| c.basis == "balance") {
        let remaining = js_fixed(m - employer_total - fixed_total, 2);
        if remaining < 0. {
            return Err(ApiError::bad(
                "Earnings and employer contributions exceed monthly CTC. Adjust the components.",
            ));
        }
        earn.push(json!([c.name, remaining]));
    }
    let mut extra_ded = vec![];
    for i in inputs {
        let v = n(i, "amt");
        if !v.is_finite() || v < 0. {
            return Err(ApiError::bad("One-time amounts must be non-negative."));
        }
        let row = json!([s(i, "k"), js_fixed(v, 2)]);
        if ["Deduction", "Loan recovery"].contains(&s(i, "k")) {
            extra_ded.push(row)
        } else {
            earn.push(row)
        }
    }
    let gross = js_fixed(earn.iter().map(|x| x[1].as_f64().unwrap()).sum(), 2);
    let mut ded: Vec<Value> = cs
        .iter()
        .filter(|c| c.kind == "deduction")
        .map(|c| json!([c.name, amount(c, gross)]))
        .collect();
    ded.extend(extra_ded);
    let deductions = js_fixed(ded.iter().map(|x| x[1].as_f64().unwrap()).sum(), 2);
    let pt = cs
        .iter()
        .find(|c| c.id == "pt")
        .map(|c| amount(c, gross))
        .unwrap_or(0.);
    let pf = cs
        .iter()
        .find(|c| c.id == "pf")
        .map(|c| amount(c, gross))
        .unwrap_or(0.);
    let tds = cs
        .iter()
        .find(|c| c.id == "tds")
        .map(|c| amount(c, gross))
        .unwrap_or(0.);
    Ok(
        json!({"earn":earn,"ded":ded,"employer":employer,"pfE":employer_total,"employerTotal":employer_total,"basic":js_fixed(basic,2),"professionalTax":pt,"employeePf":pf,"tds":tds,"gross":gross,"deductions":deductions,"net":js_fixed(gross-deductions,2),"ctc":ctc,"policyRevision":p.revision}),
    )
}
pub fn salary(snap: &Snapshot, e: &Value) -> Value {
    let month = s(&snap.demo["payroll"], "month");
    let inputs = snap.demo["payroll"]["inputs"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|i| {
            s(i, "emp") == s(e, "name") && (s(i, "month").is_empty() || s(i, "month") == month)
        })
        .cloned()
        .collect::<Vec<_>>();
    salary_with(&policy(snap), e, &inputs).unwrap_or_else(
        |error| json!({"earn":[],"ded":[],"employer":[],"gross":0,"net":0,"pfE":0,"error":error.1}),
    )
}
pub fn settlement(snap: &Snapshot, e: &Value, body: &Value) -> ApiResult<Value> {
    let p = policy(snap);
    let sal = salary_with(&p, e, &[])?;
    for k in [
        "workedDays",
        "leaveDays",
        "reimbursements",
        "noticeRecovery",
        "otherEarnings",
        "otherDeductions",
    ] {
        if body.get(k).is_some() && (!body[k].is_number() || n(body, k) < 0. || n(body, k) > 1e9) {
            return Err(ApiError::bad(format!("Invalid {k}")));
        }
    }
    use chrono::Datelike;
    let years = crate::services::calculations::date(s(e, "joined"))
        .zip(crate::services::calculations::date(s(body, "date")))
        .map(|(start, end)| {
            (end.year()
                - start.year()
                - i32::from((end.month(), end.day()) < (start.month(), start.day())))
            .max(0) as f64
        })
        .unwrap_or(0.);
    let paid = js_fixed(
        n(&sal, "gross") / p.settlementDivisor * n(body, "workedDays"),
        2,
    );
    let leave = js_fixed(
        n(e, "ctc") * p.leaveEncashPercent / 100. / 365. * n(body, "leaveDays"),
        2,
    );
    let gratuity = if years >= p.gratuityMinYears {
        js_fixed(
            n(&sal, "basic") * p.gratuityDays / p.gratuityDivisor * years,
            2,
        )
    } else {
        0.
    };
    let net = js_fixed(
        paid + leave + gratuity + n(body, "reimbursements") + n(body, "otherEarnings")
            - n(body, "noticeRecovery")
            - n(body, "otherDeductions"),
        2,
    );
    Ok(
        json!({"employee":e["id"],"salary":paid,"leaveEncashment":leave,"gratuity":gratuity,"serviceYears":years,"reimbursements":body["reimbursements"],"noticeRecovery":body["noticeRecovery"],"otherEarnings":body["otherEarnings"],"otherDeductions":body["otherDeductions"],"net":net,"inputs":body,"policy":p}),
    )
}
/// Keep identity, employment status and approved pay changes connected across the two source stores.
pub fn reconcile_employees(old: &Snapshot, next: &mut Snapshot, a: &crate::services::auth::Actor) {
    let mut changed = 0;
    for e in next.demo["employees"]
        .as_array()
        .cloned()
        .unwrap_or_default()
    {
        let before = old.demo["employees"]
            .as_array()
            .into_iter()
            .flatten()
            .find(|x| x["id"] == e["id"]);
        if before == Some(&e) {
            continue;
        }
        let mut master = next.recs("emp");
        if let Some(r) = master.iter_mut().find(|r| r["id"] == e["id"]) {
            for (src, dst) in [
                ("ctc", "ctc"),
                ("phone", "phone"),
                ("dob", "dob"),
                ("grade", "grade"),
                ("role", "designation"),
                ("dept", "department"),
                ("loc", "location"),
                ("joined", "doj"),
            ] {
                if before.is_none_or(|b| b[src] != e[src]) && e.get(src).is_some() {
                    r[dst] = e[src].clone();
                }
            }
            if before.is_none_or(|b| b["status"] != e["status"]) {
                r["status"] = json!(if s(&e, "status") == "Inactive" {
                    "Exited"
                } else {
                    s(&e, "status")
                });
            }
        }
        next.set_recs("emp", master);
    }
    for r in next.recs("emp") {
        let prior = old.employee(s(&r, "id"));
        if prior.as_ref() == Some(&r) || r["_arch"] == true {
            continue;
        }
        let id = s(&r, "id");
        let name = format!("{} {}", s(&r, "first"), s(&r, "last"))
            .trim()
            .to_owned();
        if name.is_empty() {
            continue;
        }
        let mut emps = next.demo["employees"]
            .as_array()
            .cloned()
            .unwrap_or_default();
        let pos = emps.iter().position(|e| s(e, "id") == id);
        let mut e = pos.map(|i| emps[i].clone()).unwrap_or_else(
            || json!({"id":id,"ctc":0,"shift":"General","address":"","emergency":""}),
        );
        let old_name = s(&e, "name").to_owned();
        e["name"] = json!(name);
        for (src, dst) in [
            ("designation", "role"),
            ("department", "dept"),
            ("location", "loc"),
            ("doj", "joined"),
            ("email", "email"),
            ("phone", "phone"),
            ("grade", "grade"),
            ("type", "type"),
            ("probEnd", "probEnd"),
        ] {
            if r.get(src).is_some() {
                e[dst] = r[src].clone();
            }
        }
        e["status"] = json!(if s(&r, "status") == "Exited" {
            "Inactive"
        } else {
            s(&r, "status")
        });
        if r["ctc"].is_number() {
            e["ctc"] = r["ctc"].clone()
        }
        if !s(&r, "manager").is_empty() {
            e["mgr"] = json!(next
                .employee(s(&r, "manager"))
                .map(|m| format!("{} {}", s(&m, "first"), s(&m, "last")))
                .unwrap_or_default())
        }
        if let Some(pos) = pos {
            emps[pos] = e.clone()
        } else {
            emps.push(e.clone())
        }
        next.demo["employees"] = json!(emps);
        let email = s(&e, "email").to_lowercase();
        if !email.is_empty() {
            let mut accounts = next.demo["accounts"]
                .as_array()
                .cloned()
                .unwrap_or_default();
            if let Some(ac) = accounts.iter_mut().find(|ac| {
                s(ac, "email") == email || (!old_name.is_empty() && s(ac, "name") == old_name)
            }) {
                ac["name"] = json!(name);
                ac["email"] = json!(email);
                if s(&e, "status") == "Inactive" {
                    if s(ac, "status") == "Active" {
                        ac["employmentDisabled"] = json!(true);
                    }
                    ac["status"] = json!("Disabled")
                } else if ac["employmentDisabled"] == true {
                    ac["status"] = json!("Active");
                    ac["fails"] = json!(0);
                    ac.as_object_mut().unwrap().remove("employmentDisabled");
                }
            } else {
                accounts.push(json!({"email":email,"name":name,"role":"Employee","pass":"Welcome@123","status":if s(&e,"status")=="Inactive"{"Disabled"}else{"Active"},"fails":0,"last":null}))
            }
            next.demo["accounts"] = json!(accounts);
            if !next.live["settings"]["acc"].is_object() {
                next.live["settings"]["acc"] = json!({})
            }
            if next.live["settings"]["acc"].get(&email).is_none() {
                let role = next.demo["accounts"]
                    .as_array()
                    .into_iter()
                    .flatten()
                    .find(|ac| s(ac, "email") == email)
                    .map(|ac| {
                        if s(ac, "role") == "HR Admin" {
                            "HR Admin"
                        } else {
                            "Employee"
                        }
                    })
                    .unwrap_or("Employee");
                next.live["settings"]["acc"][&email] = json!({"role":role,"emp":id})
            }
        }
        changed += 1;
    }
    // Approved increments change current pay only on or after their effective date.
    for inc in next.live("increments") {
        if s(&inc, "status") != "Approved"
            || s(&inc, "eff") > crate::models::today().as_str()
            || s(&inc, "eff").is_empty()
            || inc["applied"] == true
        {
            continue;
        }
        if let Some(e) = next.demo["employees"]
            .as_array_mut()
            .unwrap()
            .iter_mut()
            .find(|e| e["id"] == inc["emp"])
        {
            e["ctc"] = inc["next"].clone();
            changed += 1;
        }
        let mut master = next.recs("emp");
        if let Some(e) = master.iter_mut().find(|e| e["id"] == inc["emp"]) {
            e["ctc"] = inc["next"].clone();
        }
        next.set_recs("emp", master);
        let mut increments = next.recs("increments");
        if let Some(row) = increments.iter_mut().find(|r| r["id"] == inc["id"]) {
            row["applied"] = json!(true);
        }
        next.set_recs("increments", increments);
    }
    if changed > 0 {
        next.audit(
            &a.email,
            format!("Synchronized {changed} employee identity/status/pay changes"),
        );
    }
}
