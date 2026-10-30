use brightcone_people_plus::{
    models::Snapshot,
    services::{auth::Actor, money},
};
use serde_json::json;
fn state() -> Snapshot {
    Snapshot {
        demo: serde_json::from_str(include_str!("../src/seeders/demo.json")).unwrap(),
        live: serde_json::from_str(include_str!("../src/seeders/live.json")).unwrap(),
    }
}
#[test]
fn custom_components_and_one_time_inputs_change_real_totals() {
    let mut p = money::defaults();
    p.components
        .iter_mut()
        .find(|c| c.id == "pt")
        .unwrap()
        .value = 350.;
    p.components.push(money::Component {
        id: "transport".into(),
        name: "Transport allowance".into(),
        kind: "earning".into(),
        basis: "fixed".into(),
        value: 2500.,
    });
    money::validate(&p).unwrap();
    let r = money::salary_with(
        &p,
        &json!({"id":"k","ctc":1200000}),
        &[
            json!({"k":"Bonus","amt":10000}),
            json!({"k":"Loan recovery","amt":1200}),
        ],
    )
    .unwrap();
    assert_eq!(r["gross"], 105200.);
    assert_eq!(r["net"], 95516.67);
    assert_eq!(r["professionalTax"], 350.);
    let mut custom = p.components.clone();
    custom.iter_mut().find(|c| c.id == "basic").unwrap().value = 50.;
    p.overrides
        .insert("k".into(), money::Override { components: custom });
    let adjusted = money::salary_with(&p, &json!({"id":"k","ctc":1200000}), &[]).unwrap();
    assert_eq!(adjusted["basic"], 50000.);
    assert_eq!(adjusted["net"], 84316.67);
}
#[test]
fn invalid_and_circular_or_negative_components_are_rejected() {
    let mut p = money::defaults();
    p.settlementDivisor = 0.;
    assert!(money::validate(&p).is_err());
    p.settlementDivisor = 26.;
    p.components[0].basis = "gross".into();
    assert!(money::validate(&p).is_err());
    p.components[0].basis = "monthly_ctc".into();
    p.components[0].value = -10.;
    assert!(money::validate(&p).is_err());
}
#[test]
fn settlement_uses_hr_inputs_and_actual_completed_years() {
    let mut s = state();
    let mut p = money::defaults();
    p.leaveEncashPercent = 50.;
    p.gratuityDays = 20.;
    p.gratuityMinYears = 1.;
    s.live["settings"]["money"] = json!(p);
    let r=money::settlement(&s,&json!({"id":"k","ctc":1200000,"joined":"2020-10-30"}),&json!({"date":"2026-10-30","workedDays":13,"leaveDays":2,"reimbursements":1000,"noticeRecovery":500,"otherEarnings":200,"otherDeductions":100})).unwrap();
    assert_eq!(r["serviceYears"], 6.);
    assert_eq!(r["salary"], 47600.);
    assert_eq!(r["leaveEncashment"], 3287.67);
    assert_eq!(r["gratuity"], 184615.38);
    assert_eq!(r["net"], 236103.05);
}
#[test]
fn live_identity_and_exit_are_connected_to_portal_auth() {
    let old = state();
    let mut next = old.clone();
    let a = Actor {
        email: "ananya.rao@brightcone.ai".into(),
        name: "Ananya Rao".into(),
        role: "HR Admin".into(),
        viewas: None,
        sid: uuid::Uuid::new_v4(),
    };
    next.set_recs("emp",vec![json!({"id":"BC-KOUS","first":"Koushik","last":"Reddy","email":"koushik.test@brightcone.ai","designation":"Engineer","status":"Probation","doj":"2026-01-05","ctc":1200000})]);
    money::reconcile_employees(&old, &mut next, &a);
    assert!(next.demo["accounts"]
        .as_array()
        .unwrap()
        .iter()
        .any(|x| x["email"] == "koushik.test@brightcone.ai"));
    assert_eq!(
        next.live["settings"]["acc"]["koushik.test@brightcone.ai"]["emp"],
        "BC-KOUS"
    );
    let before = next.clone();
    next.live["data"]["emp"][0]["status"] = json!("Exited");
    money::reconcile_employees(&before, &mut next, &a);
    assert_eq!(
        next.demo["employees"]
            .as_array()
            .unwrap()
            .iter()
            .find(|x| x["id"] == "BC-KOUS")
            .unwrap()["status"],
        "Inactive"
    );
    assert_eq!(
        next.demo["accounts"]
            .as_array()
            .unwrap()
            .iter()
            .find(|x| x["email"] == "koushik.test@brightcone.ai")
            .unwrap()["status"],
        "Disabled"
    );
    let exited = next.clone();
    next.live["data"]["emp"][0]["status"] = json!("Active");
    money::reconcile_employees(&exited, &mut next, &a);
    assert_eq!(
        next.demo["accounts"]
            .as_array()
            .unwrap()
            .iter()
            .find(|x| x["email"] == "koushik.test@brightcone.ai")
            .unwrap()["status"],
        "Active"
    );
}
#[test]
fn linking_an_existing_admin_preserves_the_admin_role() {
    let old = state();
    let mut next = old.clone();
    let e = old.demo["employees"]
        .as_array()
        .unwrap()
        .iter()
        .find(|e| e["name"] == "Ananya Rao")
        .unwrap();
    next.set_recs("emp",vec![json!({"id":e["id"],"first":"Ananya","last":"Rao","email":"ananya.rao@brightcone.ai","designation":e["role"],"status":"Active","doj":e["joined"]})]);
    let a = Actor {
        email: "ananya.rao@brightcone.ai".into(),
        name: "Ananya Rao".into(),
        role: "HR Admin".into(),
        viewas: None,
        sid: uuid::Uuid::new_v4(),
    };
    money::reconcile_employees(&old, &mut next, &a);
    assert_eq!(
        next.live["settings"]["acc"]["ananya.rao@brightcone.ai"]["role"],
        "HR Admin"
    );
}
