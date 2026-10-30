import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve(import.meta.dirname,'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>{const f=path.join(root,p);fs.mkdirSync(path.dirname(f),{recursive:true});fs.writeFileSync(f,v)};
const seed=read('backend/src/seeders/demo.json'), reg=read('backend/src/models/registry.json'), inv=read('specification/inventory.json');
const q=s=>'"'+s.replaceAll('"','""')+'"';
// Schema DDL is owned by the SeaORM crate in backend/migration/.
// This generator updates only source-derived transport metadata and TypeScript.
const manifest={demo:{},live:{}};
for(const [group,entries] of [["demo",Object.entries(seed)],["live",Object.entries(reg)]]){
 for(const [key,value] of entries){
  const kind=group==="live"?"array":Array.isArray(value)?"array":(value&&typeof value==="object"?"object":"scalar");
  const natural=group==="demo"?({accounts:"email",depts:"n",shifts:"n",leaveTypes:"n",holidays:"d",assets:"tag"}[key]||"id"):"id";
  manifest[group][key]={table:group+"."+q(key),kind,natural};
 }
}
write('backend/src/models/tables.json',JSON.stringify(manifest,null,2));
const schemaType=v=>v===null?'null':typeof v==='string'?'string':typeof v==='number'?'number':typeof v==='boolean'?'boolean':Array.isArray(v)?v.length?`Array<${[...new Set(v.map(schemaType))].join(' | ')}>`:'JsonValue[]':`{ ${Object.entries(v).map(([k,x])=>`${JSON.stringify(k)}: ${schemaType(x)}`).join('; ')} }`;
let types=`// Generated from the supplied HTML; run npm run extract before regenerating.\nexport type JsonValue = string | number | boolean | null | JsonValue[] | { [key:string]:JsonValue };\nexport type JsonObject = { [key:string]:JsonValue };\nexport type Role = 'HR Admin'|'HR Executive'|'Manager'|'Finance'|'Leadership'|'Employee';\nexport type App = ${inv.APPS.map(a=>JSON.stringify(a[0])).join('|')};\nexport type View = ${inv.views.map(JSON.stringify).join('|')};\nexport interface HistoryEntry {t:string;by:string;s:string}\nexport interface RecordBase {id:string;_c?:string;_u?:string;_cb?:string;_ub?:string;_h?:HistoryEntry[];_arch?:boolean;rk?:string}\n`;
for(const[k,d]of Object.entries(reg))types+=`export interface ${k[0].toUpperCase()+k.slice(1)}Record extends RecordBase { ${d.f.filter(f=>f.k!=='id').map(f=>`${JSON.stringify(f.k)}?: ${['money','number'].includes(f.t)?'number | ""':'string'}`).join('; ')} }\n`;
types+=`export interface LiveRecordMap { ${Object.keys(reg).map(k=>`${k}:${k[0].toUpperCase()+k.slice(1)}Record`).join('; ')} }\n`;
types+=`export interface Account {email:string;name:string;role:Role;status:string;fails:number;last:string|null;pass?:string}\n`;
types+=`export interface DemoEmployee {id:string;name:string;role:string;dept:string;loc:string;status:string;joined:string;mgr:string;ctc:number;email?:string;phone?:string;shift?:string;grade?:string;address?:string;emergency?:string;blood?:string;dob?:string;pan?:string;uan?:string;bank?:string;gender?:string;type?:string;probEnd?:string;marital?:string;aadhaar?:string;acct?:string;ifsc?:string}\n`;
types+=`export interface User {email:string;name:string;role:Role}\nexport interface Snapshot {demo:JsonObject;live:JsonObject}\nexport interface Bootstrap extends Snapshot {user:User;access:Access;computed:JsonObject}\nexport type Area = ${Object.keys(inv.ACC).map(JSON.stringify).join('|')};\nexport type Scope = 'all'|'team'|'teamx'|'own'|'ownshared'|'assigned'|'view'|'summary'|'pay'|'statutory'|'scores'|'respond'|'none';\nexport type ScopedArea = { [A in Area]: {area:A;scope:Scope} }[Area];\nexport interface Access {realRole:Role;curRole:Role;myEmp:string;scopes:Record<Area,Scope>}\n`;
write('frontend/src/types/index.ts',types);
const routes={};
for(const role of Object.values(inv.NAV))for(const[app,groups]of Object.entries(role))for(const[,items]of groups)for(const[key]of items)routes[`${app}/${key}`]={app,view:key};
for(const[k,d]of Object.entries(reg))if(inv.views.includes('m_'+k))routes[`${d.app}/m_${k}`]={app:d.app,view:'m_'+k};
for(const v of inv.views)if(!Object.values(routes).some(r=>r.view===v))routes[`plus/${v}`]={app:'plus',view:v};
write('frontend/src/routes.json',JSON.stringify(routes,null,2));
for(const[route,{app,view}]of Object.entries(routes))write(`frontend/src/views/${app}/${view}.ts`,`import type {View} from '../../types';\nexport const view:View=${JSON.stringify(view)};\nexport const route=${JSON.stringify('/'+route)};\nexport const render=(views:Record<View,()=>string>):string=>views[view]();\n`);
console.log({demo:Object.keys(manifest.demo).length,live:Object.keys(reg).length,routes:Object.keys(routes).length});
