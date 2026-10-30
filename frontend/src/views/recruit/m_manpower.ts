import type {View} from '../../types';
export const view:View="m_manpower";
export const route="/recruit/m_manpower";
export const render=(views:Record<View,()=>string>):string=>views[view]();
