import dayjs from "dayjs";
import {Container, Inject} from "typescript-ioc";
import {ContentLoader} from "vue-content-loader";
import {Route} from "vue-router";
import {namespace} from "vuex-class/lib/bindings";
import {Resolver} from "../../../typings/vue";
import {Component, UI} from "../app/ui";
import {BlockByTariffDialog} from "../components/dialogs/blockByTariffDialog";
import {CompositePortfolioManagementDialog} from "../components/dialogs/compositePortfolioManagementDialog";
import {ShowProgress} from "../platform/decorators/showProgress";
import {Storage} from "../platform/services/storage";
import {ClientInfo, ClientService} from "../services/clientService";
import {ExportService, ExportType} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams} from "../services/portfolioService";
import {HighStockEventsGroup, LineChartItem, PortfolioLineChartData} from "../types/charts/types";
import {Currency} from "../types/currency";
import {EventType} from "../types/eventType";
import {Permission} from "../types/permission";
import {StoreKeys} from "../types/storeKeys";
import {CombinedPortfolioParams, ForbiddenCode, Portfolio} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <base-portfolio-page :overview="portfolio.overview"
                                     :line-chart-data="lineChartData"
                                     :line-chart-events="lineChartEvents"
                                     :index-line-chart-data="indexLineChartData"
                                     portfolio-name="Составной портфель"
                                     :view-currency="portfolio.portfolioParams.viewCurrency"
                                     :state-key-prefix="StoreKeys.PORTFOLIO_COMBINED_CHART"
                                     :side-bar-opened="sideBarOpened"
                                     @reloadLineChart="loadPortfolioLineChart"
                                     @exportTable="onExportTable">
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
    private portfolio: Portfolio;
    /** Комбинированный портфель */
    @MainStore.Getter
    private combinedPortfolioParams: PortfolioParams;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_COMBINED_PORTFOLIO)
    private updateCombinedPortfolio: (viewCurrency: string) => void;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private storage: Storage;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private exportService: ExportService;
    /** Данные графика стоимости портфеля */
    private lineChartData: LineChartItem[] = null;
    /** Данные графика портфеля */
    private portfolioLineChartData: PortfolioLineChartData = null;
    /** Данные по событиям для графика стоимости */
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Признак инициализации */
    private initialized = false;

    /**
     * Инициализация данных компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        try {
            const portfolioParams = this.storage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
            this.updateCombinedPortfolio(portfolioParams.viewCurrency || Currency.RUB);
            await this.doCombinedPortfolio();
            UI.on(EventType.TRADE_CREATED, async (): Promise<void> => {
                await this.reloadPortfolio();
                await this.doCombinedPortfolio();
            });
        } finally {
            this.initialized = true;
        }
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

    private async showDialogCompositePortfolio(): Promise<void> {
        const result = await new CompositePortfolioManagementDialog().show({
            portfolios: this.clientInfo.user.portfolios,
            viewCurrency: this.portfolio.portfolioParams.viewCurrency
        });
        if (result) {
            this.updateCombinedPortfolio(result);
            const portfolioParams = this.storage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
            portfolioParams.viewCurrency = result;
            this.storage.set(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, portfolioParams);
            await this.doCombinedPortfolio();
        }
    }

    private async doCombinedPortfolio(): Promise<void> {
        this.initialized = false;
        try {
            await this.loadPortfolioLineChart();
        } finally {
            this.initialized = true;
        }
    }

    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportCombinedReport({
            ids: this.portfolio.portfolioParams.combinedIds,
            viewCurrency: this.portfolio.portfolioParams.viewCurrency
        }, exportType);
    }

    /**
     * Экспортирует данные комбинированного портфеля в xlsx
     */
    private async exportPortfolio(): Promise<void> {
        await this.exportService.exportCombinedReport({
            ids: this.combinedPortfolioParams.combinedIds,
            viewCurrency: this.portfolio.portfolioParams.viewCurrency
        }, ExportType.COMPLEX);
    }

    private blockNotEmpty(): boolean {
        return this.portfolio.overview.totalTradesCount !== 0;
    }

    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1) {
            this.portfolioLineChartData = await this.overviewService.getCostChartCombined({
                ids: this.combinedPortfolioParams.combinedIds,
                viewCurrency: this.portfolio.portfolioParams.viewCurrency
            });
            this.lineChartData = this.portfolioLineChartData.lineChartData;
            if (this.portfolio.overview.firstTradeDate) {
                this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.portfolio.overview.firstTradeDate).format("DD.MM.YYYY"));
            }
            this.lineChartEvents = await this.overviewService.getEventsChartDataCombined({
                ids: this.combinedPortfolioParams.combinedIds,
                viewCurrency: this.portfolio.portfolioParams.viewCurrency
            });
        }
    }
}
