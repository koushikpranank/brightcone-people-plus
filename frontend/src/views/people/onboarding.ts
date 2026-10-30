import type {View} from '../../types';
export const view:View="onboarding";
export const route="/people/onboarding";
export const render=(views:Record<View,()=>string>):string=>views[view]();
