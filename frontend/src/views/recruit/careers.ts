import type {View} from '../../types';
export const view:View="careers";
export const route="/recruit/careers";
export const render=(views:Record<View,()=>string>):string=>views[view]();
