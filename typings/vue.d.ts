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
    stocksTablePanel: boolean;
    bondsTablePanel: boolean;
    yearDivsTablePanel: boolean;
    divTradesTablePanel: boolean;
    sumYearDivsTablePanel: boolean;
    sumDivsTablePanel: boolean;
    combinedPanel: boolean;
    historyPanel: boolean;
    stockGraph: boolean;
    bondGraph: boolean;
    sectorsGraph: boolean;
    investmentsSettingsPanel: boolean;
    referralStatisticsPanel: boolean;
    eventsCalendarPanel: boolean;

    setState(type: string, value: boolean): void;
    toggleState(type: string): void;
}
    