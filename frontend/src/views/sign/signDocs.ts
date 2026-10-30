import type {View} from '../../types';
export const view:View="signDocs";
export const route="/sign/signDocs";
export const render=(views:Record<View,()=>string>):string=>views[view]();
