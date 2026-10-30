import fs from 'node:fs/promises';import assert from 'node:assert/strict';
const url=process.env.TEST_API_URL||'http://127.0.0.1:5156/api',rows=[],suffix=Date.now().toString(36);let token='';
async function api(path,method='GET',body,expected=200){const r=await fetch(url+path,{method,headers:{'Content-Type':'application/json',...(token?{Authorization:'Bearer '+token}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});const data=await r.json();rows.push({path,method,status:r.status,expected,pass:r.status===expected});assert.equal(r.status,expected,path+': '+JSON.stringify(data));return data;}
try{
 token=(await api('/auth/signin','POST',{email:'ananya.rao@brightcone.ai',password:'Admin@123'})).token;
 const tables=JSON.parse(await fs.readFile('backend/src/models/tables.json','utf8')).demo;
 for(const[k,meta]of Object.entries(tables)){
  const route='/suite/'+k,before=await api(route);
  if(['role','clockedIn','clockStart'].includes(k)){for(const method of ['POST','PATCH','DELETE'])await api(route,method,before,400);continue}
  if(k==='audit'){await api(route,'POST',{a:'GA append-only audit '+suffix,who:'Ananya Rao',t:'2026-10-30'});await api(route,'PATCH',{},400);await api(route,'DELETE',{},400);continue}
  if(meta.kind==='array'){
   const sample=before[0];let record=structuredClone(sample??{});
   if(Array.isArray(record))record[0]='GA-'+k+'-'+suffix;
   else if(typeof record==='string')record='GA-'+k+'-'+suffix;
   else{record[meta.natural]='GA-'+k+'-'+suffix;record.auditMarker=suffix;
    if(k==='employees'){record.name='Synthetic Demo CRUD '+suffix;record.email='demo.crud.'+suffix+'@brightcone.ai'}
    if(k==='accounts'){record.email='demo.account.'+suffix+'@brightcone.ai';record.name='Naresh Vemparala';record.role='Employee';record.status='Active';delete record.pass;}
   }
   await api(route,'POST',record);let current=await api(route);let i=typeof record==='object'&&!Array.isArray(record)?current.findIndex(r=>r[meta.natural]===record[meta.natural]):current.findIndex(r=>JSON.stringify(r)===JSON.stringify(record));assert(i>=0,k+' create persisted');
   if(k==='accounts'){await api('/auth/signin','POST',{email:record.email,password:'Welcome@123'});const s=await api('/auth/me');const base={demo:s.demo,live:s.live},next=structuredClone(base);next.demo.accounts=next.demo.accounts.filter(a=>a.email!==record.email);await api('/state','PATCH',{base,next},409);}
   if(typeof record==='object'&&!Array.isArray(record)){record.auditMarker=suffix+'-edited';await api(route,'PATCH',record);current=await api(route);assert.equal(current.find(r=>r[meta.natural]===record[meta.natural]).auditMarker,suffix+'-edited');await api(route,'DELETE',{[meta.natural]:record[meta.natural]});}
   else{const edited=Array.isArray(record)?[record[0]+'-edited',...record.slice(1)]:record+'-edited';await api(route,'PATCH',{_row:i,value:edited});current=await api(route);i=current.findIndex(r=>JSON.stringify(r)===JSON.stringify(edited));assert(i>=0,k+' edit persisted');await api(route,'DELETE',{_row:i});}
   console.log('DEMO CRUD',k);
  }else if(meta.kind==='object'){
   const key=Object.keys(before||{})[0];if(key){const original=before[key];let probe=structuredClone(original);if(typeof original==='number')probe=original+1;else if(typeof original==='boolean')probe=!original;else if(typeof original==='string')probe=original+' audit';else if(Array.isArray(original))probe=[...original,0];else if(original&&typeof original==='object')probe={...original,auditProbe:1};await api(route,'POST',{[key]:probe});const read=await api(route);assert.deepEqual(read[key],probe);await api(route,'PATCH',{[key]:original});}else{await api(route,'POST',{});await api(route,'PATCH',{});}await api(route,'DELETE',{},400);
  }else{const probe=typeof before==='boolean'?!before:typeof before==='number'?before+1:before;await api(route,'POST',probe);assert.deepEqual(await api(route),probe);await api(route,'PATCH',before);await api(route,'DELETE',{},400);}
 }
 console.log('All demo-key CRUD routes and intentional read-only/append-only responses passed:',rows.length);
}finally{await fs.writeFile('output/audit/demo-crud-results.json',JSON.stringify({at:new Date().toISOString(),url,requests:rows},null,2));}
