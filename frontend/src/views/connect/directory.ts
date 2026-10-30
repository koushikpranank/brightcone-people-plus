import type {View} from '../../types';
export const view:View="directory";
export const route="/connect/directory";
export const render=(views:Record<View,()=>string>):string=>views[view]();
