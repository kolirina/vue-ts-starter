/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import Highcharts from "highcharts";
import Highcharts3D from "highcharts-3d";
import Highstock from "highcharts/highstock";
import exporting from "highcharts/modules/exporting";
import Clipboard from "v-clipboard";
import VeeValidate, {Validator} from "vee-validate";
import Vue from "vue";
import VueQriously from "vue-qriously";
import Snotify, {SnotifyPosition} from "vue-snotify";
import vuescroll from "vuescroll";
import Vuetify from "vuetify";
import {BondLink} from "../components/bondLink";
import {LineChart} from "../components/charts/lineChart";
import {PieChart} from "../components/charts/pieChart";
import {Dashboard} from "../components/dashboard";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {ImageDialog} from "../components/dialogs/imageDialog";
import {ExpandedPanel} from "../components/expandedPanel";
import {FileDropArea} from "../components/file-upload/fileDropArea";
import {FileLink} from "../components/file-upload/fileLink";
import {IINumberField} from "../components/iiNumberField";
import {InplaceInput} from "../components/inplaceInput";
import {ShareSearchComponent} from "../components/shareSearchComponent";
import {StockLink} from "../components/stockLink";
import {StateDirective} from "../platform/directives/stateDirective";
import {Filters} from "../platform/filters/Filters";
import {highchartsRu} from "../platform/locale/highchartsRu";
import {RU} from "../platform/locale/ru";
import {ruLocale} from "../platform/locale/veeValidateMessages";
import {UiStateHelper} from "../utils/uiStateHelper";
import {UI} from "./ui";

Highcharts3D(Highcharts);
exporting(Highcharts);

export class UIRegistry {

    /**
     * Инициализация реестра компонентов, фильтров и директив
     */
    static init(): void {

        Vue.use(Clipboard);

        Vue.use(vuescroll, {
            ops: {
                vuescroll: {
                    mode: "native",
                    sizeStrategy: "percent",
                    detectResize: true
                },
                bar: {
                    showDelay: 500,
                    onlyShowBarOnScroll: true,
                    keepShow: false,
                    background: "#c1c1c1",
                    opacity: 1,
                    hoverStyle: false,
                    specifyBorderRadius: false,
                    minSize: false,
                    size: "6px"
                }
            }
        });
        Vue.use(VueQriously);

        Vue.use(Vuetify, {
            lang: {
                locales: {"ru": RU},
                current: "ru"
            }
        });
        UI.use(VeeValidate);
        Vue.use(Snotify, {
            global: {
                maxOnScreen: 3,
                preventDuplicates: true
            },
            toast: {
                position: SnotifyPosition.rightTop,
                timeout: 3000,
                showProgressBar: true,
                closeOnClick: false,
                pauseOnHover: true
            }
        });

        // компоненты
        UI.component("dashboard", Dashboard);
        UI.component("add-trade-dialog", AddTradeDialog);
        UI.component("pie-chart", PieChart);
        UI.component("line-chart", LineChart);
        UI.component("file-drop-area", FileDropArea);
        UI.component("file-link", FileLink);
        UI.component("image-dialog", ImageDialog);
        UI.component("inplace-input", InplaceInput);
        UI.component("stock-link", StockLink);
        UI.component("bond-link", BondLink);
        /* Компонент с маской для десятичных дробей */
        UI.component("ii-number-field", IINumberField);
        UI.component("share-search", ShareSearchComponent);
        UI.component("expanded-panel", ExpandedPanel);

        // фильтры
        UI.filter("amount", Filters.formatMoneyAmount);
        UI.filter("assetDesc", Filters.assetDesc);
        UI.filter("number", Filters.formatNumber);
        UI.filter("date", Filters.formatDate);
        UI.filter("declension", Filters.declension);

        // директивы
        UI.directive(StateDirective.NAME, new StateDirective());

        UI.mixin({
            beforeCreate(): void {
                this.$uistate = UiStateHelper;
            }
        });

        // устанавливаем формат даты по умолчанию
        Validator.dictionary.setDateFormat("ru", "DD.MM.YYYY");
        // устанавливаем локализованные сообщения
        Validator.localize("ru", ruLocale);
        // локализация highcharts
        Highcharts.setOptions({lang: highchartsRu});
        Highstock.setOptions({lang: highchartsRu});
    }
}