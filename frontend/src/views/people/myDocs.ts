import type {View} from '../../types';
export const view:View="myDocs";
export const route="/people/myDocs";
export const render=(views:Record<View,()=>string>):string=>views[view]();
