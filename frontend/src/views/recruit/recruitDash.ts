import type {View} from '../../types';
export const view:View="recruitDash";
export const route="/recruit/recruitDash";
export const render=(views:Record<View,()=>string>):string=>views[view]();
