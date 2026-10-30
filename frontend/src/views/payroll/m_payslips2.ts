import type {View} from '../../types';
export const view:View="m_payslips2";
export const route="/payroll/m_payslips2";
export const render=(views:Record<View,()=>string>):string=>views[view]();
