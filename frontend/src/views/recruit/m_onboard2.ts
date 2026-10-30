import type {View} from '../../types';
export const view:View="m_onboard2";
export const route="/recruit/m_onboard2";
export const render=(views:Record<View,()=>string>):string=>views[view]();
