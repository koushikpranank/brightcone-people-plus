import type {View} from '../../types';
export const view:View="payrollDash";
export const route="/payroll/payrollDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
