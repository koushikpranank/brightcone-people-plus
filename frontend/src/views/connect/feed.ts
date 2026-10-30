import type {View} from '../../types';
export const view:View="feed";
export const route="/connect/feed";
export const render=(views:Record<View,()=>string>):string=>views[view]();
