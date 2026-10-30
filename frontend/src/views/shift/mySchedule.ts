import type {View} from '../../types';
export const view:View="mySchedule";
export const route="/shift/mySchedule";
export const render=(views:Record<View,()=>string>):string=>views[view]();
