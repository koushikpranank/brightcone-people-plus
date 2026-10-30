import type {View} from '../../types';
export const view:View="shiftRoster";
export const route="/shift/shiftRoster";
export const render=(views:Record<View,()=>string>):string=>views[view]();
