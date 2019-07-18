import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {EmptyPortfolioStub} from "../components/emptyPortfolioStub";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup, LineChartItem} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {Portfolio} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="portfolio" class="h100pc">
            <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
            <base-portfolio-page v-else :overview="portfolio.overview" :portfolio-name="portfolio.portfolioParams.name"
                                 :portfolio-id="String(portfolio.portfolioParams.id)"
                                 :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :index-line-chart-data="indexLineChartData"
                                 :view-currency="portfolio.portfolioParams.viewCurrency"
                                 :state-key-prefix="StoreKeys.PORTFOLIO_CHART" :side-bar-opened="sideBarOpened" :share-notes="portfolio.portfolioParams.shareNotes"
                                 :isProfessionalMode="portfolio.portfolioParams.professionalMode"
                                 @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable>
            </base-portfolio-page>
        </div>
    `,
    components: {BasePortfolioPage, EmptyPortfolioStub}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private exportService: ExportService;
    /** Данные графика стоимости портфеля */
    private lineChartData: LineChartItem[] = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** События для графика стоимости портфеля */
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadPortfolioLineChart();
        console.log(this.portfolio);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.lineChartData = null;
        this.lineChartEvents = null;
        await this.loadPortfolioLineChart();
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            this.lineChartData = await this.overviewService.getCostChart(this.portfolio.id);
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

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }
}
