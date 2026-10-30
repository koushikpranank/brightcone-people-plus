import type {View} from '../../types';
export const view:View="m_balance";
export const route="/shift/m_balance";
export const render=(views:Record<View,()=>string>):string=>views[view]();
