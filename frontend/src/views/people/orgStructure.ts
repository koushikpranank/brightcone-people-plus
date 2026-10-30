import type {View} from '../../types';
export const view:View="orgStructure";
export const route="/people/orgStructure";
export const render=(views:Record<View,()=>string>):string=>views[view]();
