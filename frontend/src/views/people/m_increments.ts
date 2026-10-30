import type {View} from '../../types';
export const view:View="m_increments";
export const route="/people/m_increments";
export const render=(views:Record<View,()=>string>):string=>views[view]();
