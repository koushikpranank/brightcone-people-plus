import type {View} from '../../types';
export const view:View="m_officeexp";
export const route="/expense/m_officeexp";
export const render=(views:Record<View,()=>string>):string=>views[view]();
