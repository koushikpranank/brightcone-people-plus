import type {View} from '../../types';
export const view:View="benefitsAdmin";
export const route="/payroll/benefitsAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
