import type {View} from '../../types';
export const view:View="m_reviews";
export const route="/people/m_reviews";
export const render=(views:Record<View,()=>string>):string=>views[view]();
