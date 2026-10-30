import type {View} from '../../types';
export const view:View="myPerformance";
export const route="/plus/myPerformance";
export const render=(views:Record<View,()=>string>):string=>views[view]();
