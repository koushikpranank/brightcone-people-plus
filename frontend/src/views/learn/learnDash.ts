import type {View} from '../../types';
export const view:View="learnDash";
export const route="/learn/learnDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
