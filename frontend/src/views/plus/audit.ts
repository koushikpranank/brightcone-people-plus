import type {View} from '../../types';
export const view:View="audit";
export const route="/plus/audit";
export const render=(views:Record<View,()=>string>):string=>views[view]();
