import type {View} from '../../types';
export const view:View="signDash";
export const route="/sign/signDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
