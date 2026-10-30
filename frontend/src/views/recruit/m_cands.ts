import type {View} from '../../types';
export const view:View="m_cands";
export const route="/recruit/m_cands";
export const render=(views:Record<View,()=>string>):string=>views[view]();
