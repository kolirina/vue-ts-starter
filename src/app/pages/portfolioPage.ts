import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup, LineChartItem, PortfolioLineChartData} from "../types/charts/types";
import {EventType} from "../types/eventType";
import {StoreKeys} from "../types/storeKeys";
import {Overview, OverviewPeriod, Portfolio} from "../types/types";
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
        <div v-if="portfolio" class="h100pc">
            <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
            <base-portfolio-page v-else :overview="overview" :portfolio-name="portfolio.portfolioParams.name"
                                 :portfolio-id="String(portfolio.portfolioParams.id)"
                                 :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :index-line-chart-data="indexLineChartData"
                                 :view-currency="portfolio.portfolioParams.viewCurrency"
                                 :state-key-prefix="StoreKeys.PORTFOLIO_CHART" :side-bar-opened="sideBarOpened" :share-notes="portfolio.portfolioParams.shareNotes"
                                 :professional-mode="portfolio.portfolioParams.professionalMode"
                                 :current-money-remainder="currentMoneyRemainder"
                                 @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable>
                <template #afterDashboard>
                    <v-layout v-show="false" align-center>
                        <v-btn-toggle v-model="selectedPeriod" @change="onPeriodChange" mandatory>
                            <v-btn v-for="period in periods" :value="period" :key="period.code" depressed class="btn-item">
                                {{ period.description }}
                            </v-btn>
                        </v-btn-toggle>
                        <v-tooltip content-class="custom-tooltip-wrap" max-width="340px" bottom>
                            <sup class="custom-tooltip" slot="activator">
                                <v-icon>fas fa-info-circle</v-icon>
                            </sup>
                            <span>Будут отображены данные за выбранный период, начиная с даты первой сделки портфеля.</span>
                        </v-tooltip>
                    </v-layout>
                </template>
            </base-portfolio-page>
        </div>
    `,
    components: {BasePortfolioPage}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
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
    /** Текущий объект с данными */
    private overview: Overview = null;
    /** Доступные периоды */
    private periods: Period[] = [];
    /** Выбранный период */
    private selectedPeriod: Period = null;
    /** Текущий остаток денег в портфеле */
    private currentMoneyRemainder: string = null;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.overview = this.portfolio.overview;
        await this.loadPortfolioLineChart();
        await this.getCurrentMoneyRemainder();
        const firstTradeYear = DateUtils.getYearDate(this.overview.firstTradeDate);
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
            await this.reloadPortfolio(this.portfolio.id);
            await this.loadPortfolioData();
        });
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadPortfolioData();
    }

    private async loadPortfolioData(): Promise<void> {
        this.lineChartData = null;
        this.lineChartEvents = null;
        this.overview = this.portfolio.overview;
        await this.loadPortfolioLineChart();
        await this.getCurrentMoneyRemainder();
    }

    /**
     * Загружает текущие остатки по деньгам
     */
    @ShowProgress
    private async getCurrentMoneyRemainder(): Promise<void> {
        this.currentMoneyRemainder = await this.overviewService.getCurrentMoney(Number(this.portfolio.id));
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            this.portfolioLineChartData = await this.overviewService.getCostChart(this.portfolio.id);
            this.lineChartData = this.portfolioLineChartData.lineChartData;
            // TODO сделать независимую загрузку по признаку в localStorage
            if (this.portfolio.overview.firstTradeDate) {
                this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.portfolio.overview.firstTradeDate).format("DD.MM.YYYY"));
            }
            this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
        }
    }

    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }

    @ShowProgress
    private async onPeriodChange(): Promise<void> {
        await this.loadOverview(this.selectedPeriod.code);
    }

    private async loadOverview(period: string): Promise<void> {
        this.overview = await this.overviewService.getPortfolioOverviewByPeriod(this.portfolio.id, period);
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }
}

export interface Period {
    code: string;
    description: string;
}
