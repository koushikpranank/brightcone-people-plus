import type {View} from '../../types';
export const view:View="shiftSwaps";
export const route="/shift/shiftSwaps";
export const render=(views:Record<View,()=>string>):string=>views[view]();
