import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup} from "../types/charts/types";
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
        <base-portfolio-page v-if="portfolio" :overview="portfolio.overview" :portfolio-name="portfolio.portfolioParams.name" :portfolio-id="portfolio.portfolioParams.id"
                             :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :view-currency="portfolio.portfolioParams.viewCurrency"
                             :state-key-prefix="StoreKeys.PORTFOLIO_CHART"
                             @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable>
            <template #afterDashboard>
                <v-alert v-if="isEmptyBlockShowed" :value="true" type="info" outline>
                    Для начала работы заполните свой портфель. Вы можете
                    <router-link to="/import">загрузить отчет</router-link>
                    со сделками вашего брокера или просто
                    <router-link to="/balances">указать остатки</router-link>
                    портфеля, если знаете цену или стоимость покупки бумаг
                </v-alert>
            </template>
        </base-portfolio-page>
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
        this.lineChartData = null;
        this.lineChartEvents = null;
        await this.loadPortfolioLineChart();
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            this.lineChartData = await this.overviewService.getCostChart(this.portfolio.id);
            this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
        }
    }

    @ShowProgress
    private async onExportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.stockPortfolio.rows.length === 0 && this.portfolio.overview.bondPortfolio.rows.length === 0;
    }
}
