import type {View} from '../../types';
export const view:View="m_cards";
export const route="/people/m_cards";
export const render=(views:Record<View,()=>string>):string=>views[view]();
