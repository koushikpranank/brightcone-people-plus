import type {View} from '../../types';
export const view:View="m_joining";
export const route="/recruit/m_joining";
export const render=(views:Record<View,()=>string>):string=>views[view]();
