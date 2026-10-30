import type {View} from '../../types';
export const view:View="announcements";
export const route="/connect/announcements";
export const render=(views:Record<View,()=>string>):string=>views[view]();
