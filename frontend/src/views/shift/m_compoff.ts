import type {View} from '../../types';
export const view:View="m_compoff";
export const route="/shift/m_compoff";
export const render=(views:Record<View,()=>string>):string=>views[view]();
