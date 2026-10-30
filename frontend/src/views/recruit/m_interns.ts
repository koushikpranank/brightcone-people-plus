import type {View} from '../../types';
export const view:View="m_interns";
export const route="/recruit/m_interns";
export const render=(views:Record<View,()=>string>):string=>views[view]();
