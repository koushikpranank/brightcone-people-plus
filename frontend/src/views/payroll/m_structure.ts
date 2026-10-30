import type {View} from '../../types';
export const view:View="m_structure";
export const route="/payroll/m_structure";
export const render=(views:Record<View,()=>string>):string=>views[view]();
