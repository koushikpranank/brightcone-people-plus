import type {View} from '../../types';
export const view:View="signTemplates";
export const route="/sign/signTemplates";
export const render=(views:Record<View,()=>string>):string=>views[view]();
