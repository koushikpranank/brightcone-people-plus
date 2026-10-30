import type {View} from '../../types';
export const view:View="expenseDash";
export const route="/expense/expenseDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
