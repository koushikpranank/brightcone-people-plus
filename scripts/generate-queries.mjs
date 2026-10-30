import fs from 'node:fs';
const tables=JSON.parse(fs.readFileSync(new URL('../backend/src/models/tables.json',import.meta.url),'utf8'));
let out='// Generated static SQLx queries, checked against PostgreSQL and cached in .sqlx.\nuse serde_json::Value;\nuse sqlx::PgConnection;\npub struct RecordRow {pub id:String,pub record:Value}\n';
for(const operation of ['select','upsert','delete']){
 out+=operation==='select'?`pub async fn select(db:&mut PgConnection,group:&str,key:&str)->Result<Vec<RecordRow>,sqlx::Error>{match(group,key){\n`:operation==='upsert'?`pub async fn upsert(db:&mut PgConnection,group:&str,key:&str,id:&str,position:i32,record:&Value)->Result<(),sqlx::Error>{let _=match(group,key){\n`:`pub async fn delete(db:&mut PgConnection,group:&str,key:&str,id:&str)->Result<(),sqlx::Error>{let _=match(group,key){\n`;
 for(const[group,map]of Object.entries(tables))for(const[key,m]of Object.entries(map)){
  let sql,call;
  if(operation==='select'){sql=`SELECT id, record FROM ${m.table} ORDER BY position`;call=`sqlx::query_as!(RecordRow,${JSON.stringify(sql)}).fetch_all(db).await`}
  if(operation==='upsert'){sql=`INSERT INTO ${m.table} (id,position,record) VALUES ($1,$2,$3) ON CONFLICT(id) DO UPDATE SET position=EXCLUDED.position, record=EXCLUDED.record`;call=`sqlx::query!(${JSON.stringify(sql)},id,position,record).execute(db).await?`}
  if(operation==='delete'){sql=`DELETE FROM ${m.table} WHERE id=$1`;call=`sqlx::query!(${JSON.stringify(sql)},id).execute(db).await?`}
  out+=`(${JSON.stringify(group)},${JSON.stringify(key)})=>${call},\n`;
 }
 out+=operation==='select'?'_=>Err(sqlx::Error::RowNotFound)}}\n':'_=>return Err(sqlx::Error::RowNotFound)};Ok(())}\n';
}
fs.writeFileSync(new URL('../backend/src/models/queries.rs',import.meta.url),out);
