import type {View} from '../../types';
export const view:View="m_docs";
export const route="/people/m_docs";
export const render=(views:Record<View,()=>string>):string=>views[view]();
