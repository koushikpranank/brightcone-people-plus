import type {View} from '../../types';
export const view:View="myExit";
export const route="/people/myExit";
export const render=(views:Record<View,()=>string>):string=>views[view]();
