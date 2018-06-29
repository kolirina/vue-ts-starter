/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import {UI} from "./UI";
import Vuetify from 'vuetify';
import VeeValidate from 'vee-validate';
import Vue from "vue";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {Dashboard} from "../components/dashboard";
import {Filters} from "../platform/filters/Filters";
import {PieChart} from '../components/charts/pieChart';
import {LineChart} from '../components/charts/lineChart';
import Highcharts from 'highcharts';
import exporting from 'highcharts/modules/exporting';
import Highcharts3D from 'highcharts-3d'
import * as Cookies from "js-cookie";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StateDirective} from "../platform/directives/stateDirective";
import ElementUI from 'element-ui';

Highcharts3D(Highcharts);
exporting(Highcharts);

export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init(): boolean {

        Vue.use(Vuetify);
        Vue.use(VeeValidate);
        Vue.use(ElementUI);

        // компоненты
        UI.component("dashboard", Dashboard);
        UI.component("add-trade-dialog", AddTradeDialog);
        UI.component("pie-chart", PieChart);
        UI.component("line-chart", LineChart);

        // фильтры
        UI.filter('amount', Filters.formatMoneyAmount);
        UI.filter('number', Filters.formatNumber);
        UI.filter("date", Filters.formatDate);

        // директивы
        UI.directive(StateDirective.NAME, new StateDirective());

        Vue.mixin({
            beforeCreate() {
                this.$cookies = Cookies;
                this.$uistate = UiStateHelper;
            }
        });

        return true;
    }
}
