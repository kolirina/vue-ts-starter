/**
 * Реестр стандартных UI-компонтентов, фильтров и директив
 */
import dayjs from "dayjs";
import "dayjs/locale/ru";
import Highcharts from "highcharts";
import Highstock from "highcharts/highstock";
import exporting from "highcharts/modules/exporting";
import Clipboard from "v-clipboard";
import VeeValidate, {Validator} from "vee-validate";
import Vue from "vue";
// import VueGtm from "vue-gtm";
import VueQriously from "vue-qriously";
import Snotify, {SnotifyPosition} from "vue-snotify";
import vuescroll from "vuescroll";
import Vuetify from "vuetify";
import {BondLink} from "../components/bondLink";
import {ChartExportMenu} from "../components/charts/chartExportMenu";
import {LineChart} from "../components/charts/lineChart";
import {MicroLineChart} from "../components/charts/microLineChart";
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
import {TariffExpiredHover} from "../components/tariffExpiredHover";
import {HoverTooltip} from "../platform/directives/hoverTooltip";
import {StateDirective} from "../platform/directives/stateDirective";
import {Filters} from "../platform/filters/Filters";
import {highchartsRu} from "../platform/locale/highchartsRu";
import {RU} from "../platform/locale/ru";
import {ruLocale} from "../platform/locale/veeValidateMessages";
// import {RouterConfiguration} from "../router/routerConfiguration";
import {UiStateHelper} from "../utils/uiStateHelper";
import {UI} from "./ui";

exporting(Highcharts);
exporting(Highstock);

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
                preventDuplicates: false
            },
            toast: {
                position: SnotifyPosition.rightTop,
                timeout: 5000,
                showProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                bodyMaxLength: 255
            }
        });
        // Vue.use(VueGtm, {
        //     id: "GTM-5WP2PK2", // Your GTM ID
        //     enabled: true, // defaults to true. Plugin can be disabled by setting this to false for Ex: enabled: !!GDPR_Cookie (optional)
        //     debug: false, // Whether or not display console logs debugs (optional)
        //     vueRouter: RouterConfiguration.getRouter(), // Pass the router instance to automatically sync with router (optional)
        //     ignoredViews: [] // If router, you can exclude some routes name (case insensitive) (optional)
        // });

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
        UI.component("tariff-expired", TariffExpiredHover);
        /* Компонент с маской для десятичных дробей */
        UI.component("ii-number-field", IINumberField);
        UI.component("share-search", ShareSearchComponent);
        UI.component("expanded-panel", ExpandedPanel);
        UI.component("chart-export-menu", ChartExportMenu);
        UI.component("micro-line-chart", MicroLineChart);

        // фильтры
        UI.filter("amount", Filters.formatMoneyAmount);
        UI.filter("assetDesc", Filters.assetDesc);
        UI.filter("number", Filters.formatNumber);
        UI.filter("integer", Filters.formatInteger);
        UI.filter("date", Filters.formatDate);
        UI.filter("declension", Filters.declension);
        UI.filter("currencySymbolByCurrency", Filters.currencySymbolByCurrency);
        UI.filter("currencySymbol", Filters.currencySymbol);
        UI.filter("bytes", Filters.formatBytes);

        // директивы
        UI.directive(StateDirective.NAME, new StateDirective());
        UI.directive(HoverTooltip.NAME, new HoverTooltip());

        UI.mixin({
            beforeCreate(): void {
                this.$uistate = UiStateHelper;
            }
        });

        // устанавливаем формат даты по умолчанию
        Validator.dictionary.setDateFormat("ru", "DD.MM.YYYY");
        // устанавливаем локализованные сообщения
        Validator.localize("ru", ruLocale);
        dayjs.locale("ru");
        // локализация highcharts
        Highcharts.setOptions({lang: highchartsRu});
        Highstock.setOptions({lang: highchartsRu});
    }
}
