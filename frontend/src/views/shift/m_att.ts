import type {View} from '../../types';
export const view:View="m_att";
export const route="/shift/m_att";
export const render=(views:Record<View,()=>string>):string=>views[view]();
