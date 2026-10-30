import type {View} from '../../types';
export const view:View="m_backup";
export const route="/plus/m_backup";
export const render=(views:Record<View,()=>string>):string=>views[view]();
