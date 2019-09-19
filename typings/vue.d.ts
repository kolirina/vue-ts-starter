import Vue, {ComponentOptions} from "vue";
import {RawLocation, Route} from "vue-router/types/router";
import {SnotifyService} from "vue-snotify/SnotifyService";
import {DefaultComputed, DefaultData, DefaultMethods, DefaultProps, PropsDefinition} from "vue/types/options";
import {VueTour} from "./vue-tour";

declare module "vue/types/vue" {

    interface Vue {
        $uistate: UiStateHelper;
        $snotify: SnotifyService;
        $tours: VueTour;
    }
}

declare module "vue/types/options" {
    interface ComponentOptions<V extends Vue, Data = DefaultData<V>, Methods = DefaultMethods<V>, Computed = DefaultComputed, PropsDef = PropsDefinition<DefaultProps>> {
        $uistate?: UiStateHelper;
        $snotify?: SnotifyService;
    }
}

export type NavigationGuard = (to: Route, from: Route, next: Resolver) => any;

export type Resolver = (to?: RawLocation | false | ((vm: Vue) => any) | void) => void;

export class UiStateHelper {
    static stocksTablePanel: number[];
    static bondsTablePanel: number[];
    static yearDivsTablePanel: number[];
    static divTradesTablePanel: number[];
    static sumYearDivsTablePanel: number[];
    static sumDivsTablePanel: number[];
    static combinedPanel: number[];
    static historyPanel: number[];
    static stockGraph: number[];
    static bondGraph: number[];
    static sectorsGraph: number[];
    static investmentsSettingsPanel: number[];
    static referralStatisticsPanel: number[];
    static eventsCalendarPanel: number[];

    static toggleState(type: string): void;
}
