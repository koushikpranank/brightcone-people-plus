import type {View} from '../../types';
export const view:View="myAssets";
export const route="/plus/myAssets";
export const render=(views:Record<View,()=>string>):string=>views[view]();
