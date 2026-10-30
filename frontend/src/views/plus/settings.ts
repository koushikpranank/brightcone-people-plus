import type {View} from '../../types';
export const view:View="settings";
export const route="/plus/settings";
export const render=(views:Record<View,()=>string>):string=>views[view]();
