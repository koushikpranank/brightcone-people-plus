import type {View} from '../../types';
export const view:View="m_townhall";
export const route="/connect/m_townhall";
export const render=(views:Record<View,()=>string>):string=>views[view]();
