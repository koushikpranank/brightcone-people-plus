import type { Bootstrap, JsonObject, Snapshot, User } from '../types';
import { request } from '../api/client';
export interface RuntimeBridge {
 scheduleSave(snapshot:Snapshot):boolean;
 flush():Promise<void>;
 authenticate(email:string,password:string,remember:boolean):Promise<Bootstrap>;
 logout():Promise<void>;
 register(key:string,values:JsonObject,id?:string):Promise<{record:JsonObject;state:Bootstrap;warning?:string}>;
 viewas(role:string|null):Promise<Bootstrap>;
 bootstrap():Bootstrap|null;
 adopt(value:Bootstrap):void;
}
export interface LegacyRuntime { hydrate(value:Bootstrap):void; snapshot():Snapshot; showLogin():void; navigate(app:string,view:string):void; home():string; toast(text:string):void; user():User|null; }
export class StateBridge {
 private base:Snapshot|null=null;
 private desired:Snapshot|null=null;
 private pending:Promise<void>|null=null;
 private timer:ReturnType<typeof setTimeout>|null=null;
 private current:Bootstrap|null;
 runtime:LegacyRuntime|null=null;
 constructor(initial:Bootstrap|null){this.current=initial;this.base=initial?structuredClone({demo:initial.demo,live:initial.live}):null}
 accept(value:Bootstrap):void{this.current=value;this.base=structuredClone({demo:value.demo,live:value.live});this.desired=null;this.runtime?.hydrate(value)}
 scheduleSave=(snapshot:Snapshot):boolean=>{if(!this.base)return true;this.desired=structuredClone(snapshot);if(this.timer)clearTimeout(this.timer);this.timer=setTimeout(()=>{this.timer=null;void this.flush().catch(e=>this.runtime?.toast(String(e.message)))},0);return true;};
 async flush():Promise<void>{
  if(this.timer){clearTimeout(this.timer);this.timer=null;}
  if(this.pending){await this.pending;await this.flush();return}
  if(!this.base||!this.desired)return;
  const next=this.desired;this.desired=null;const base=this.base;
  if(JSON.stringify(base)===JSON.stringify(next))return;
  this.pending=request<Bootstrap>('/state','PATCH',{base,next}).then(v=>{
   const newer=this.desired;this.current=v;this.base=structuredClone({demo:v.demo,live:v.live});
   if(!newer)this.runtime?.hydrate(v);
  }).catch(async error=>{this.desired=null;try{const v=await request<Bootstrap>('/auth/me');this.accept(v)}catch{}throw error}).finally(()=>{this.pending=null});
  await this.pending;await this.flush();
 }
 get currentState():Bootstrap|null{return this.current}
}
