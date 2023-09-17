import Vue from "vue";
import {RawLocation, Route} from "vue-router/types/router";
import {DefaultComputed, DefaultData, DefaultMethods, DefaultProps, PropsDefinition} from "vue/types/options";

declare module "vue/types/vue" {

    interface Vue {
        $uistate: UiStateHelper;
        $snotify: SnotifyService;
    }
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue, Data = DefaultData<V>, Methods = DefaultMethods<V>, Computed = DefaultComputed, PropsDef = PropsDefinition<DefaultProps>> {
    }
}

export type NavigationGuard = (to: Route, from: Route, next: Resolver) => any;

export type Resolver = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;
