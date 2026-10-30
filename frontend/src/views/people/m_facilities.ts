import type {View} from '../../types';
export const view:View="m_facilities";
export const route="/people/m_facilities";
export const render=(views:Record<View,()=>string>):string=>views[view]();
