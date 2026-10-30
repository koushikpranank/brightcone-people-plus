use crate::{
    models::{n, s, today, Snapshot},
    services::{access, auth::Actor},
};
use chrono::{Datelike, Days, Duration, NaiveDate};
use serde_json::{json, Value};
/// Number(value.toFixed(digits)): round the exact binary value, as the source does.
pub fn js_fixed(value: f64, digits: u32) -> f64 {
    if !value.is_finite() || value.abs() >= 1e21 {
        return value;
    }
    let scale = 10_u128.pow(digits);
    let bits = value.abs().to_bits();
    let raw = ((bits >> 52) & 0x7ff) as i32;
    let mantissa = (bits & ((1_u64 << 52) - 1)) | if raw == 0 { 0 } else { 1_u64 << 52 };
    let exponent = if raw == 0 { -1074 } else { raw - 1023 - 52 };
    let numerator = mantissa as u128 * scale;
    let rounded = if exponent >= 0 {
        numerator.checked_shl(exponent as u32).unwrap_or(u128::MAX)
    } else if -exponent >= 127 {
        0
    } else {
        let denominator = 1_u128 << (-exponent);
        (numerator + denominator / 2) / denominator
    };
    value.signum() * rounded as f64 / scale as f64
}
pub fn js_round(value: f64) -> f64 {
    (value + 0.5).floor()
}
pub fn date(d: &str) -> Option<NaiveDate> {
    NaiveDate::parse_from_str(d, "%Y-%m-%d").ok()
}
pub fn day_diff(a: &str, b: &str) -> i64 {
    date(a)
        .zip(date(b))
        .map(|(a, b)| (b - a).num_days())
        .unwrap_or(0)
}
pub fn add_days(d: &str, n: i64) -> String {
    date(d)
        .map(|d| (d + Duration::days(n)).to_string())
        .unwrap_or_default()
}
pub fn add_months(d: &str, n: i32) -> String {
    date(d)
        .and_then(|d| {
            let total = d.year() * 12 + d.month0() as i32 + n;
            NaiveDate::from_ymd_opt(total.div_euclid(12), total.rem_euclid(12) as u32 + 1, 1)
                .map(|start| start + Duration::days(d.day0() as i64))
        })
        .map(|d| d.to_string())
        .unwrap_or_default()
}
pub fn weekdays(a: &str, b: &str) -> i64 {
    let Some((mut a, b)) = date(a).zip(date(b)) else {
        return 0;
    };
    let mut n = 0;
    while a <= b {
        if a.weekday().number_from_monday() < 6 {
            n += 1
        }
        let Some(next) = a.checked_add_days(Days::new(1)) else {
            break;
        };
        a = next;
    }
    n
}
pub fn salary(e: &Value) -> Value {
    let m = n(e, "ctc") / 12.;
    let basic = m * 0.4;
    let hra = basic * 0.5;
    let pf = basic * 0.12;
    let special = m - basic - hra - pf;
    let gross = basic + hra + special;
    let tds = ((n(e, "ctc") - 1_000_000.) * 0.2 / 12.).max(0.);
    json!({"earn":[["Basic",basic],["House rent allowance",hra],["Special allowance",special]],"pfE":pf,"ded":[["Provident fund",pf],["Professional tax",200],["Income tax (TDS)",tds]],"gross":gross,"net":gross-pf-200.-tds})
}
pub fn used(snap: &Snapshot, emp: &str, kind: &str, status: &str) -> f64 {
    snap.demo["leaves"]
        .as_array()
        .into_iter()
        .flatten()
        .filter(|l| s(l, "emp") == emp && s(l, "type") == kind && s(l, "status") == status)
        .map(|l| n(l, "days"))
        .sum()
}
pub fn taken_days(snap: &Snapshot, emp: &str, kind: &str, year: &str, except: &str) -> f64 {
    snap.live("leaves2")
        .iter()
        .filter(|l| {
            s(l, "emp") == emp
                && s(l, "ltype") == kind
                && s(l, "status") == "Approved"
                && s(l, "from").starts_with(year)
                && s(l, "id") != except
        })
        .map(|l| n(l, "days"))
        .sum()
}
pub fn grade_since(snap: &Snapshot, id: &str) -> String {
    let mut p: Vec<_> = snap
        .live("promos")
        .into_iter()
        .filter(|p| s(p, "emp") == id && s(p, "status") == "Effected")
        .collect();
    p.sort_by(|a, b| s(b, "eff").cmp(s(a, "eff")));
    p.first()
        .map(|p| s(p, "eff").to_owned())
        .unwrap_or_else(|| {
            snap.employee(id)
                .map(|e| s(&e, "doj").to_owned())
                .unwrap_or_default()
        })
}
pub fn latest_appraisal(snap: &Snapshot, id: &str) -> Option<Value> {
    let mut rows: Vec<_> = snap
        .live("appraisal")
        .into_iter()
        .filter(|r| s(r, "emp") == id && !s(r, "rating").is_empty())
        .collect();
    rows.sort_by(|a, b| s(b, "due").cmp(s(a, "due")));
    rows.into_iter().next()
}
pub fn rating(snap: &Snapshot, a: &Actor, id: &str) -> Value {
    latest_appraisal(snap, id)
        .map(|r| {
            if access::role(snap, a) == "Employee" && s(&r, "released") != "Yes" {
                json!("hidden")
            } else {
                json!(n(&r, "rating"))
            }
        })
        .unwrap_or(Value::Null)
}
pub fn eligibility(snap: &Snapshot, id: &str) -> Value {
    let Some(e) = snap.employee(id) else {
        return json!({"ok":false,"why":["Not in master data"]});
    };
    let adv = &snap.live["settings"]["adv"];
    let since = grade_since(snap, id);
    let months = (day_diff(&since, &today()) as f64 / 30.44).floor() as i64;
    let r = latest_appraisal(snap, id).map(|r| n(&r, "rating"));
    let mut why = vec![];
    if months < n(adv, "eligMonths") as i64 {
        why.push(format!(
            "{months} of {} months in grade",
            n(adv, "eligMonths")
        ))
    }
    if let Some(r) = r {
        if r < n(adv, "eligRating") {
            why.push(format!("Rating {r} (needs {}+)", n(adv, "eligRating")))
        }
    } else {
        why.push("No rating yet".into())
    }
    if snap
        .live("pips")
        .iter()
        .any(|p| s(p, "emp") == id && s(p, "status") == "Active")
    {
        why.push("On improvement plan".into())
    }
    if ["Notice period", "Exited"].contains(&s(&e, "status")) {
        why.push("Serving notice or exited".into())
    }
    json!({"ok":why.is_empty(),"why":why,"months":months,"rating":r,"since":since})
}
pub fn hours(a: &str, b: &str) -> Value {
    let min = |s: &str| {
        let mut p = s.split(':');
        Some(p.next()?.parse::<i64>().ok()? * 60 + p.next()?.parse::<i64>().ok()?)
    };
    min(a)
        .zip(min(b))
        .filter(|(a, b)| b >= a)
        .map(|(a, b)| json!(format!("{}h {:02}m", (b - a) / 60, (b - a) % 60)))
        .unwrap_or(json!(""))
}
pub fn emp_text(snap: &Snapshot, id: &str) -> String {
    snap.employee(id)
        .map(|e| format!("{} {} ({id})", s(&e, "first"), s(&e, "last")))
        .unwrap_or_else(|| id.into())
}
pub fn eff_status(meta: &Value, r: &Value) -> String {
    let key = s(meta, "k");
    let t = today();
    let status = match key {
        "logs" => {
            if s(r, "logout").is_empty() {
                "Pending"
            } else {
                "Completed"
            }
        }
        "holidays2" => {
            if s(r, "date") >= t.as_str() {
                "Upcoming"
            } else {
                "Past"
            }
        }
        "licences" => {
            if s(r, "valid").is_empty() {
                "Active"
            } else if s(r, "valid") < t.as_str() {
                "Expired"
            } else if day_diff(&t, s(r, "valid")) <= 30 {
                "Renewal due"
            } else {
                "Active"
            }
        }
        "succession" => {
            if ["r1", "r2", "r3"].iter().any(|k| s(r, k) == "Ready now") {
                "Covered"
            } else if ["s1", "s2", "s3"].iter().any(|k| !s(r, k).is_empty()) {
                "Partly covered"
            } else {
                "Not covered"
            }
        }
        _ => s(r, meta["st"].as_str().unwrap_or("status")),
    };
    let due = s(meta, "due");
    if !due.is_empty()
        && !s(r, due).is_empty()
        && s(r, due) < t.as_str()
        && !meta["closed"]
            .as_array()
            .is_some_and(|l| l.contains(&json!(status)))
    {
        "Overdue".into()
    } else if status.is_empty() {
        "—".into()
    } else {
        status.into()
    }
}
pub fn week_dates(offset: i64) -> Vec<String> {
    let d = date(&today()).unwrap();
    let monday =
        d - Duration::days(d.weekday().num_days_from_monday() as i64) + Duration::weeks(offset);
    (0..7)
        .map(|i| (monday + Duration::days(i)).to_string())
        .collect()
}
pub fn shift_on(snap: &Snapshot, id: &str, d: &str) -> String {
    let Some(e) = snap.demo["employees"]
        .as_array()
        .into_iter()
        .flatten()
        .find(|e| s(e, "id") == id || s(e, "name") == id)
    else {
        return String::new();
    };
    let key = format!("{}|{d}", s(e, "id"));
    if let Some(st) = snap.demo["roster"][&key].as_str().filter(|s| !s.is_empty()) {
        return st.into();
    }
    if snap.demo["leaves"]
        .as_array()
        .into_iter()
        .flatten()
        .any(|l| {
            s(l, "emp") == s(e, "name")
                && s(l, "status") == "Approved"
                && s(l, "from") <= d
                && s(l, "to") >= d
        })
    {
        return "Leave".into();
    }
    if date(d).is_some_and(|d| d.weekday().number_from_monday() > 5)
        && s(e, "shift") != "Night support"
    {
        return "Off".into();
    }
    s(e, "shift").into()
}
pub fn band(e: &Value) -> &str {
    let y = if s(e, "doj").is_empty() {
        0.
    } else {
        day_diff(s(e, "doj"), &today()) as f64 / 365.25
    };
    if y < 1. {
        "Under 1 year"
    } else if y < 3. {
        "1–3 years"
    } else if y < 5. {
        "3–5 years"
    } else {
        "5+ years"
    }
}
