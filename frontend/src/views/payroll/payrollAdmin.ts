import type {View} from '../../types';
export const view:View="payrollAdmin";
export const route="/payroll/payrollAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
