import type {View} from '../../types';
export const view:View="m_joiners";
export const route="/plus/m_joiners";
export const render=(views:Record<View,()=>string>):string=>views[view]();
