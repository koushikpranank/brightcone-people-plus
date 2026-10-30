import type {View} from '../../types';
export const view:View="myLeave";
export const route="/people/myLeave";
export const render=(views:Record<View,()=>string>):string=>views[view]();
