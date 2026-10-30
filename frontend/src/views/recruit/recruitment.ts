import type {View} from '../../types';
export const view:View="recruitment";
export const route="/recruit/recruitment";
export const render=(views:Record<View,()=>string>):string=>views[view]();
