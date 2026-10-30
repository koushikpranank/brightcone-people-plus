import type {View} from '../../types';
export const view:View="suiteDash";
export const route="/plus/suiteDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
