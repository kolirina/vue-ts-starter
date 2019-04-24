/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */
import {Inject} from "typescript-ioc";
import {Component, UI, Watch} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ExportService, ExportType} from "../../services/exportService";
import {OverviewService} from "../../services/overviewService";
import {HighStockEventsGroup} from "../../types/charts/types";
import {StoreKeys} from "../../types/storeKeys";
import {Portfolio} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {UiStateHelper} from "../../utils/uiStateHelper";
import {BasePortfolioPage} from "../basePortfolioPage";

@Component({
    // language=Vue
    template: `
        <base-portfolio-page v-if="portfolio" :overview="portfolio.overview" :portfolio-name="portfolio.portfolioParams.name" :portfolio-id="String(portfolio.portfolioParams.id)"
                             :line-chart-data="lineChartData" :line-chart-events="lineChartEvents" :view-currency="portfolio.portfolioParams.viewCurrency"
                             :state-key-prefix="StoreKeys.PORTFOLIO_CHART"
                             @reloadLineChart="loadPortfolioLineChart" @exportTable="onExportTable" exportable public-zone side-bar-opened>
            <template #afterDashboard>
                <v-alert v-if="isEmptyBlockShowed" :value="true" type="info" outline>
                    Для начала работы заполните свой портфель. Вы можете
                    <router-link to="/settings/import">загрузить отчет</router-link>
                    со сделками вашего брокера или просто
                    <router-link to="/balances">указать остатки</router-link>
                    портфеля, если знаете цену или стоимость покупки бумаг
                </v-alert>
            </template>
        </base-portfolio-page>
    `,
    components: {BasePortfolioPage}
})
export class PublicPortfolioPage extends UI {

    private portfolio: Portfolio = null;
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
    @ShowProgress
    async created(): Promise<void> {
        const portfolioId = Number(this.$route.params.id);
        this.portfolio = await this.overviewService.getById(portfolioId, true);
        await this.loadPortfolioLineChart();
    }

    @Watch("$route.params.id")
    private async onPortfolioChange(): Promise<void> {
        this.lineChartData = null;
        this.lineChartEvents = null;
        await this.loadPortfolioLineChart();
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        if (UiStateHelper.historyPanel[0] === 1 && !CommonUtils.exists(this.lineChartData) && !CommonUtils.exists(this.lineChartEvents)) {
            this.lineChartData = await this.overviewService.getCostChart(this.portfolio.id, true);
            this.lineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id, true);
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
