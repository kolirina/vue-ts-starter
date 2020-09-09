import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {CompositePortfolioManagementDialog} from "../components/dialogs/compositePortfolioManagementDialog";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {Storage} from "../platform/services/storage";
import {ClientInfo} from "../services/clientService";
import {ExportService, ExportType} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams} from "../services/portfolioService";
import {HighStockEventsGroup, LineChartItem, PortfolioLineChartData} from "../types/charts/types";
import {EventType} from "../types/eventType";
import {StoreKeys} from "../types/storeKeys";
import {CombinedPortfolioParams, OverviewPeriod, Portfolio} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {DateUtils} from "../utils/dateUtils";
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
                <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
                <base-portfolio-page v-else
                                     :overview="portfolio.overview"
                                     :portfolio-name="portfolio.portfolioParams.name"
                                     :portfolio-id="portfolio.id ? String(portfolio.id) : portfolio.id"
                                     :line-chart-data="lineChartData"
                                     :line-chart-events="lineChartEvents"
                                     :index-line-chart-data="indexLineChartData"
                                     :view-currency="portfolio.portfolioParams.viewCurrency"
                                     :state-key-prefix="StoreKeys.PORTFOLIO_CHART"
                                     :side-bar-opened="sideBarOpened"
                                     :share-notes="portfolio.portfolioParams.shareNotes"
                                     :professional-mode="portfolio.portfolioParams.professionalMode"
                                     :current-money-remainder="currentMoneyRemainder"
                                     @reloadLineChart="loadPortfolioLineChart"
                                     @exportTable="onExportTable"
                                     exportable>
                    <template v-if="showCombinedInfoBlock" #afterDashboard>
                        <v-layout align-center>
                            <div :class="['control-portfolios-title', !isEmptyBlockShowed ? '' : 'pl-3']">
                                Управление составным портфелем
                            </div>
                            <v-spacer></v-spacer>
                            <div v-if="!isEmptyBlockShowed" class="control-portfolios__btns">
                                <v-btn class="btn" color="primary" @click="exportPortfolio">
                                    Экспорт в xlsx
                                </v-btn>
                                <v-btn class="btn" color="primary" @click.stop="showDialogCompositePortfolio">
                                    Сформировать
                                </v-btn>
                            </div>
                        </v-layout>
                        <v-layout v-if="isEmptyBlockShowed" column class="empty-station px-4 py-4 mt-3">
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
export class PortfolioPage extends UI {

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
    private localStorage: Storage;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private exportService: ExportService;
    /** Данные графика стоимости портфеля */
    private lineChartData: LineChartItem[] = null;
    /** Данные графика портфеля */
    private portfolioLineChartData: PortfolioLineChartData = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** События для графика стоимости портфеля */
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Доступные периоды */
    private periods: Period[] = [];
    /** Выбранный период */
    private selectedPeriod: Period = null;
    /** Текущий остаток денег в портфеле */
    private currentMoneyRemainder: string = null;
    /** Признак инициализации */
    private initialized = false;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    async created(): Promise<void> {
        try {
            const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, null);
            await this.loadPortfolioLineChart();
            await this.getCurrentMoneyRemainder();
            const firstTradeYear = DateUtils.getYearDate(this.portfolio.overview.firstTradeDate);
            const currentYear = dayjs().year();

            if (firstTradeYear < currentYear) {
                for (let year = firstTradeYear; year < currentYear; year++) {
                    this.periods.push({code: String(year), description: String(year)});
                }
            }
            this.periods.push(...OverviewPeriod.values().map(value => {
                return {code: value.code, description: value.description} as Period;
            }));
            // по умолчанию выбран за весь период
            this.selectedPeriod = this.periods[this.periods.length - 1];
            UI.on(EventType.TRADE_CREATED, async () => {
                await this.reloadPortfolio();
                // срабатывает вотчер на портфеле
            });
        } finally {
            this.initialized = true;
        }
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadPortfolioData();
    }

    @DisableConcurrentExecution
    private async loadPortfolioData(): Promise<void> {
        this.initialized = false;
        try {
            this.lineChartData = null;
            this.lineChartEvents = null;
            await this.loadPortfolioLineChart();
            await this.getCurrentMoneyRemainder();
        } finally {
            this.initialized = true;
        }
    }

    /**
     * Загружает текущие остатки по деньгам
     */
    @ShowProgress
    private async getCurrentMoneyRemainder(): Promise<void> {
        if (this.portfolio.id) {
            this.currentMoneyRemainder = await this.overviewService.getCurrentMoney(this.portfolio.id);
        }
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            if (this.portfolio.portfolioParams.combinedFlag) {
                this.portfolioLineChartData = await this.overviewService.getCostChartCombined({
                    ids: this.portfolio.portfolioParams.combinedIds,
                    viewCurrency: this.portfolio.portfolioParams.viewCurrency
                });
            } else {
                this.portfolioLineChartData = await this.overviewService.getCostChart(this.portfolio.id);
            }
            this.lineChartData = this.portfolioLineChartData.lineChartData;
            // TODO сделать независимую загрузку по признаку в localStorage
            if (this.portfolio.overview.firstTradeDate) {
                this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.portfolio.overview.firstTradeDate).format("DD.MM.YYYY"));
            }
            if (this.portfolio.portfolioParams.combinedFlag) {
                this.lineChartEvents = await this.overviewService.getEventsChartDataCombined({
                    ids: this.portfolio.portfolioParams.combinedIds,
                    viewCurrency: this.portfolio.portfolioParams.viewCurrency
                }, false);
            } else {
                this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id, false);
            }
        }
    }

    private async showDialogCompositePortfolio(): Promise<void> {
        const result = await new CompositePortfolioManagementDialog().show({
            portfolios: this.clientInfo.user.portfolios,
            viewCurrency: this.portfolio.portfolioParams.viewCurrency
        });
        if (result) {
            this.overviewService.resetCacheForCombinedPortfolio({
                ids: this.combinedPortfolioParams.combinedIds,
                viewCurrency: this.combinedPortfolioParams.viewCurrency
            });
            this.updateCombinedPortfolio(result);
            const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
            portfolioParams.viewCurrency = result;
            this.localStorage.set(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, portfolioParams);
            await this.reloadPortfolio();
        }
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

    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        if (this.portfolio.id) {
            await this.exportService.exportReport(this.portfolio.id, exportType);
        } else {
            await this.exportService.exportCombinedReport({
                ids: this.portfolio.portfolioParams.combinedIds,
                viewCurrency: this.portfolio.portfolioParams.viewCurrency
            }, exportType);
        }
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }

    private get showCombinedInfoBlock(): boolean {
        return this.$route.name === "combined-portfolio";
    }
}

export interface Period {
    code: string;
    description: string;
}
