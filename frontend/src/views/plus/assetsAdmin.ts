import type {View} from '../../types';
export const view:View="assetsAdmin";
export const route="/plus/assetsAdmin";
export const render=(views:Record<View,()=>string>):string=>views[view]();
