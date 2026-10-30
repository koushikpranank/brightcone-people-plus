import type {View} from '../../types';
export const view:View="helpAdmin";
export const route="/people/helpAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
