import type {View} from '../../types';
export const view:View="reports";
export const route="/plus/reports";
export const render=(views:Record<View,()=>string>):string=>views[view]();
