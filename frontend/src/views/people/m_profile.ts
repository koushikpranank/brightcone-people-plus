import type {View} from '../../types';
export const view:View="m_profile";
export const route="/people/m_profile";
export const render=(views:Record<View,()=>string>):string=>views[view]();
