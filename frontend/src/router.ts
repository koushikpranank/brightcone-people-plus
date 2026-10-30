import routes from './routes.json';
import type { LegacyRuntime } from './state/bridge';
import type { App, View } from './types';
const known=routes as Record<string,{app:App;view:View}>;
// Boot renders the source's default view before the history route is applied.
let navigating=true;
export function routeChanged(app:string,view:string):void{if(navigating)return;const path=`/${app}/${view}`;if(location.pathname!==path)history.pushState(null,'',path)}
export function loginRoute():void{if(location.pathname!=='/login')history.replaceState(null,'','/login')}
export function installRouter(runtime:LegacyRuntime):void{
 const navigate=()=>{if(!runtime.user()){loginRoute();runtime.showLogin();return}const route=known[decodeURIComponent(location.pathname.slice(1))];navigating=true;try{if(route)runtime.navigate(route.app,route.view);else runtime.navigate('plus',runtime.home());}finally{navigating=false}const target=runtime.home();if(!route||location.pathname==='/login'||location.pathname==='/')history.replaceState(null,'',`/plus/${target}`);};
 window.addEventListener('popstate',navigate);navigate();
}
