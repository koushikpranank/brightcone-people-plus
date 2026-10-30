import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const url=process.env.TEST_API_URL||'http://127.0.0.1:5156/api';
const rows=[];let token='';
async function api(path,method='GET',body,expect=200,auth=token){const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...(auth?{Authorization:'Bearer '+auth}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();rows.push({method,path,status:r.status,expected:expect,pass:r.status===expect});assert.equal(r.status,expect,path+': '+JSON.stringify(data));return data}
try{
 const signed=await api('/auth/signin','POST',{email:'ananya.rao@brightcone.ai',password:'Admin@123',remember:true});token=signed.token;await api('/auth/refresh','POST',{refreshToken:signed.refreshToken});await api('/auth/refresh','POST',{refreshToken:'invalid'},401);
 const tables=JSON.parse(await fs.readFile(new URL('../backend/src/models/tables.json',import.meta.url),'utf8'));
 for(const key of Object.keys(tables.demo)){await api('/suite/'+key);await api('/suite/'+key,'GET',undefined,401,'');}
 for(const app of ['plus','people','recruit','payroll','expense','sign','connect','learn','shift'])await api('/dashboards/'+app);
 await api('/reg/meta');await api('/access/me');await api('/notifications');await api('/reg/not-a-table','GET',undefined,404);await api('/dashboards/not-an-app','GET',undefined,404);
 const settings=await api('/money/settings');const p=structuredClone(settings.policy);const e=settings.employees.find(e=>e.email==='rahul.varma@brightcone.ai');
 const base=await api('/auth/me');const draft={demo:structuredClone(base.demo),live:structuredClone(base.live)};draft.demo.payroll.inputs.push({emp:e.name,k:'Bonus',amt:1234,month:'2026-10'},{emp:e.name,k:'Deduction',amt:99,month:'2026-10'});await api('/state','PATCH',{base:{demo:base.demo,live:base.live},next:draft});
 p.components.find(c=>c.id==='basic').value=45;p.components.find(c=>c.id==='pt').value=375;p.components.push({id:'audit-deduction',name:'Custom deduction audit',kind:'deduction',basis:'fixed',value:250});
 const saved=await api('/money/settings','PATCH',p);await api('/money/settings','PATCH',p,409);
 const custom=saved.policy;const result=await api('/money/preview','POST',{employee:e.id,policy:custom});
 const round=v=>Number(v.toFixed(2)),m=e.ctc/12,basic=round(m*.45),pf=round(basic*.12),gross=round(m-pf),tds=round(Math.max(0,e.ctc-custom.annualTaxAllowance)*.2/12),expected=round(gross-pf-375-tds-250);
 assert.equal(result.net,expected);const altered=await api('/money/preview','POST',{employee:e.id,ctc:e.ctc+120000});assert.notEqual(altered.net,result.net);
 const invalid=structuredClone(custom);invalid.components[0].value=-1;await api('/money/settings','PATCH',invalid,400);
 const extra=draft.demo.payroll.inputs.filter(i=>i.emp===e.name&&(!i.month||i.month==='2026-10'||i.month===draft.demo.payroll.month)).reduce((n,i)=>n+(['Deduction','Loan recovery'].includes(i.k)?-i.amt:i.amt),0)+draft.demo.expenses.filter(i=>i.emp===e.name&&i.status==='Approved').reduce((n,i)=>n+i.amt,0);
 const body={requestId:'endpoint-audit-'+Date.now(),month:'2026-10',employees:[e.id]};const run=await api('/money/run','POST',body);assert.equal(run.record.rows[0].net,round(expected+extra));const replay=await api('/money/run','POST',body);assert.equal(replay.record.id,run.record.id);
 const settlement=await api('/money/settlement','POST',{employee:e.id,date:'2026-10-30',workedDays:10,leaveDays:2,reimbursements:327.12,noticeRecovery:100,otherEarnings:50,otherDeductions:25,save:true,requestId:'settlement-audit-'+Date.now()});assert(settlement.record.id);
 custom.components.find(c=>c.id==='pt').value=412;await api('/money/settings','PATCH',custom);const history=await api('/money/records');assert.equal(history.find(r=>r.id===run.record.id).rows[0].net,run.record.rows[0].net);
 const employee=(await api('/auth/signin','POST',{email:e.email,password:'Welcome@123'})).token;await api('/money/settings','GET',undefined,403,employee);await api('/money/run','POST',body,403,employee);await api('/money/records','GET',undefined,403,employee);
 await api('/attendance/clock','POST',{action:'invalid'},400,employee);
 await api('/auth/signout','POST',{});await api('/auth/me','GET',undefined,401);
 console.log('Endpoint matrix and dynamic money/persistence tests passed:',rows.length,'requests.');
}finally{await fs.mkdir(new URL('../output/audit/',import.meta.url),{recursive:true});await fs.writeFile(new URL('../output/audit/endpoint-results.json',import.meta.url),JSON.stringify({at:new Date().toISOString(),url,requests:rows},null,2));}
