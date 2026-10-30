import type {View} from '../../types';
export const view:View="m_actions";
export const route="/plus/m_actions";
export const render=(views:Record<View,()=>string>):string=>views[view]();
