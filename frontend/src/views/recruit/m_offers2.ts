import type {View} from '../../types';
export const view:View="m_offers2";
export const route="/recruit/m_offers2";
export const render=(views:Record<View,()=>string>):string=>views[view]();
