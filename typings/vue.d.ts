import Vue from 'vue';
import {DefaultComputed, DefaultData, DefaultMethods, DefaultProps, PropsDefinition} from "vue/types/options";
import Cookies from "js-cookie";

declare module 'vue/types/vue' {
    interface Vue {
        $cookies: Cookies.CookiesStatic;
        $uistate: UiStateHelper;
    }
}

declare module 'vue/types/options' {
    interface ComponentOptions<V extends Vue, Data=DefaultData<V>, Methods=DefaultMethods<V>, Computed=DefaultComputed, PropsDef=PropsDefinition<DefaultProps>> {
        cookies?: Cookies.CookiesStatic;
        $uistate?: UiStateHelper;
    }
}

declare interface UiStateHelper {
    stocksTablePanel: number;
    bondsTablePanel: number;
    yearDivsTablePanel: number;
    divTradesTablePanel: number;
    sumYearDivsTablePanel: number;
    sumDivsTablePanel: number;
    combinedPanel: number;
    historyPanel: number;
    stockGraph: number;
    bondGraph: number;
    sectorsGraph: number;
    investmentsSettingsPanel: number;
    referralStatisticsPanel: number;
    eventsCalendarPanel: number;

    setState(type: string, value: number): void;
    toggleState(type: string): void;
}
