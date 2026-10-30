import type {View} from '../../types';
export const view:View="m_assets2";
export const route="/people/m_assets2";
export const render=(views:Record<View,()=>string>):string=>views[view]();
