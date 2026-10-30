import type {View} from '../../types';
export const view:View="m_probation";
export const route="/people/m_probation";
export const render=(views:Record<View,()=>string>):string=>views[view]();
