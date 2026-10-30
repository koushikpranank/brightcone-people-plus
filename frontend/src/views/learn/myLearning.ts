import type {View} from '../../types';
export const view:View="myLearning";
export const route="/learn/myLearning";
export const render=(views:Record<View,()=>string>):string=>views[view]();
