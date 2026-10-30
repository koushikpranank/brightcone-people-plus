import type {View} from '../../types';
export const view:View="m_posh";
export const route="/learn/m_posh";
export const render=(views:Record<View,()=>string>):string=>views[view]();
