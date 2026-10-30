import type {View} from '../../types';
export const view:View="myPay";
export const route="/payroll/myPay";
export const render=(views:Record<View,()=>string>):string=>views[view]();
