import {PluginFunction, PluginObject} from 'vue';
import {DirectiveOptions} from "vue/types/options";

// declare class _VMoney {
//
//     static install: PluginFunction<never>;
// }
//
// declare class VMoney extends _VMoney {}
//
// declare module "v-money" {
//     export default VMoney;
// }

declare module 'awesome-mask' {

    export const install: PluginFunction<never>;

    export const directive: DirectiveOptions;
}