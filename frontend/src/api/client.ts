import type { Bootstrap, JsonValue } from '../types';
interface Session { token:string; refreshToken?:string|null }
const KEY='bc-hr-session';
let refreshing:Promise<void>|null=null;
export class ApiError extends Error {constructor(message:string,public readonly status:number){super(message)}}
export function session():Session|null {try {const raw=sessionStorage.getItem(KEY)||localStorage.getItem(KEY);if(!raw)return null;const v:unknown=JSON.parse(raw);return typeof v==='object'&&v!==null&&'token'in v&&typeof v.token==='string'?v as Session:null;}catch{return null}}
export function clearSession():void {localStorage.removeItem(KEY);sessionStorage.removeItem(KEY)}
export function storeSession(value:Session,remember:boolean):void {clearSession();(remember?localStorage:sessionStorage).setItem(KEY,JSON.stringify(value))}
export async function request<T>(path:string,method='GET',body?:unknown,retry=true):Promise<T>{
 const ses=session();const response=await fetch(`/api${path}`,{method,headers:{'Content-Type':'application/json',...(ses?{Authorization:`Bearer ${ses.token}`}:{})},...(body===undefined?{}:{body:JSON.stringify(body)})});
 if(response.status===401&&retry&&ses?.refreshToken){
  refreshing??=request<{token:string}>('/auth/refresh','POST',{refreshToken:ses.refreshToken},false).then(v=>{const remember=localStorage.getItem(KEY)!==null;storeSession({...ses,token:v.token},remember)}).finally(()=>{refreshing=null});
  await refreshing;return request<T>(path,method,body,false);
 }
 const data:unknown=await response.json();if(!response.ok){const error=typeof data==='object'&&data!==null&&'error'in data&&typeof data.error==='string'?data.error:response.statusText;throw new ApiError(error,response.status)}return data as T;
}
export async function signin(email:string,password:string,remember:boolean):Promise<Bootstrap>{const value=await request<Session>('/auth/signin','POST',{email,password,remember});storeSession(value,remember);return request<Bootstrap>('/auth/me')}
export const signout=async():Promise<void>=>{try{await request<JsonValue>('/auth/signout','POST')}finally{clearSession()}};
