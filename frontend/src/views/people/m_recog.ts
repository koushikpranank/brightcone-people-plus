import type {View} from '../../types';
export const view:View="m_recog";
export const route="/people/m_recog";
export const render=(views:Record<View,()=>string>):string=>views[view]();
