import type {View} from '../../types';
export const view:View="m_wfh";
export const route="/shift/m_wfh";
export const render=(views:Record<View,()=>string>):string=>views[view]();
