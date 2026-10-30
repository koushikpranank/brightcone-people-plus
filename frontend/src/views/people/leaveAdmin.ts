import type {View} from '../../types';
export const view:View="leaveAdmin";
export const route="/people/leaveAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
