import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {Portfolio} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <base-portfolio-page v-if="portfolio" :overview="portfolio.overview" :portfolio-name="portfolio.portfolioParams.name"
                             :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :view-currency="portfolio.portfolioParams.viewCurrency"
                             :state-key-prefix="StoreKeys.PORTFOLIO_CHART"
                             @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable></base-portfolio-page>
    `,
    components: {BasePortfolioPage}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private exportService: ExportService;
    private lineChartData: any[] = null;
    private lineChartEvents: HighStockEventsGroup[] = null;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadPortfolioLineChart();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadPortfolioLineChart();
    }

    @CatchErrors
    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1) {
            this.lineChartData = await this.overviewService.getCostChart(this.portfolio.id);
            this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
        }
    }

    @CatchErrors
    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }
}
