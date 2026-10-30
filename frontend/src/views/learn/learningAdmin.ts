import type {View} from '../../types';
export const view:View="learningAdmin";
export const route="/learn/learningAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
