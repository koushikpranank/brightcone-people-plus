import type {View} from '../../types';
export const view:View="myExpenses";
export const route="/expense/myExpenses";
export const render=(views:Record<View,()=>string>):string=>views[view]();
