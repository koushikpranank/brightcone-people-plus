import type {View} from '../../types';
export const view:View="home";
export const route="/plus/home";
export const render=(views:Record<View,()=>string>):string=>views[view]();
