import type {View} from '../../types';
export const view:View="myBenefits";
export const route="/payroll/myBenefits";
export const render=(views:Record<View,()=>string>):string=>views[view]();
