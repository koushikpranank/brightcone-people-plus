import type {View} from '../../types';
export const view:View="m_handbook";
export const route="/sign/m_handbook";
export const render=(views:Record<View,()=>string>):string=>views[view]();
