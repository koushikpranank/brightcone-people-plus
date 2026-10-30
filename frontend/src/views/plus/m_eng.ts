import type {View} from '../../types';
export const view:View="m_eng";
export const route="/plus/m_eng";
export const render=(views:Record<View,()=>string>):string=>views[view]();
