use brightcone_people_plus::{
    models::{s, today, Snapshot, INVENTORY, REG_META},
    services::{access, auth::Actor, calculations::*, registry, rules, sync},
};
use serde_json::{json, Value};
fn state() -> Snapshot {
    Snapshot {
        demo: serde_json::from_str(include_str!("../src/seeders/demo.json")).unwrap(),
        live: serde_json::from_str(include_str!("../src/seeders/live.json")).unwrap(),
    }
}
fn actor(role: &str) -> Actor {
    Actor {
        email: "ananya.rao@brightcone.ai".into(),
        name: "Ananya Rao".into(),
        role: "HR Admin".into(),
        viewas: if role == "HR Admin" {
            None
        } else {
            Some(role.into())
        },
        sid: uuid::Uuid::new_v4(),
    }
}
#[test]
fn source_inventory_is_exact() {
    assert_eq!(state().demo["employees"].as_array().unwrap().len(), 14);
    assert_eq!(REG_META.as_object().unwrap().len(), 52);
    assert_eq!(INVENTORY["views"].as_array().unwrap().len(), 104);
    assert!(state().live("emp").is_empty());
}
#[test]
fn weekdays_inclusive_weekends_reverse_and_leap_day() {
    assert_eq!(weekdays("2026-10-30", "2026-11-02"), 2);
    assert_eq!(weekdays("2026-10-31", "2026-11-01"), 0);
    assert_eq!(weekdays("2026-11-02", "2026-10-30"), 0);
    assert_eq!(weekdays("2024-02-28", "2024-03-01"), 3);
}
#[test]
fn javascript_date_rollover_and_month_math() {
    assert_eq!(add_months("2026-01-31", 1), "2026-03-03");
    assert_eq!(add_months("2026-01-10", -1), "2025-12-10");
    assert_eq!(day_diff("2024-02-28", "2024-03-01"), 2);
    assert_eq!(add_days("2024-02-28", 2), "2024-03-01");
    assert_eq!(week_dates(0).len(), 7);
}
#[test]
fn salary_matches_source_without_pf_cap() {
    let r = salary(&json!({"ctc":2_200_000}));
    assert_eq!(r["pfE"], 8800.0);
    assert!((r["gross"].as_f64().unwrap() - 174_533.33333333334).abs() < 0.0001);
    assert!((r["net"].as_f64().unwrap() - 145_533.33333333334).abs() < 0.0001);
}
#[test]
fn demo_leave_counts_and_live_year_exclusion() {
    let mut st = state();
    assert_eq!(used(&st, "Rahul Varma", "Earned leave", "Approved"), 3.);
    st.set_recs("leaves2",vec![json!({"id":"1","emp":"E","ltype":"Sick leave","from":"2026-01-02","days":2,"status":"Approved"}),json!({"id":"2","emp":"E","ltype":"Sick leave","from":"2025-01-02","days":8,"status":"Approved"})]);
    assert_eq!(taken_days(&st, "E", "Sick leave", "2026", ""), 2.);
    assert_eq!(taken_days(&st, "E", "Sick leave", "2026", "1"), 0.);
}
#[test]
fn matrix_all_roles_all_areas_matches_html() {
    let st = state();
    for role in INVENTORY["ROLES"]
        .as_array()
        .unwrap()
        .iter()
        .filter_map(Value::as_str)
    {
        for (area, matrix) in INVENTORY["ACC"].as_object().unwrap() {
            assert_eq!(
                access::scope(&st, &actor(role), area),
                matrix[role].as_str().unwrap(),
                "{role} {area}"
            );
        }
    }
}
#[test]
fn manager_recursion_excludes_self_and_confidential_rows() {
    let mut st = state();
    st.set_recs(
        "emp",
        vec![
            json!({"id":"A","manager":""}),
            json!({"id":"B","manager":"A"}),
            json!({"id":"C","manager":"B"}),
        ],
    );
    st.live["settings"]["acc"]["ananya.rao@brightcone.ai"] = json!({"emp":"A"});
    let a = actor("Manager");
    assert_eq!(access::team(&st, "A").len(), 2);
    assert!(!access::can_see(&st, &a, "pips", &json!({"emp":"A"})));
    assert!(access::can_see(&st, &a, "pips", &json!({"emp":"C"})));
}
#[test]
fn employee_sees_only_shared_pip_and_released_rating() {
    let mut st = state();
    st.live["settings"]["acc"]["ananya.rao@brightcone.ai"] = json!({"emp":"A"});
    let a = actor("Employee");
    assert!(!access::can_see(
        &st,
        &a,
        "pips",
        &json!({"emp":"A","shared":"No"})
    ));
    assert!(access::can_see(
        &st,
        &a,
        "pips",
        &json!({"emp":"A","shared":"Yes"})
    ));
    st.set_recs(
        "appraisal",
        vec![json!({"emp":"A","due":"2026-01-01","rating":"5","released":"No"})],
    );
    assert_eq!(rating(&st, &a, "A"), "hidden");
    assert!(!access::can_add(&st, &a, "pips"));
}
#[test]
fn all_numeric_registry_calculations() {
    let st = state();
    for (k, mut row, field, expected) in [
        (
            "payroll2",
            json!({"gross":100.,"ded":20.,"wdays":22.,"lop":2.}),
            "net",
            80.,
        ),
        (
            "structure",
            json!({"basic":100.,"hra":50.,"special":20.,"other":10.}),
            "mgross",
            180.,
        ),
        ("pfesi", json!({"ee":100.,"er":200.}), "total", 300.),
        ("officeexp", json!({"amount":100.,"gst":18.}), "total", 118.),
        ("increments", json!({"prev":100.,"next":110.}), "pct", 10.),
    ] {
        registry::calculate(&st, k, &mut row);
        assert_eq!(row[field], expected, "{k}");
    }
}
#[test]
fn salary_revision_creates_increment_once() {
    let mut st = state();
    let a = actor("HR Admin");
    let mut r = json!({"id":"REV-1","emp":"E","eff":"2026-11-01","cur":1000000.,"rev":1200000.,"approver":"A","status":"Approved"});
    registry::after(&mut st, "revisions", &mut r, true, "Draft", &a);
    registry::after(&mut st, "revisions", &mut r, false, "Approved", &a);
    assert_eq!(st.live("increments").len(), 1);
    assert!(!s(&r, "incId").is_empty());
}
#[test]
fn promotion_effects_master_increment_and_letter_once() {
    let mut st = state();
    let a = actor("HR Admin");
    st.set_recs(
        "emp",
        vec![json!({"id":"E","designation":"Engineer","grade":"L4"})],
    );
    let mut r = json!({"id":"PRM-1","emp":"E","eff":"2026-11-01","propDes":"Senior Engineer","propGrade":"L5","curCtc":1000000,"propCtc":1300000,"status":"Effected"});
    registry::after(&mut st, "promos", &mut r, false, "Approved", &a);
    registry::after(&mut st, "promos", &mut r, false, "Effected", &a);
    assert_eq!(st.employee("E").unwrap()["designation"], "Senior Engineer");
    assert_eq!(st.live("increments").len(), 1);
    assert_eq!(st.live("actions").len(), 1);
    assert!(s(&st.live("actions")[0], "title").starts_with("Issue promotion letter"));
}
#[test]
fn all_source_rules_deduplicate_and_auto_close() {
    let mut st = state();
    let a = actor("HR Admin");
    let t = today();
    st.set_recs(
        "emp",
        vec![
            json!({"id":"E","first":"Test","last":"Employee","doj":"2020-01-01","status":"Active"}),
        ],
    );
    for (k, row) in [
        (
            "probation",
            json!({"id":"P","emp":"E","end":t,"status":"Pending"}),
        ),
        (
            "appraisal",
            json!({"id":"A","emp":"E","due":t,"status":"Pending"}),
        ),
        (
            "docs",
            json!({"id":"D","emp":"E","dtype":"Passport","expiry":t,"status":"Verified"}),
        ),
        (
            "statutory",
            json!({"id":"S","due":t,"item":"TDS","period":"Oct","status":"Pending"}),
        ),
        ("offers2", json!({"id":"O","valid":t,"status":"Sent"})),
        (
            "exit",
            json!({"id":"X","emp":"E","lwd":t,"assets":"Pending","ff":"Pending"}),
        ),
        (
            "vendors",
            json!({"id":"V","cat":"IT","name":"Vendor","end":t,"status":"Active"}),
        ),
        ("goals", json!({"id":"G","emp":"E","status":"Active"})),
    ] {
        st.set_recs(k, vec![row]);
    }
    rules::run_rules(&mut st, &a);
    assert_eq!(st.live("actions").len(), 8);
    rules::run_rules(&mut st, &a);
    assert_eq!(st.live("actions").len(), 8);
    for k in [
        "probation",
        "appraisal",
        "docs",
        "statutory",
        "offers2",
        "exit",
        "vendors",
    ] {
        st.set_recs(k, vec![])
    }
    st.set_recs(
        "checkins",
        vec![json!({"emp":"E","status":"Completed","date":t})],
    );
    rules::run_rules(&mut st, &a);
    assert!(st.live("actions").iter().all(|r| s(r, "status") == "Done"));
}
#[test]
fn stale_browser_patch_cannot_overwrite_other_sessions() {
    let base = state();
    let mut latest = base.clone();
    latest.demo["company"]["name"] = json!("Changed elsewhere");
    let mut next = base.clone();
    next.demo["company"]["name"] = json!("Stale edit");
    assert!(sync::apply(&mut latest, &base, &next, &actor("HR Admin")).is_err());
}
#[test]
fn employee_cannot_edit_other_employee_pay_or_grant_admin() {
    let mut base = state();
    let mut a = actor("Employee");
    a.role = "Employee".into();
    a.viewas = None;
    let mut next = base.clone();
    next.demo["employees"][0]["ctc"] = json!(99999999);
    let original = base.clone();
    assert!(sync::apply(&mut base, &original, &next, &a).is_err());
}

#[test]
fn anonymous_survey_groups_mask_scores_until_minimum() {
    let mut st = state();
    let a = actor("HR Admin");
    st.set_recs(
        "surveys",
        vec![json!({"id":"SV-1","stmts":"My manager supports my growth","status":"Open"})],
    );
    st.live["data"]["resp"] = json!((0..4)
        .map(|_| json!({"s":"SV-1","dept":"Engineering","nps":10,"sc":[5]}))
        .collect::<Vec<_>>());
    let hidden = brightcone_people_plus::services::advanced::survey_groups(&st, &a, "SV-1");
    assert_eq!(hidden["all"]["n"], 4);
    assert!(hidden["all"]["enps"].is_null());
    assert!(hidden["all"]["avg"][0][1].is_null());
    st.live["data"]["resp"]
        .as_array_mut()
        .unwrap()
        .push(json!({"s":"SV-1","dept":"Engineering","nps":10,"sc":[5]}));
    let shown = brightcone_people_plus::services::advanced::survey_groups(&st, &a, "SV-1");
    assert_eq!(shown["all"]["enps"], 100.);
    assert_eq!(shown["all"]["avg"][0][1], 5.);
    assert_eq!(shown["all"]["rs"], json!([]));
}
#[test]
fn candidate_conversion_closes_requirement_and_creates_checklist() {
    use brightcone_people_plus::services::actions;
    let mut st = state();
    let a = actor("HR Admin");
    st.set_recs(
        "cands",
        vec![json!({"id":"C","name":"Test Candidate","req":"M","stage":"Selected"})],
    );
    st.set_recs(
        "manpower",
        vec![json!({"id":"M","positions":1,"status":"Approved"})],
    );
    st.set_recs(
        "offers2",
        vec![json!({"id":"O","cand":"C","status":"Sent","odate":"2026-10-01"})],
    );
    let e = json!({"id":"E","doj":"2026-11-01"});
    actions::converted(&mut st, &json!({"kind":"candidate","id":"C"}), &e, &a).unwrap();
    assert_eq!(st.live("cands")[0]["stage"], "Joined");
    assert_eq!(st.live("offers2")[0]["status"], "Accepted");
    assert_eq!(st.live("manpower")[0]["status"], "Closed");
    assert_eq!(st.live("joining").len(), 1);
    assert_eq!(st.live("onboard2").len(), 8);
    assert_eq!(actions::checklist(&mut st, &e, &a), 0);
}
#[test]
fn duration_strings_and_roster_override_match_html() {
    assert_eq!(hours("09:30", "18:45"), "9h 15m");
    assert_eq!(hours("18:45", "09:30"), "");
    let mut st = state();
    st.demo["roster"]["BC-1038|2026-08-12"] = json!("Night support");
    assert_eq!(shift_on(&st, "BC-1038", "2026-08-12"), "Night support");
    assert_eq!(shift_on(&st, "BC-1038", "2026-08-13"), "Leave");
    assert_eq!(shift_on(&st, "BC-1038", "2026-10-31"), "Off");
}
#[test]
fn javascript_rounding_matches_binary_decimal_edges() {
    assert_eq!(js_fixed(2.675, 2), 2.67);
    assert_eq!(js_fixed(0.125, 2), 0.13);
    assert_eq!(js_fixed(-0.125, 2), -0.13);
    assert_eq!(js_round(-12.5), -12.);
}
#[test]
fn employee_payload_omits_other_peoples_private_records() {
    let st = state();
    let a = Actor {
        email: "rahul.varma@brightcone.ai".into(),
        name: "Rahul Varma".into(),
        role: "Employee".into(),
        viewas: None,
        sid: uuid::Uuid::new_v4(),
    };
    let visible = access::scoped(&st, &a);
    assert!(visible.demo["accounts"]
        .as_array()
        .unwrap()
        .iter()
        .all(|r| r["pass"].is_null() && r["pass_hash"].is_null()));
    assert!(access::scoped(&st, &actor("HR Admin")).demo["accounts"]
        .as_array()
        .unwrap()
        .iter()
        .all(|r| r["pass"].is_null() && r["pass_hash"].is_null()));
    assert!(visible.demo["sign"]
        .as_array()
        .unwrap()
        .iter()
        .all(|r| s(r, "to") == a.name));
    assert!(visible.demo["feedback"]
        .as_array()
        .unwrap()
        .iter()
        .all(|r| s(r, "from") == a.name || s(r, "to") == a.name));
    assert!(visible.demo["payroll"]["inputs"]
        .as_array()
        .unwrap()
        .iter()
        .all(|r| s(r, "emp") == a.name));
    assert!(visible.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .filter(|r| s(r, "name") != a.name)
        .all(|r| r["ctc"].is_null()));
}
#[test]
fn employee_referral_creates_its_candidate_with_source_score() {
    let mut st = state();
    let a = Actor {
        email: "rahul.varma@brightcone.ai".into(),
        name: "Rahul Varma".into(),
        role: "Employee".into(),
        viewas: None,
        sid: uuid::Uuid::new_v4(),
    };
    let base = access::scoped(&st, &a);
    let mut draft = base.clone();
    draft.demo["referrals"].as_array_mut().unwrap().push(
        json!({"id":"RF-test","by":a.name,"cand":"Referral Test","job":"J1","status":"Applied"}),
    );
    draft.demo["cands"].as_array_mut().unwrap().push(json!({"id":"C-test","n":"Referral Test","job":"J1","s":"Applied","sc":99,"src":"Referral"}));
    sync::apply(&mut st, &base, &draft, &a).unwrap();
    assert_eq!(
        st.demo["cands"]
            .as_array()
            .unwrap()
            .iter()
            .find(|r| s(r, "id") == "C-test")
            .unwrap()["sc"],
        80
    );
}
