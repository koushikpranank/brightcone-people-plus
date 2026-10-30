import type {View} from '../../types';
export const view:View="m_logs";
export const route="/shift/m_logs";
export const render=(views:Record<View,()=>string>):string=>views[view]();
