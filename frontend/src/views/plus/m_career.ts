import type {View} from '../../types';
export const view:View="m_career";
export const route="/plus/m_career";
export const render=(views:Record<View,()=>string>):string=>views[view]();
