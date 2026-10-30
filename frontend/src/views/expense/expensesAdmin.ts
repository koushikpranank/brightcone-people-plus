import type {View} from '../../types';
export const view:View="expensesAdmin";
export const route="/expense/expensesAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
