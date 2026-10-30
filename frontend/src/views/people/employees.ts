import type {View} from '../../types';
export const view:View="employees";
export const route="/people/employees";
export const render=(views:Record<View,()=>string>):string=>views[view]();
