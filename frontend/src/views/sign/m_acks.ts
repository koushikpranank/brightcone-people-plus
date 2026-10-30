import type {View} from '../../types';
export const view:View="m_acks";
export const route="/sign/m_acks";
export const render=(views:Record<View,()=>string>):string=>views[view]();
