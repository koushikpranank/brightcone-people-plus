import type {View} from '../../types';
export const view:View="myHelp";
export const route="/people/myHelp";
export const render=(views:Record<View,()=>string>):string=>views[view]();
