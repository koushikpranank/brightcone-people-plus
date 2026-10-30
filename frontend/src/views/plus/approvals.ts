import type {View} from '../../types';
export const view:View="approvals";
export const route="/plus/approvals";
export const render=(views:Record<View,()=>string>):string=>views[view]();
