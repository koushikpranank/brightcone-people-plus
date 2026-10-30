import type {View} from '../../types';
export const view:View="m_perf";
export const route="/plus/m_perf";
export const render=(views:Record<View,()=>string>):string=>views[view]();
