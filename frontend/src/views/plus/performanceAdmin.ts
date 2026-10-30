import type {View} from '../../types';
export const view:View="performanceAdmin";
export const route="/plus/performanceAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
