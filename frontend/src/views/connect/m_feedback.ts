import type {View} from '../../types';
export const view:View="m_feedback";
export const route="/connect/m_feedback";
export const render=(views:Record<View,()=>string>):string=>views[view]();
