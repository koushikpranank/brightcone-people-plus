import type {View} from '../../types';
export const view:View="m_policies";
export const route="/sign/m_policies";
export const render=(views:Record<View,()=>string>):string=>views[view]();
