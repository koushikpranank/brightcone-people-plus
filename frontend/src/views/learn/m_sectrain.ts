import type {View} from '../../types';
export const view:View="m_sectrain";
export const route="/learn/m_sectrain";
export const render=(views:Record<View,()=>string>):string=>views[view]();
