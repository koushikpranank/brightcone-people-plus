import type {View} from '../../types';
export const view:View="profile";
export const route="/people/profile";
export const render=(views:Record<View,()=>string>):string=>views[view]();
