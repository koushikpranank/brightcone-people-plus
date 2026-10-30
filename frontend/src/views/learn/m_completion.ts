import type {View} from '../../types';
export const view:View="m_completion";
export const route="/learn/m_completion";
export const render=(views:Record<View,()=>string>):string=>views[view]();
