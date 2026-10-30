import type {View} from '../../types';
export const view:View="mySign";
export const route="/sign/mySign";
export const render=(views:Record<View,()=>string>):string=>views[view]();
