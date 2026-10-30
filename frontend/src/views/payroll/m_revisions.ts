import type {View} from '../../types';
export const view:View="m_revisions";
export const route="/payroll/m_revisions";
export const render=(views:Record<View,()=>string>):string=>views[view]();
