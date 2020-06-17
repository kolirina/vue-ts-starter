import dayjs from "dayjs";
import {Container, Inject} from "typescript-ioc";
import {ContentLoader} from "vue-content-loader";
import {Route} from "vue-router";
import {namespace} from "vuex-class/lib/bindings";
import {Resolver} from "../../../typings/vue";
import {Component, UI} from "../app/ui";
import {BlockByTariffDialog} from "../components/dialogs/blockByTariffDialog";
import {CompositePortfolioManagement} from "../components/dialogs/compositePortfolioManagement";
import {ShowProgress} from "../platform/decorators/showProgress";
import {Storage} from "../platform/services/storage";
import {ClientInfo, ClientService} from "../services/clientService";
import {ExportService} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup} from "../types/charts/types";
import {Currency} from "../types/currency";
import {AddTradeEvent, EventType} from "../types/eventType";
import {Permission} from "../types/permission";
import {StoreKeys} from "../types/storeKeys";
import {ForbiddenCode, Overview} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="overview">
                <base-portfolio-page :overview="overview" :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :index-line-chart-data="indexLineChartData"
                                     portfolio-name="Составной портфель" :view-currency="viewCurrency" :state-key-prefix="StoreKeys.PORTFOLIO_COMBINED_CHART"
                                     :side-bar-opened="sideBarOpened" :ids="ids"
                                     @reloadLineChart="loadPortfolioLineChart"
                                     @reloadLineChart="loadProfitLineChart">
                    <template #afterDashboard>
                        <v-layout align-center>
                            <div :class="['control-portfolios-title', blockNotEmpty() ? '' : 'pl-3']">
                                Управление составным портфелем
                            </div>
                            <v-spacer></v-spacer>
                            <div v-if="blockNotEmpty()" class="control-portfolios__btns">
                                <v-btn class="btn" color="primary" @click="exportPortfolio">
                                    Экспорт в xlsx
                                </v-btn>
                                <v-btn class="btn" color="primary" @click.stop="showDialogCompositePortfolio">
                                    Сформировать
                                </v-btn>
                            </div>
                        </v-layout>
                        <v-layout v-if="!blockNotEmpty()" column class="empty-station px-4 py-4 mt-3">
                            <div class="empty-station__description" data-v-step="0">
                                Здесь вы можете объединить для просмотра несколько портфелей в один, и проанализировать
                                состав и доли каждой акции, если, например, она входит в состав нескольких портфелей.
                            </div>
                            <div class="mt-4">
                                <v-btn class="btn" color="primary" @click.stop="showDialogCompositePortfolio">
                                    Сформировать
                                </v-btn>
                            </div>
                        </v-layout>
                    </template>
                </base-portfolio-page>
            </template>
            <template v-else>
                <content-loader class="content-loader" :height="800" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="20" rx="5" ry="5" width="801.11" height="80"/>
                    <rect x="0" y="120" rx="5" ry="5" width="801.11" height="30"/>
                    <rect x="0" y="170" rx="5" ry="5" width="801.11" height="180"/>
                    <rect x="0" y="370" rx="5" ry="5" width="801.11" height="180"/>
                    <rect x="0" y="570" rx="5" ry="5" width="801.11" height="180"/>
                </content-loader>
            </template>
        </v-slide-x-reverse-transition>
    `,
    components: {BasePortfolioPage}
})
export class CombinedPortfolioPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private storage: Storage;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private exportService: ExportService;
    /** Данные комбинированного портфеля */
    private overview: Overview = null;
    /** Валюта просмотра портфеля */
    private viewCurrency: string = Currency.RUB;
    /** Данные графика стоимости портфеля */
    private lineChartData: any[] = null;
    /** Данные по событиям для графика стоимости */
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Айди портфелей для комбинирования */
    private ids: number[] = [];

    /**
     * Инициализация данных компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.viewCurrency = this.storage.get<string>(StoreKeys.COMBINED_VIEW_CURRENCY_KEY, Currency.RUB);
        this.setIds();
        await this.doCombinedPortfolio();
        UI.on(EventType.TRADE_CREATED, async (event: AddTradeEvent): Promise<void> => {
            await this.reloadPortfolio(event.portfolioId);
            // перезагружаем информацию если сделка была добавлена в портфель входящий в составной
            if (this.ids.includes(event.portfolioId)) {
                await this.doCombinedPortfolio();
            }
        });
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    /**
     * Осуществляет проверку доступа к разделу
     * @param {Route} to      целевой объект Route, к которому осуществляется переход.
     * @param {Route} from    текущий путь, с которого осуществляется переход к новому.
     * @param {Resolver} next функция, вызов которой разрешает хук.
     * @inheritDoc
     * @returns {Promise<void>}
     */
    async beforeRouteEnter(to: Route, from: Route, next: Resolver): Promise<void> {
        const clientService: ClientService = Container.get(ClientService);
        const clientInfo = await clientService.getClientInfo();
        if (!clientInfo.tariff.hasPermission(Permission.COMBINED_PORTFOLIO)) {
            await new BlockByTariffDialog().show(ForbiddenCode.PERMISSION_DENIED);
            next(false);
            return;
        }
        next();
    }

    /**
     * Подготавливает идентификаторы портфелей
     */
    private setIds(): void {
        this.ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
    }

    private async showDialogCompositePortfolio(): Promise<void> {
        const result = await new CompositePortfolioManagement().show({portfolio: this.clientInfo.user.portfolios, viewCurrency: this.viewCurrency});
        if (result) {
            this.viewCurrency = result;
            this.setIds();
            await this.doCombinedPortfolio();
        }
    }

    private async doCombinedPortfolio(): Promise<void> {
        this.overview = null;
        this.overview = await this.overviewService.getPortfolioOverviewCombined({ids: this.ids, viewCurrency: this.viewCurrency});
        await this.loadPortfolioLineChart();
        this.storage.set(StoreKeys.COMBINED_VIEW_CURRENCY_KEY, this.viewCurrency);
    }

    /**
     * Экспортирует данные комбинированного портфеля в xlsx
     */
    private async exportPortfolio(): Promise<void> {
        await this.exportService.exportCombinedReport({ids: this.ids, viewCurrency: this.viewCurrency});
    }

    private blockNotEmpty(): boolean {
        return this.overview.totalTradesCount !== 0;
    }

    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1) {
            await this.loadLineChartData();
        }
    }

    @ShowProgress
    private async loadProfitLineChart(): Promise<void> {
        if (UiStateHelper.profitChartPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            await this.loadLineChartData();
        }
    }

    private async loadLineChartData(): Promise<void> {
        this.lineChartData = await this.overviewService.getCostChartCombined({ids: this.ids, viewCurrency: this.viewCurrency});
        if (this.overview.firstTradeDate) {
            this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.overview.firstTradeDate).format("DD.MM.YYYY"));
        }
        this.lineChartEvents = await this.overviewService.getEventsChartDataCombined({ids: this.ids, viewCurrency: this.viewCurrency});
    }
}
