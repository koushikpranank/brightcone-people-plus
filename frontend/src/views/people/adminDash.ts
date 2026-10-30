import type {View} from '../../types';
export const view:View="adminDash";
export const route="/people/adminDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
