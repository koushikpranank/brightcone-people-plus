import type {View} from '../../types';
export const view:View="attendanceAdmin";
export const route="/shift/attendanceAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
