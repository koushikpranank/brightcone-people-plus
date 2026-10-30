import type {View} from '../../types';
export const view:View="myAttendance";
export const route="/people/myAttendance";
export const render=(views:Record<View,()=>string>):string=>views[view]();
