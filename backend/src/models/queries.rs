// Generated static SQLx queries, checked against PostgreSQL and cached in .sqlx.
use serde_json::Value;
use sqlx::PgConnection;
pub struct RecordRow {
    pub id: String,
    pub record: Value,
}
pub async fn select(
    db: &mut PgConnection,
    group: &str,
    key: &str,
) -> Result<Vec<RecordRow>, sqlx::Error> {
    match (group, key) {
        ("demo", "role") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"role\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "clockedIn") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"clockedIn\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "clockStart") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"clockStart\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "company") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"company\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "employees") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"employees\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "depts") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"depts\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "grades") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"grades\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "locations") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"locations\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "shifts") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"shifts\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "leaveTypes") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"leaveTypes\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "holidays") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"holidays\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "leaves") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"leaves\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "regs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"regs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "expenses") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"expenses\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "tickets") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"tickets\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "announcements") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"announcements\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "policies") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"policies\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "letters") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"letters\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "empDocs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"empDocs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "assets") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"assets\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "assetReqs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"assetReqs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "jobs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"jobs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "cands") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"cands\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "interviews") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"interviews\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "referrals") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"referrals\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "cycle") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"cycle\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "reviews") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"reviews\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "goals") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"goals\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "feedback") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"feedback\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "courses") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"courses\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "progress") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"progress\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "plans") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"plans\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "dependents") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"dependents\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "onboard") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"onboard\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "resignations") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"resignations\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "payroll") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"payroll\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "decl") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"decl\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "perms") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"perms\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "workflows") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"workflows\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "notif") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"notif\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "audit") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"audit\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "sign") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"sign\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "signTpls") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"signTpls\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "posts") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"posts\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "groups") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"groups\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "swaps") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"swaps\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "roster") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"roster\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "published") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"published\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "resetAt") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"resetAt\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "accounts") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"accounts\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("demo", "v") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM demo.\"v\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "emp") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"emp\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "profile") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"profile\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "probation") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"probation\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "docs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"docs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "exit") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"exit\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "appraisal") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"appraisal\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "reviews") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"reviews\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "probrev") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"probrev\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "increments") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"increments\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "recog") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"recog\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "assets2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"assets2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "cards") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"cards\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "facilities") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"facilities\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "vendors") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"vendors\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "manpower") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"manpower\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "cands") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"cands\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "interviews2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"interviews2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "offers2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"offers2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "joining") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"joining\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "onboard2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"onboard2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "interns") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"interns\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "att") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"att\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "logs") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"logs\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "leaves2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"leaves2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "wfh") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"wfh\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "compoff") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"compoff\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "holidays2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"holidays2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "payroll2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"payroll2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "structure") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"structure\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "revisions") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"revisions\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "payslips2") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"payslips2\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "pfesi") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"pfesi\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "statutory") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"statutory\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "events") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"events\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "feedback") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"feedback\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "townhall") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"townhall\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "training") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"training\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "posh") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"posh\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "sectrain") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"sectrain\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "handbook") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"handbook\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "policies") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"policies\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "acks") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"acks\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "officeexp") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"officeexp\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "goals") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"goals\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "checkins") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"checkins\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "pips") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"pips\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "promos") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"promos\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "idps") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"idps\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "succession") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"succession\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "surveys") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"surveys\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "licences") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"licences\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        ("live", "actions") => {
            sqlx::query_as!(
                RecordRow,
                "SELECT id, record FROM live.\"actions\" ORDER BY position"
            )
            .fetch_all(db)
            .await
        }
        _ => Err(sqlx::Error::RowNotFound),
    }
}
pub async fn upsert(
    db: &mut PgConnection,
    group: &str,
    key: &str,
    id: &str,
    position: i32,
    record: &Value,
) -> Result<(), sqlx::Error> {
    let _=match(group,key){
("demo","role")=>sqlx::query!("INSERT INTO demo.\"role\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","clockedIn")=>sqlx::query!("INSERT INTO demo.\"clockedIn\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","clockStart")=>sqlx::query!("INSERT INTO demo.\"clockStart\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","company")=>sqlx::query!("INSERT INTO demo.\"company\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","employees")=>sqlx::query!("INSERT INTO demo.\"employees\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","depts")=>sqlx::query!("INSERT INTO demo.\"depts\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","grades")=>sqlx::query!("INSERT INTO demo.\"grades\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","locations")=>sqlx::query!("INSERT INTO demo.\"locations\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","shifts")=>sqlx::query!("INSERT INTO demo.\"shifts\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","leaveTypes")=>sqlx::query!("INSERT INTO demo.\"leaveTypes\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","holidays")=>sqlx::query!("INSERT INTO demo.\"holidays\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","leaves")=>sqlx::query!("INSERT INTO demo.\"leaves\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","regs")=>sqlx::query!("INSERT INTO demo.\"regs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","expenses")=>sqlx::query!("INSERT INTO demo.\"expenses\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","tickets")=>sqlx::query!("INSERT INTO demo.\"tickets\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","announcements")=>sqlx::query!("INSERT INTO demo.\"announcements\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","policies")=>sqlx::query!("INSERT INTO demo.\"policies\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","letters")=>sqlx::query!("INSERT INTO demo.\"letters\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","empDocs")=>sqlx::query!("INSERT INTO demo.\"empDocs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","assets")=>sqlx::query!("INSERT INTO demo.\"assets\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","assetReqs")=>sqlx::query!("INSERT INTO demo.\"assetReqs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","jobs")=>sqlx::query!("INSERT INTO demo.\"jobs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","cands")=>sqlx::query!("INSERT INTO demo.\"cands\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","interviews")=>sqlx::query!("INSERT INTO demo.\"interviews\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","referrals")=>sqlx::query!("INSERT INTO demo.\"referrals\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","cycle")=>sqlx::query!("INSERT INTO demo.\"cycle\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","reviews")=>sqlx::query!("INSERT INTO demo.\"reviews\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","goals")=>sqlx::query!("INSERT INTO demo.\"goals\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","feedback")=>sqlx::query!("INSERT INTO demo.\"feedback\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","courses")=>sqlx::query!("INSERT INTO demo.\"courses\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","progress")=>sqlx::query!("INSERT INTO demo.\"progress\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","plans")=>sqlx::query!("INSERT INTO demo.\"plans\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","dependents")=>sqlx::query!("INSERT INTO demo.\"dependents\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","onboard")=>sqlx::query!("INSERT INTO demo.\"onboard\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","resignations")=>sqlx::query!("INSERT INTO demo.\"resignations\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","payroll")=>sqlx::query!("INSERT INTO demo.\"payroll\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","decl")=>sqlx::query!("INSERT INTO demo.\"decl\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","perms")=>sqlx::query!("INSERT INTO demo.\"perms\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","workflows")=>sqlx::query!("INSERT INTO demo.\"workflows\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","notif")=>sqlx::query!("INSERT INTO demo.\"notif\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","audit")=>sqlx::query!("INSERT INTO demo.\"audit\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","sign")=>sqlx::query!("INSERT INTO demo.\"sign\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","signTpls")=>sqlx::query!("INSERT INTO demo.\"signTpls\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","posts")=>sqlx::query!("INSERT INTO demo.\"posts\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","groups")=>sqlx::query!("INSERT INTO demo.\"groups\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","swaps")=>sqlx::query!("INSERT INTO demo.\"swaps\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","roster")=>sqlx::query!("INSERT INTO demo.\"roster\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","published")=>sqlx::query!("INSERT INTO demo.\"published\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","resetAt")=>sqlx::query!("INSERT INTO demo.\"resetAt\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","accounts")=>sqlx::query!("INSERT INTO demo.\"accounts\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("demo","v")=>sqlx::query!("INSERT INTO demo.\"v\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","emp")=>sqlx::query!("INSERT INTO live.\"emp\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","profile")=>sqlx::query!("INSERT INTO live.\"profile\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","probation")=>sqlx::query!("INSERT INTO live.\"probation\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","docs")=>sqlx::query!("INSERT INTO live.\"docs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","exit")=>sqlx::query!("INSERT INTO live.\"exit\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","appraisal")=>sqlx::query!("INSERT INTO live.\"appraisal\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","reviews")=>sqlx::query!("INSERT INTO live.\"reviews\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","probrev")=>sqlx::query!("INSERT INTO live.\"probrev\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","increments")=>sqlx::query!("INSERT INTO live.\"increments\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","recog")=>sqlx::query!("INSERT INTO live.\"recog\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","assets2")=>sqlx::query!("INSERT INTO live.\"assets2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","cards")=>sqlx::query!("INSERT INTO live.\"cards\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","facilities")=>sqlx::query!("INSERT INTO live.\"facilities\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","vendors")=>sqlx::query!("INSERT INTO live.\"vendors\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","manpower")=>sqlx::query!("INSERT INTO live.\"manpower\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","cands")=>sqlx::query!("INSERT INTO live.\"cands\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","interviews2")=>sqlx::query!("INSERT INTO live.\"interviews2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","offers2")=>sqlx::query!("INSERT INTO live.\"offers2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","joining")=>sqlx::query!("INSERT INTO live.\"joining\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","onboard2")=>sqlx::query!("INSERT INTO live.\"onboard2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","interns")=>sqlx::query!("INSERT INTO live.\"interns\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","att")=>sqlx::query!("INSERT INTO live.\"att\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","logs")=>sqlx::query!("INSERT INTO live.\"logs\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","leaves2")=>sqlx::query!("INSERT INTO live.\"leaves2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","wfh")=>sqlx::query!("INSERT INTO live.\"wfh\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","compoff")=>sqlx::query!("INSERT INTO live.\"compoff\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","holidays2")=>sqlx::query!("INSERT INTO live.\"holidays2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","payroll2")=>sqlx::query!("INSERT INTO live.\"payroll2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","structure")=>sqlx::query!("INSERT INTO live.\"structure\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","revisions")=>sqlx::query!("INSERT INTO live.\"revisions\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","payslips2")=>sqlx::query!("INSERT INTO live.\"payslips2\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","pfesi")=>sqlx::query!("INSERT INTO live.\"pfesi\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","statutory")=>sqlx::query!("INSERT INTO live.\"statutory\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","events")=>sqlx::query!("INSERT INTO live.\"events\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","feedback")=>sqlx::query!("INSERT INTO live.\"feedback\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","townhall")=>sqlx::query!("INSERT INTO live.\"townhall\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","training")=>sqlx::query!("INSERT INTO live.\"training\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","posh")=>sqlx::query!("INSERT INTO live.\"posh\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","sectrain")=>sqlx::query!("INSERT INTO live.\"sectrain\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","handbook")=>sqlx::query!("INSERT INTO live.\"handbook\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","policies")=>sqlx::query!("INSERT INTO live.\"policies\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","acks")=>sqlx::query!("INSERT INTO live.\"acks\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","officeexp")=>sqlx::query!("INSERT INTO live.\"officeexp\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","goals")=>sqlx::query!("INSERT INTO live.\"goals\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","checkins")=>sqlx::query!("INSERT INTO live.\"checkins\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","pips")=>sqlx::query!("INSERT INTO live.\"pips\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","promos")=>sqlx::query!("INSERT INTO live.\"promos\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","idps")=>sqlx::query!("INSERT INTO live.\"idps\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","succession")=>sqlx::query!("INSERT INTO live.\"succession\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","surveys")=>sqlx::query!("INSERT INTO live.\"surveys\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","licences")=>sqlx::query!("INSERT INTO live.\"licences\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
("live","actions")=>sqlx::query!("INSERT INTO live.\"actions\" (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record",id,position,record).execute(db).await?,
_=>return Err(sqlx::Error::RowNotFound)};
    Ok(())
}
pub async fn delete(
    db: &mut PgConnection,
    group: &str,
    key: &str,
    id: &str,
) -> Result<(), sqlx::Error> {
    let _ = match (group, key) {
        ("demo", "role") => {
            sqlx::query!("DELETE FROM demo.\"role\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "clockedIn") => {
            sqlx::query!("DELETE FROM demo.\"clockedIn\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "clockStart") => {
            sqlx::query!("DELETE FROM demo.\"clockStart\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "company") => {
            sqlx::query!("DELETE FROM demo.\"company\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "employees") => {
            sqlx::query!("DELETE FROM demo.\"employees\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "depts") => {
            sqlx::query!("DELETE FROM demo.\"depts\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "grades") => {
            sqlx::query!("DELETE FROM demo.\"grades\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "locations") => {
            sqlx::query!("DELETE FROM demo.\"locations\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "shifts") => {
            sqlx::query!("DELETE FROM demo.\"shifts\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "leaveTypes") => {
            sqlx::query!("DELETE FROM demo.\"leaveTypes\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "holidays") => {
            sqlx::query!("DELETE FROM demo.\"holidays\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "leaves") => {
            sqlx::query!("DELETE FROM demo.\"leaves\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "regs") => {
            sqlx::query!("DELETE FROM demo.\"regs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "expenses") => {
            sqlx::query!("DELETE FROM demo.\"expenses\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "tickets") => {
            sqlx::query!("DELETE FROM demo.\"tickets\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "announcements") => {
            sqlx::query!("DELETE FROM demo.\"announcements\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "policies") => {
            sqlx::query!("DELETE FROM demo.\"policies\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "letters") => {
            sqlx::query!("DELETE FROM demo.\"letters\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "empDocs") => {
            sqlx::query!("DELETE FROM demo.\"empDocs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "assets") => {
            sqlx::query!("DELETE FROM demo.\"assets\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "assetReqs") => {
            sqlx::query!("DELETE FROM demo.\"assetReqs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "jobs") => {
            sqlx::query!("DELETE FROM demo.\"jobs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "cands") => {
            sqlx::query!("DELETE FROM demo.\"cands\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "interviews") => {
            sqlx::query!("DELETE FROM demo.\"interviews\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "referrals") => {
            sqlx::query!("DELETE FROM demo.\"referrals\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "cycle") => {
            sqlx::query!("DELETE FROM demo.\"cycle\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "reviews") => {
            sqlx::query!("DELETE FROM demo.\"reviews\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "goals") => {
            sqlx::query!("DELETE FROM demo.\"goals\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "feedback") => {
            sqlx::query!("DELETE FROM demo.\"feedback\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "courses") => {
            sqlx::query!("DELETE FROM demo.\"courses\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "progress") => {
            sqlx::query!("DELETE FROM demo.\"progress\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "plans") => {
            sqlx::query!("DELETE FROM demo.\"plans\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "dependents") => {
            sqlx::query!("DELETE FROM demo.\"dependents\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "onboard") => {
            sqlx::query!("DELETE FROM demo.\"onboard\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "resignations") => {
            sqlx::query!("DELETE FROM demo.\"resignations\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "payroll") => {
            sqlx::query!("DELETE FROM demo.\"payroll\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "decl") => {
            sqlx::query!("DELETE FROM demo.\"decl\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "perms") => {
            sqlx::query!("DELETE FROM demo.\"perms\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "workflows") => {
            sqlx::query!("DELETE FROM demo.\"workflows\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "notif") => {
            sqlx::query!("DELETE FROM demo.\"notif\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "audit") => {
            sqlx::query!("DELETE FROM demo.\"audit\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "sign") => {
            sqlx::query!("DELETE FROM demo.\"sign\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "signTpls") => {
            sqlx::query!("DELETE FROM demo.\"signTpls\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "posts") => {
            sqlx::query!("DELETE FROM demo.\"posts\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "groups") => {
            sqlx::query!("DELETE FROM demo.\"groups\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "swaps") => {
            sqlx::query!("DELETE FROM demo.\"swaps\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "roster") => {
            sqlx::query!("DELETE FROM demo.\"roster\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "published") => {
            sqlx::query!("DELETE FROM demo.\"published\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "resetAt") => {
            sqlx::query!("DELETE FROM demo.\"resetAt\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "accounts") => {
            sqlx::query!("DELETE FROM demo.\"accounts\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("demo", "v") => {
            sqlx::query!("DELETE FROM demo.\"v\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "emp") => {
            sqlx::query!("DELETE FROM live.\"emp\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "profile") => {
            sqlx::query!("DELETE FROM live.\"profile\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "probation") => {
            sqlx::query!("DELETE FROM live.\"probation\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "docs") => {
            sqlx::query!("DELETE FROM live.\"docs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "exit") => {
            sqlx::query!("DELETE FROM live.\"exit\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "appraisal") => {
            sqlx::query!("DELETE FROM live.\"appraisal\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "reviews") => {
            sqlx::query!("DELETE FROM live.\"reviews\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "probrev") => {
            sqlx::query!("DELETE FROM live.\"probrev\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "increments") => {
            sqlx::query!("DELETE FROM live.\"increments\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "recog") => {
            sqlx::query!("DELETE FROM live.\"recog\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "assets2") => {
            sqlx::query!("DELETE FROM live.\"assets2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "cards") => {
            sqlx::query!("DELETE FROM live.\"cards\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "facilities") => {
            sqlx::query!("DELETE FROM live.\"facilities\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "vendors") => {
            sqlx::query!("DELETE FROM live.\"vendors\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "manpower") => {
            sqlx::query!("DELETE FROM live.\"manpower\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "cands") => {
            sqlx::query!("DELETE FROM live.\"cands\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "interviews2") => {
            sqlx::query!("DELETE FROM live.\"interviews2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "offers2") => {
            sqlx::query!("DELETE FROM live.\"offers2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "joining") => {
            sqlx::query!("DELETE FROM live.\"joining\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "onboard2") => {
            sqlx::query!("DELETE FROM live.\"onboard2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "interns") => {
            sqlx::query!("DELETE FROM live.\"interns\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "att") => {
            sqlx::query!("DELETE FROM live.\"att\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "logs") => {
            sqlx::query!("DELETE FROM live.\"logs\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "leaves2") => {
            sqlx::query!("DELETE FROM live.\"leaves2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "wfh") => {
            sqlx::query!("DELETE FROM live.\"wfh\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "compoff") => {
            sqlx::query!("DELETE FROM live.\"compoff\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "holidays2") => {
            sqlx::query!("DELETE FROM live.\"holidays2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "payroll2") => {
            sqlx::query!("DELETE FROM live.\"payroll2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "structure") => {
            sqlx::query!("DELETE FROM live.\"structure\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "revisions") => {
            sqlx::query!("DELETE FROM live.\"revisions\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "payslips2") => {
            sqlx::query!("DELETE FROM live.\"payslips2\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "pfesi") => {
            sqlx::query!("DELETE FROM live.\"pfesi\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "statutory") => {
            sqlx::query!("DELETE FROM live.\"statutory\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "events") => {
            sqlx::query!("DELETE FROM live.\"events\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "feedback") => {
            sqlx::query!("DELETE FROM live.\"feedback\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "townhall") => {
            sqlx::query!("DELETE FROM live.\"townhall\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "training") => {
            sqlx::query!("DELETE FROM live.\"training\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "posh") => {
            sqlx::query!("DELETE FROM live.\"posh\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "sectrain") => {
            sqlx::query!("DELETE FROM live.\"sectrain\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "handbook") => {
            sqlx::query!("DELETE FROM live.\"handbook\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "policies") => {
            sqlx::query!("DELETE FROM live.\"policies\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "acks") => {
            sqlx::query!("DELETE FROM live.\"acks\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "officeexp") => {
            sqlx::query!("DELETE FROM live.\"officeexp\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "goals") => {
            sqlx::query!("DELETE FROM live.\"goals\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "checkins") => {
            sqlx::query!("DELETE FROM live.\"checkins\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "pips") => {
            sqlx::query!("DELETE FROM live.\"pips\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "promos") => {
            sqlx::query!("DELETE FROM live.\"promos\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "idps") => {
            sqlx::query!("DELETE FROM live.\"idps\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "succession") => {
            sqlx::query!("DELETE FROM live.\"succession\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "surveys") => {
            sqlx::query!("DELETE FROM live.\"surveys\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "licences") => {
            sqlx::query!("DELETE FROM live.\"licences\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        ("live", "actions") => {
            sqlx::query!("DELETE FROM live.\"actions\" WHERE id=$1", id)
                .execute(db)
                .await?
        }
        _ => return Err(sqlx::Error::RowNotFound),
    };
    Ok(())
}
