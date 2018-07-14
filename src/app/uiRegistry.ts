/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import {UI} from "./UI";
import Vuetify from 'vuetify';
import VeeValidate, {Validator} from 'vee-validate';
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
import ru from '../platform/locale/ru'
import {ruLocale} from "../platform/locale/veeValidateMessages";
import IMask from 'imask';
import {MaskDirective} from "../platform/directives/maskDirective";

Highcharts3D(Highcharts);
exporting(Highcharts);

export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init(): boolean {

        Vue.use(Vuetify, {
            lang: {
                locales: {ru},
                current: 'ru'
            }
        });
        UI.use(VeeValidate);
        UI.use(ElementUI);

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
        UI.directive(MaskDirective.NAME, new MaskDirective());

        Vue.mixin({
            beforeCreate() {
                this.$cookies = Cookies;
                this.$uistate = UiStateHelper;
            }
        });

        // устанавливаем формат даты по умолчанию
        Validator.dictionary.setDateFormat("ru", "DD.MM.YYYY");
        // устанавливаем локализованные сообщения
        Validator.localize("ru", ruLocale);

        return true;
    }
}
