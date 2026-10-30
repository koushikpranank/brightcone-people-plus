import type {View} from '../../types';
export const view:View="m_wfa";
export const route="/plus/m_wfa";
export const render=(views:Record<View,()=>string>):string=>views[view]();
