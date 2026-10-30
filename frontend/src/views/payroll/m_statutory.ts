import type {View} from '../../types';
export const view:View="m_statutory";
export const route="/payroll/m_statutory";
export const render=(views:Record<View,()=>string>):string=>views[view]();
