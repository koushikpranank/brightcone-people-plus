import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const url=process.env.TEST_API_URL||'http://127.0.0.1:5156/api';
const seed=JSON.parse(fs.readFileSync(new URL('../backend/src/seeders/demo.json',import.meta.url),'utf8'));
const meta=JSON.parse(fs.readFileSync(new URL('../backend/src/models/registry.json',import.meta.url),'utf8'));
let token='';
async function api(path,method='GET',body,auth=token){const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});return {status:r.status,data:await r.json()}}
async function login(email='ananya.rao@brightcone.ai',password='Admin@123'){const r=await api('/auth/signin','POST',{email,password,remember:false},'');assert.equal(r.status,200,JSON.stringify(r.data));return r.data.token}
async function change(fn){const r=await api('/auth/me');assert.equal(r.status,200);const base={demo:r.data.demo,live:r.data.live},next=structuredClone(base);fn(next);const x=await api('/state','PATCH',{base,next});assert.equal(x.status,200,JSON.stringify(x.data));return x.data}
test('native API: auth roles, 52 registers, archive/restore, lockout, backup and access scopes',{timeout:600000},async()=>{
 token=await login();
 assert.equal((await api('/auth/me','GET',undefined,'')).status,401);
 for(const a of seed.accounts){const own=await login(a.email,a.pass);const r=await api('/auth/me','GET',undefined,own);assert.equal(r.status,200);assert.equal(r.data.user.email,a.email);assert(!r.data.demo.accounts.some(x=>x.pass||x.pass_hash));}
 token=await login();
 const suffix=Date.now().toString(36),ids={};let index=0;
 const day=new Date().toISOString().slice(0,10);
 for(const[k,d]of Object.entries(meta)){
  assert.equal((await api('/reg/'+k,'GET',undefined,'')).status,401,k);
  assert.equal((await api('/reg/'+k)).status,200,k);
  const vals={...d.defaults};
  for(const f of d.f){if(f.ro||f.noForm)continue;let v='';if(f.t==='emp')v=ids.emp||'';else if(f.t==='ref')v=ids[f.ref]||'';else if(f.t==='tel')v='+919000000001';else if(f.t==='email')v=`api.${k}.${suffix}@brightcone.ai`;else if(['money','number'].includes(f.t))v=1;else if(f.t==='date')v=day;else if(f.t==='month')v=day.slice(0,7);else if(f.t==='time')v='09:00';else if(f.t==='yesno')v='Yes';else if(f.t==='select')v=f.o?.[0]||(f.k==='aud'?'All employees':'');else if(f.req)v=`API ${k} ${suffix}-${++index}`;if(vals[f.k]===undefined)vals[f.k]=v;}
  if(k==='profile')Object.assign(vals,{aadhaar:'',pan:'',ifsc:''});
  if(k==='leaves2'){
   const workday=new Date(day+'T00:00:00Z');
   while([0,6].includes(workday.getUTCDay()))workday.setUTCDate(workday.getUTCDate()+1);
   Object.assign(vals,{from:workday.toISOString().slice(0,10),to:workday.toISOString().slice(0,10)});
  }
  if(k==='acks')vals.policy=ids.policies;
  if(k==='pfesi')vals.challan='API-'+suffix;
  if(k==='holidays2')vals.date=new Date(Date.UTC(2030,0,1)+((Math.floor(Date.now()/1000)%10000)*86400000)).toISOString().slice(0,10);
  if(k==='vendors')vals.gstin='';if(k==='cards')vals.holder='API holder';if(k==='cands')vals.consent='Yes';
  if(k==='goals')Object.assign(vals,{weight:1,progress:0,status:'Draft',cycle:suffix});
  if(k==='payroll2')Object.assign(vals,{month:day.slice(0,7),gross:100,ded:1,wdays:22,lop:0});
  if(k==='surveys')Object.assign(vals,{aud:'All employees',stmts:'My manager supports my growth',status:'Draft',open:day,close:day});
  if(k==='succession')Object.assign(vals,{s1:'',s2:'',s3:''});
  const r=await api('/reg/'+k,'POST',vals);assert.equal(r.status,200,k+': '+JSON.stringify(r.data));ids[k]=r.data.record.id;
  const field=d.f.find(f=>f.t==='text'&&!f.ro&&!f.noForm&&!['pan','aadhaar','ifsc','gstin','email'].includes(f.k));if(field)vals[field.k]='Updated '+vals[field.k];
  const update=await api('/reg/'+k+'/'+encodeURIComponent(ids[k]),'PATCH',vals);assert.equal(update.status,200,k+': '+JSON.stringify(update.data));if(field)assert.equal(update.data.record[field.k],vals[field.k]);
 }
 for(const[k,id]of Object.entries(ids)){const a=await api('/reg/'+k+'/'+encodeURIComponent(id),'DELETE');assert.equal(a.status,200,k);assert.equal(a.data.record._arch,true);const r=await api('/reg/'+k+'/'+encodeURIComponent(id)+'/restore','POST');assert.equal(r.status,200,k);assert.equal(r.data.record._arch,false);}
 const victim='rahul.varma@brightcone.ai';
 for(let i=1;i<=5;i++){const r=await api('/auth/signin','POST',{email:victim,password:'incorrect',remember:false},'');assert.equal(r.status,400);assert.match(r.data.error,i===5?/now locked/:new RegExp((5-i)+' attempt'));}
 assert.match((await api('/auth/signin','POST',{email:victim,password:'Welcome@123'},'')).data.error,/account is locked/);
 await change(next=>{const a=next.demo.accounts.find(a=>a.email===victim);a.status='Active';a.fails=0});assert(await login(victim,'Welcome@123'));
 await change(next=>{next.demo.accounts.find(a=>a.email===victim).status='Disabled'});assert.match((await api('/auth/signin','POST',{email:victim,password:'Welcome@123'},'')).data.error,/account is disabled/);
 await change(next=>{next.demo.accounts.find(a=>a.email===victim).status='Active';next.demo.employees.find(e=>e.email===victim).status='Inactive'});assert.match((await api('/auth/signin','POST',{email:victim,password:'Welcome@123'},'')).data.error,/account is disabled/);
 await change(next=>{next.demo.employees.find(e=>e.email===victim).status='Active'});
 const inventory=JSON.parse(fs.readFileSync(new URL('../specification/inventory.json',import.meta.url),'utf8'));
 for(const role of inventory.ROLES){const r=await api('/access/viewas','POST',{role:role==='HR Admin'?'':role});assert.equal(r.status,200,role);for(const[area,matrix]of Object.entries(inventory.ACC)){const x=await api('/advanced/'+area);assert.equal(x.status,matrix[role]==='none'?403:200,`${role} ${area}`);if(x.status===200)assert.equal(x.data.scope,matrix[role]);}}
 await api('/access/viewas','POST',{role:''});
 await change(next=>{next.live.settings.acc[victim]={role:'Employee',emp:ids.emp}});
 assert.equal((await api('/reg/surveys/'+ids.surveys,'PATCH',{status:'Open'})).status,200);
 const respondent=await login(victim,'Welcome@123');const answer=await api('/surveys/'+ids.surveys+'/respond','POST',{nps:10,sc:[5]},respondent);assert.equal(answer.status,200,JSON.stringify(answer.data));
 assert.deepEqual(answer.data.state.live.settings.answered[ids.surveys],[victim]);assert.deepEqual(answer.data.state.live.data.resp,[]);
 const masked=await api('/surveys/'+ids.surveys+'/respond');assert.equal(masked.data.all.n,1);assert.equal(masked.data.all.enps,null);assert.equal(masked.data.all.avg[0][1],null);assert(!JSON.stringify(masked.data).includes(victim));
 assert.equal((await api('/surveys/'+ids.surveys+'/respond','POST',{nps:10,sc:[5]},respondent)).status,400);
 const backup=await api('/backup');assert.equal(backup.status,200);const imported=await api('/backup/import','POST',backup.data);assert.equal(imported.status,200);assert.equal(imported.data.added,0);assert(imported.data.skipped>0);
 const employee=await login(victim,'Welcome@123');assert.equal((await api('/backup','GET',undefined,employee)).status,403);assert.equal((await api('/access/viewas','POST',{role:'HR Admin'},employee)).status,403);
 const forgot=await api('/auth/forgot','POST',{email:'unknown@brightcone.ai'},'');assert.match(forgot.data.message,/a reset link is on its way/);
 console.log('Verified all 14 demo accounts, 52 register CRUD/archive/restore flows, 66 role/area scopes, lockout/disabled/exited auth, and append-only backup.');
});
