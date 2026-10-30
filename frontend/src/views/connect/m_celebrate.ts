import type {View} from '../../types';
export const view:View="m_celebrate";
export const route="/connect/m_celebrate";
export const render=(views:Record<View,()=>string>):string=>views[view]();
