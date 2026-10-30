import './design/tailwind.css';
import './design/tokens.css';
import { mountRuntime } from './runtime';
import {StateBridge,type RuntimeBridge} from './state/bridge';
import {request,session,signin,signout,clearSession} from './api/client';
import {installRouter} from './router';
import type {Bootstrap,JsonObject} from './types';
let initial:Bootstrap|null=null;
if(session()){try{initial=await request<Bootstrap>('/auth/me')}catch{clearSession()}}
const state=new StateBridge(initial);
const bridge:RuntimeBridge={
 scheduleSave:state.scheduleSave,
 flush:()=>state.flush(),
 authenticate:async(email,password,remember)=>{const value=await signin(email,password,remember);state.accept(value);return value},
 logout:async()=>{await signout()},
 register:async(key,values,id)=>{const result=await request<{record:JsonObject;state:Bootstrap;warning?:string}>(`/reg/${key}${id?'/'+encodeURIComponent(id):''}`,id?'PATCH':'POST',values);state.accept(result.state);return result},
 viewas:async(role)=>{const value=await request<Bootstrap>('/access/viewas','POST',{role});state.accept(value);return value},
 bootstrap:()=>state.currentState,
 adopt:value=>state.accept(value),
};
const runtime=mountRuntime(initial,bridge);state.runtime=runtime;
installRouter(runtime);
// Persist input actions that don't rerender (goal sliders and clock controls).
for(const event of ['click','change','submit'])document.addEventListener(event,()=>queueMicrotask(()=>{if(runtime.user())state.scheduleSave(runtime.snapshot())}));
window.addEventListener('pagehide',()=>{void state.flush()});
