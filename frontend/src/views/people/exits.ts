import type {View} from '../../types';
export const view:View="exits";
export const route="/people/exits";
export const render=(views:Record<View,()=>string>):string=>views[view]();
