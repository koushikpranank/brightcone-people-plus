import {chromium} from '../frontend/node_modules/playwright/index.mjs';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.AUDIT_URL||'http://127.0.0.1:5176';
const meta=JSON.parse(await fs.readFile(new URL('../backend/src/models/registry.json',import.meta.url),'utf8'));
const dir=new URL('../output/audit/',import.meta.url);await fs.mkdir(dir,{recursive:true});
let report={started:new Date().toISOString(),base,registers:[],dialogs:[],errors:[]};
if(process.env.AUDIT_RESUME==='1'){const old=JSON.parse(await fs.readFile(new URL('form-results.json',dir),'utf8'));report={...old,errors:[]};delete report.failure;}
const browser=await chromium.launch({channel:'chrome',headless:true});
const page=await browser.newPage({viewport:{width:1440,height:1000},timezoneId:'Asia/Kolkata'});
page.on('pageerror',e=>report.errors.push(e.message));
page.setDefaultTimeout(15000);
const suffix=Date.now().toString(36);
async function flush(){return page.evaluate(async()=>{await window.flushChanges();});}
async function login(){await page.goto(base+'/login');await page.getByRole('button',{name:/^HR Admin /}).click();await page.getByRole('button',{name:'Sign in',exact:true}).click();await page.waitForURL('**/plus/suiteDash');await page.locator('#content h1').waitFor();}
async function api(path){return page.evaluate(async path=>{const session=JSON.parse(sessionStorage.getItem('bc-hr-session')||localStorage.getItem('bc-hr-session'));const r=await fetch('/api'+path,{headers:{Authorization:'Bearer '+session.token}});if(!r.ok)throw Error(await r.text());return r.json();},path);}
try{
 await login();await page.goto(base+'/people/employees');await page.locator('#content h1').waitFor();await flush();
 await page.goto(base+'/plus/suiteDash');await page.locator('#content h1').waitFor();
 let employee=report.registers.find(r=>r.key==='emp')?.id||'';const ids=Object.fromEntries(report.registers.map(r=>[r.key,r.id]));
 for(const[k,d]of Object.entries(meta)){
  if(ids[k])continue;
  await page.evaluate(k=>{window.closeAll();window.regForm(k)},k);await page.locator('#rsave').waitFor();
  for(const f of d.f){if(f.noForm||f.ro)continue;const el=page.locator('#rf_'+f.k);if(!await el.count())continue;const tag=await el.evaluate(e=>e.tagName.toLowerCase());
   if(tag==='select'){
    if(k==='succession'&&['s1','s2','s3'].includes(f.k)){await el.selectOption('');continue;}
    const options=await el.locator('option').evaluateAll(os=>os.map(o=>({v:o.value,t:o.textContent})));
    let desired=f.t==='emp'?employee:f.t==='ref'?ids[f.ref]:undefined;
    if(k==='profile'&&f.k==='emp')desired=employee;
    if(f.k==='status'&&k==='goals')desired='Draft';if(f.k==='consent')desired='Yes';
    if(desired&&options.some(o=>o.v===desired))await el.selectOption(desired);else if((!await el.inputValue()||f.req)&&options.some(o=>o.v))await el.selectOption(options.find(o=>o.v).v);
   }else{
    const type=await el.getAttribute('type');let val='';
    if(type==='file')continue;
    if(['money','number'].includes(f.t)||type==='number')val='1';
    else if(f.t==='date'||type==='date')val='2026-10-30';else if(f.t==='month'||type==='month')val='2026-10';else if(f.t==='time'||type==='time')val='09:00';
    else if(f.t==='email')val=`form.${k}.${suffix}@brightcone.ai`;else if(f.t==='tel')val='+919000000101';
    else if(f.req||(d.unique||[]).includes(f.k))val=`Form ${k} ${suffix}`;
    if(k==='holidays2'&&f.k==='date')val=new Date(Date.UTC(2070,0,1)+(Date.now()%15000)*86400000).toISOString().slice(0,10);
    if(k==='profile'&&['aadhaar','pan','ifsc'].includes(f.k))val='';
    if(k==='vendors'&&f.k==='gstin')val='';
    if(k==='pfesi'&&f.k==='challan')val='AUDIT-'+suffix;
    if(k==='payroll2'&&f.k==='gross')val='100';if(k==='payroll2'&&f.k==='wdays')val='22';
    if(k==='surveys'&&f.k==='stmts')val='My manager supports my growth';
    await el.fill(val);
   }
  }
  const response=page.waitForResponse(r=>r.url().includes('/api/reg/'+k)&&r.request().method()==='POST');await page.locator('#rsave').click();const saved=await response;const result=await saved.json();assert.equal(saved.status(),200,k+': '+JSON.stringify(result));
  const id=result.record.id;ids[k]=id;if(k==='emp')employee=id;
  await page.waitForFunction(()=>!document.getElementById('modal').classList.contains('on'));
  const rows=await api('/reg/'+k);assert(rows.some(r=>r.id===id),k+' API reread');
  await page.evaluate(({k,id})=>window.regForm(k,id),{k,id});await page.locator('#rsave').waitFor();
  const edit=page.waitForResponse(r=>r.url().includes('/api/reg/'+k+'/')&&r.request().method()==='PATCH');await page.locator('#rsave').click();assert.equal((await edit).status(),200,k+' UI edit');
  await page.waitForFunction(()=>!document.getElementById('modal').classList.contains('on'));
  await page.evaluate(({k,id})=>window.regDel(k,id),{k,id});const archived=page.waitForResponse(r=>r.url().includes('/api/reg/'+k+'/')&&r.request().method()==='DELETE');await page.locator('#cok').click();assert.equal((await archived).status(),200,k+' UI archive');
  await page.evaluate(async({k,id})=>{await window.regRestore(k,id)},{k,id});
  assert.equal((await api('/reg/'+k)).find(r=>r.id===id)._arch,false);
  report.registers.push({key:k,id,create:true,edit:true,archive:true,restore:true,reread:true,fields:d.f.filter(f=>!f.noForm&&!f.ro).length});console.log('FORM',k,id);
 }
 // Every source helper using the shared form() renderer is also submitted.
 const S=await api('/auth/me');
 const first=S.demo.employees.find(e=>e.status==='Active')||S.demo.employees[0];
 const args={refer:[S.demo.jobs[0]?.id],reviseSalary:[first.id],issueLetter:[first.name],addTask:[0],assignShift:[S.demo.shifts[0].n],adjustBal:[first.name],scorecard:[S.demo.interviews[0].id],sendOffer:[S.demo.cands[0].id],rate:[first.name],assignAsset:[S.demo.assets[0].tag],editWf:[0],newSign:[S.demo.signTpls[0]?.n]};
 const names=['applyLeave','raiseTicket','editMe','addDep','requestReg','editDecl','claimExpense','addGoal','selfReview','giveFeedback','refer','uploadDoc','requestLetter','requestAsset','submitRes','reviseSalary','issueLetter','editDept','addGrade','addTask','initExit','editShift','assignShift','editLT','addHol','adjustBal','leaveOnBehalf','payInput','addPlan','editJob','schedInt','scorecard','sendOffer','rate','newCycle','editCourse','addAsset','assignAsset','newPolicy','postAnn','editCompany','editWf','newSign','reqSwap','editPrefix','editElig'];
 for(const name of names){
  if(report.dialogs.some(r=>r.name===name))continue;
  await page.evaluate(({name,args})=>{window.closeAll();window[name](...args)}, {name,args:args[name]||[]});await page.locator('#fsubmit').waitFor();
  const fields=await page.locator('#modal [id^=f_]').evaluateAll(es=>es.map(e=>({id:e.id,type:e.type||'',tag:e.tagName.toLowerCase(),value:e.value})));
  for(const f of fields){const el=page.locator(`[id="${f.id}"]`);if(f.tag==='select'){const values=await el.locator('option').evaluateAll(es=>es.map(o=>o.value));if(!f.value&&values.find(Boolean))await el.selectOption(values.find(Boolean));continue;}if(f.type==='file')continue;
   let v=f.value;if(f.type==='date')v='2026-10-30';else if(f.type==='datetime-local')v='2026-10-30T10:00';else if(f.type==='time')v=f.id.includes('out')?'18:00':'09:00';else if(f.type==='number'){if(!v)v='1';if(name==='sendOffer'&&f.id==='f_ctc')v='1200000';}else if(!v)v=f.type==='email'?`dialog.${suffix}@brightcone.ai`:f.type==='tel'?'+919000000101':`Audit ${name} ${suffix}`;
   if(name==='editDecl'&&f.type==='number')v=String((Number(f.value)||0)+1);
   if(name==='editPrefix'&&f.id==='f_p')v='AU-';
   await el.fill(v);
  }
  const before=await api('/auth/me');await page.locator('#fsubmit').click();
  if(await page.locator('#modal.on #ferr').count()){const error=await page.locator('#ferr').textContent();if(error)throw Error(name+': '+error)}
  await flush();const after=await api('/auth/me');const changed=JSON.stringify(before.demo)!==JSON.stringify(after.demo)||JSON.stringify(before.live)!==JSON.stringify(after.live);assert(changed,name+' did not persist a data change');
  report.dialogs.push({name,submitted:true,persisted:true});console.log('DIALOG',name);
 }
 assert.equal(report.errors.length,0,report.errors.join('\n'));report.finished=new Date().toISOString();
}catch(e){report.failure=e.stack;throw e}finally{await fs.writeFile(new URL('form-results.json',dir),JSON.stringify(report,null,2));await browser.close();}
