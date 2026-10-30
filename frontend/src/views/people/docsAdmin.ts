import type {View} from '../../types';
export const view:View="docsAdmin";
export const route="/people/docsAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
