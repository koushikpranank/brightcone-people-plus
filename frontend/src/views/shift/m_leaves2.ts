import type {View} from '../../types';
export const view:View="m_leaves2";
export const route="/shift/m_leaves2";
export const render=(views:Record<View,()=>string>):string=>views[view]();
