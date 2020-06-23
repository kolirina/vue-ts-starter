import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYieldChart} from "../../components/charts/averageAnnualYield";
import {ColumnChart} from "../../components/charts/columnChart";
import {PieChart} from "../../components/charts/pieChart";
import {ProfitLineChart} from "../../components/charts/profitLineChart";
import {SimpleLineChart} from "../../components/charts/simpleLineChart";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Filters} from "../../platform/filters/Filters";
import {Storage} from "../../platform/services/storage";
import {AdviceService} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
import {MarketHistoryService} from "../../services/marketHistoryService";
import {OverviewService} from "../../services/overviewService";
import {PortfolioAccountType, PortfolioService} from "../../services/portfolioService";
import {BigMoney} from "../../types/bigMoney";
import {ChartType, ColumnChartData, CustomDataPoint, HighStockEventsGroup, PortfolioLineChartData, SimpleChartData, YieldCompareData} from "../../types/charts/types";
import {EventType} from "../../types/eventType";
import {Portfolio} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
import {CommonUtils} from "../../utils/commonUtils";
import {UiStateHelper} from "../../utils/uiStateHelper";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {AnalysisResult} from "./analysisResult";
import {ChooseRisk} from "./chooseRisk";
import {EmptyAdvice} from "./emptyAdvice";
import {Preloader} from "./preloader";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container class="adviser-wrap">
            <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
            <expanded-panel v-show="showAnalyticsPanel" :value="$uistate.adviserDiagramPanel" :with-menu="false" :state="$uistate.ADVISER_DIAGRAM_PANEL">
                <template #header>Аналитическая сводка по портфелю</template>
                <v-layout wrap class="adviser-diagram-section mt-3">
                    <v-flex xs12 sm12 md12 lg6 class="pr-2 left-section profitability-diagram">
                        <v-flex v-if="yieldCompareData" class="margT30 pa-2">
                            <v-layout class="item-header">
                                <span class="fs13">Сравнение среднегодовой доходности</span>
                                <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                    <template #activator="{ on }">
                                        <v-icon v-on="on" class="ml-2">far fa-question-circle</v-icon>
                                    </template>
                                    <span>
                                        Сравнение доходности портфеля с доходностью Индекса MOEX, инфляцией и
                                        ставкой по депозиту рассчитаными за период с даты первой сделки по текущий день
                                        в процентах годовых.
                                    </span>
                                </v-tooltip>
                            </v-layout>
                            <average-annual-yield-chart :data="yieldCompareData"></average-annual-yield-chart>
                        </v-flex>
                    </v-flex>
                    <v-flex xs12 sm12 md12 lg6 class="pl-2 right-section">
                        <v-flex v-if="monthlyInflationData" class="margT30 pa-2">
                            <v-layout class="item-header" align-center>
                                <span class="fs13">Инфляция по месяцам</span>
                                <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                    <template #activator="{ on }">
                                        <v-icon v-on="on" class="ml-2">far fa-question-circle</v-icon>
                                    </template>
                                    <span>
                                        Официальная инфляция по данным открытых источников.
                                    </span>
                                </v-tooltip>
                            </v-layout>
                            <simple-line-chart :data="monthlyInflationData" :tooltip="'Инфляция за'"></simple-line-chart>
                        </v-flex>
                        <v-flex v-if="depositRatesData" class="mt-3 pa-2">
                            <v-layout class="item-header">
                                <span class="fs13">Ставки по депозитам</span>
                                <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                    <template #activator="{ on }">
                                        <v-icon v-on="on" class="ml-2">far fa-question-circle</v-icon>
                                    </template>
                                    <span>
                                        Информация по ставкам депозитов официальная с ЦБ РФ.
                                    </span>
                                </v-tooltip>
                            </v-layout>
                            <simple-line-chart :data="depositRatesData" :tooltip="'Ставка по депозитам за'"></simple-line-chart>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </expanded-panel>

            <expanded-panel v-if="showProfitChart" :value="$uistate.profitChartPanel"
                            :state="$uistate.PROFIT_CHART_PANEL" @click="onProfitPanelStateChange" customMenu class="mt-3"
                            :data-v-step="0">
                <template #header>
                    Прибыль портфеля
                    <tooltip>
                        График изменения прибыли портфеля<br/>
                        Можно отобразить как Суммарную прибыль, так и<br/>
                        Курсовую, По сделкам, От начислений
                    </tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu v-if="portfolioLineChartData && profitLineChartEvents" @print="print(ChartType.PROFIT_LINE_CHART)"
                                       @exportTo="exportTo(ChartType.PROFIT_LINE_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>

                <v-card-text class="px-1">
                    <profit-line-chart v-if="portfolioLineChartData && profitLineChartEvents" :ref="ChartType.PROFIT_LINE_CHART" :data="portfolioLineChartData.lineChartData"
                                       :moex-index-data="indexLineChartData" state-key-prefix="ANALYTICS"
                                       :events-chart-data="profitLineChartEvents" :balloon-title="portfolio.portfolioParams.name"></profit-line-chart>
                    <v-container v-else grid-list-md text-xs-center>
                        <v-layout row wrap>
                            <v-flex xs12>
                                <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-if="profitByMonthsChartData && profitByMonthsChartData.categoryNames.length" :value="$uistate.profitMonthChartPanel"
                            :state="$uistate.PROFIT_MONTH_CHART_PANEL" @click="onProfitPanelStateChange" custom-menu class="mt-3">
                <template #header>
                    Прибыль по месяцам
                    <tooltip>
                        Диаграмма, показывающая прибыль портфеля по месяцам<br/>
                        Процент изменения считается по отношению к предыдущему периоду
                    </tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu @print="print(ChartType.PROFIT_MONTH_CHART)" @exportTo="exportTo(ChartType.PROFIT_MONTH_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>
                <v-card-text>
                    <column-chart :ref="ChartType.PROFIT_MONTH_CHART" :data="profitByMonthsChartData" :view-currency="viewCurrency"
                                  tooltip-format="YIELDS" v-tariff-expired-hint></column-chart>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-if="profitByYearsChartData && profitByYearsChartData.categoryNames.length" :value="$uistate.profitYearChartPanel"
                            :state="$uistate.PROFIT_YEAR_CHART_PANEL" @click="onProfitPanelStateChange" custom-menu class="mt-3">
                <template #header>
                    Прибыль по годам
                    <tooltip>
                        Диаграмма, показывающая прибыль портфеля по годам<br/>
                        Процент изменения считается по отношению к предыдущему периоду
                    </tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu @print="print(ChartType.PROFIT_YEAR_CHART)" @exportTo="exportTo(ChartType.PROFIT_YEAR_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>
                <v-card-text>
                    <column-chart :ref="ChartType.PROFIT_YEAR_CHART" :data="profitByYearsChartData" :view-currency="viewCurrency"
                                  tooltip-format="YIELDS" v-tariff-expired-hint></column-chart>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-if="yieldContributorsChartData && yieldContributorsChartData.categoryNames.length" :value="$uistate.yieldContributorsChart"
                            :state="$uistate.YIELD_CONTRIBUTORS_CHART_PANEL" custom-menu class="mt-3">
                <template #header>
                    Эффективность бумаг в портфеле
                    <tooltip>
                        Диаграмма бумаг, оказавших максимальный эффект на доходность портфеля
                    </tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu @print="print(ChartType.YIELD_CONTRIBUTORS_CHART)" @exportTo="exportTo(ChartType.YIELD_CONTRIBUTORS_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>
                <v-card-text>
                    <bar-chart :ref="ChartType.YIELD_CONTRIBUTORS_CHART" :data="yieldContributorsChartData" :view-currency="viewCurrency"
                               tooltip-format="YIELDS" v-tariff-expired-hint></bar-chart>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-if="wholePortfolioSharesAllocationChartData.length" :value="$uistate.wholePortfolioSharesAllocationChart"
                            :state="$uistate.WHOLE_PORTFOLIO_SHARES_ALLOCATION_CHART_PANEL"
                            custom-menu class="mt-3">
                <template #header>
                    Распределение всех активов в портфеле
                    <tooltip>
                        Диаграмма сквозного распределения всех ваших активов, включая денежные средства, в портфеле
                    </tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu @print="print(ChartType.WHOLE_PORTFOLIO_SHARES_ALLOCATION_CHART)"
                                       @exportTo="exportTo(ChartType.WHOLE_PORTFOLIO_SHARES_ALLOCATION_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>
                <v-card-text>
                    <pie-chart :ref="ChartType.WHOLE_PORTFOLIO_SHARES_ALLOCATION_CHART" :data="wholePortfolioSharesAllocationChartData" :view-currency="viewCurrency"
                               balloon-title="Распределение всех активов в портфеле" tooltip-format="YIELDS" v-tariff-expired-hint></pie-chart>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-show="showInfoPanel && false" :value="$uistate.analyticsInfoPanel" :withMenu="false" :state="$uistate.ANALYTICS_INFO_PANEL" class="mt-3">
                <template #header>Информация об ИИС</template>

                <v-layout v-if="showInfoPanel" wrap class="adviser-diagram-section mt-3">
                    <v-flex xs12 sm12 md12 lg6 class="pr-2 left-section">
                        <v-layout wrap align-center justify-center row fill-height>
                            <v-flex class="pa-4">
                                <v-progress-circular :rotate="-90" :size="100" :width="15" :value="currentYearPercent" color="primary">
                                    <span>{{ currentYearPercent + '%'}}</span>
                                </v-progress-circular>

                                <span class="ml-2">
                                    <span>Внесения на ИИС</span>
                                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                        <sup class="custom-tooltip" slot="activator">
                                            <v-icon>fas fa-info-circle</v-icon>
                                        </sup>
                                        <span>
                                            <div>
                                                Сумма внесенных на ИИС денежных средств с начала года:
                                                {{ totalDepositInCurrentYear.amount | number }} ₽
                                            </div>
                                            <div>Остаток для внесения на ИИС: {{ getCurrentYearRemainder | number }} ₽</div>
                                        </span>
                                    </v-tooltip>
                                </span>
                            </v-flex>
                        </v-layout>
                    </v-flex>

                    <v-flex xs12 sm12 md12 lg6 class="pl-2 right-section">
                        <v-layout wrap align-center justify-center row fill-height>
                            <v-flex style="padding: 62px">
                                <span>Здесь будет что-то интересное</span>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                </v-layout>
            </expanded-panel>
        </v-container>
    `,
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice, AverageAnnualYieldChart, ProfitLineChart, SimpleLineChart}
})
export class AnalyticsPage extends UI {

    $refs: {
        yieldContributorsChart: PieChart,
        profitLineChart: ProfitLineChart,
        profitMonthChart: ColumnChart,
        profitYearChart: ColumnChart,
    };

    @Inject
    private localStorage: Storage;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_CLIENT_INFO)
    private reloadUser: () => Promise<void>;
    @Inject
    private adviceService: AdviceService;
    @Inject
    private clientService: ClientService;
    @Inject
    private analyticsService: AnalyticsService;
    @Inject
    private portfolioService: PortfolioService;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private marketHistoryService: MarketHistoryService;
    /** Данные для сравнения доходностей */
    private yieldCompareData: YieldCompareData = null;
    /** Ставки по инфляции */
    private monthlyInflationData: SimpleChartData = null;
    /** Ставки по депозитам */
    private depositRatesData: SimpleChartData = null;
    /** Всего внесений в текущем году */
    private totalDepositInCurrentYear: BigMoney = null;
    /** Данные для диаграммы эффективности бумаг */
    private yieldContributorsChartData: ColumnChartData = null;
    /** Данные для диаграммы прибыль по месяцам */
    private profitByMonthsChartData: ColumnChartData = null;
    /** Данные для диаграммы прибыль по годам */
    private profitByYearsChartData: ColumnChartData = null;
    /** Данные для диаграммы эффективности бумаг */
    private wholePortfolioSharesAllocationChartData: CustomDataPoint[] = [];
    /** Данные графика портфеля */
    private portfolioLineChartData: PortfolioLineChartData = null;
    /** События для графика прибыли портфеля */
    private profitLineChartEvents: HighStockEventsGroup[] = null;
    /** Данные стоимости индекса ММВБ */
    private indexLineChartData: any[] = null;
    /** Типы круговых диаграмм */
    private ChartType = ChartType;

    async created(): Promise<void> {
        await this.init();
        UI.on(EventType.TRADE_CREATED, async () => await this.init());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.portfolioLineChartData = null;
        await this.init();
    }

    @ShowProgress
    private async init(): Promise<void> {
        await this.loadDiagramData();
        await this.loadTotalDepositInCurrentYear();
        if (this.showProfitChart && (UiStateHelper.profitChartPanel[0] === 1 || UiStateHelper.profitMonthChartPanel[0] === 1 || UiStateHelper.profitYearChartPanel[0] === 1)) {
            await this.loadProfitLineChart();
        }
        this.yieldContributorsChartData = await this.doYieldContributorsChartData();
        this.wholePortfolioSharesAllocationChartData = await this.doWholePortfolioSharesAllocationChartData();
    }

    private async loadDiagramData(): Promise<void> {
        this.yieldCompareData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = ChartUtils.makeSimpleChartData(await this.analyticsService.getInflationForLastSixMonths());
        this.depositRatesData = ChartUtils.makeSimpleChartData(await this.analyticsService.getRatesForLastSixMonths());
    }

    private async onProfitPanelStateChange(): Promise<void> {
        if (UiStateHelper.profitChartPanel[0] === 1 || UiStateHelper.profitMonthChartPanel[0] === 1 || UiStateHelper.profitYearChartPanel[0] === 1) {
            await this.loadProfitLineChart();
        }
    }

    private async loadProfitLineChart(): Promise<void> {
        if (!this.portfolioLineChartData) {
            this.portfolioLineChartData = await this.overviewService.getCostChart(this.portfolio.id);
        }
        // TODO сделать независимую загрузку по признаку в localStorage
        if (this.portfolio.overview.firstTradeDate && !this.indexLineChartData) {
            this.indexLineChartData = await this.marketHistoryService.getIndexHistory("MMVB", dayjs(this.portfolio.overview.firstTradeDate).format("DD.MM.YYYY"));
        }
        if (!CommonUtils.exists(this.profitLineChartEvents)) {
            this.profitLineChartEvents = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
            this.profitLineChartEvents.forEach(item => item.onSeries = "totalProfit");
        }
        this.profitByMonthsChartData = await this.doPortfolioProfitMonthData();
        this.profitByYearsChartData = await this.doPortfolioProfitYearData();
    }

    private get viewCurrency(): string {
        return Filters.currencySymbolByCurrency(this.portfolio.portfolioParams.viewCurrency);
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }

    private get showInfoPanel(): boolean {
        return this.portfolio.portfolioParams.accountType === PortfolioAccountType.IIS && this.totalDepositInCurrentYear && this.totalDepositInCurrentYear?.amount.isPositive();
    }

    private get currentYearPercent(): number {
        if (!this.totalDepositInCurrentYear) {
            return null;
        }
        return this.totalDepositInCurrentYear.amount.div(new Decimal("10000")).toDP(2, Decimal.ROUND_HALF_UP).toNumber();
    }

    private doYieldContributorsChartData(): ColumnChartData {
        return ChartUtils.doYieldContributorsPieChartData(this.portfolio.overview, this.viewCurrency);
    }

    private doWholePortfolioSharesAllocationChartData(): CustomDataPoint[] {
        return ChartUtils.doWholePortfolioSharesAllocationChartData(this.portfolio.overview, this.viewCurrency);
    }

    private doPortfolioProfitMonthData(): ColumnChartData {
        return ChartUtils.doPortfolioProfitData(this.portfolioLineChartData.pointsByMonth);
    }

    private doPortfolioProfitYearData(): ColumnChartData {
        return ChartUtils.doPortfolioProfitData(this.portfolioLineChartData.pointsByYear, false);
    }

    private get getCurrentYearRemainder(): number {
        if (!this.totalDepositInCurrentYear) {
            return null;
        }
        return new Decimal("1000000").minus(this.totalDepositInCurrentYear.amount).toDP(2).toNumber();
    }

    private async loadTotalDepositInCurrentYear(): Promise<void> {
        this.totalDepositInCurrentYear = await this.portfolioService.totalDepositInCurrentYear(this.portfolio.id);
    }

    private async exportTo(chart: ChartType, type: string): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.exportChart({type: ChartUtils.EXPORT_TYPES[type], filename: "Эффективность бумаг в портфеле"});
    }

    private async print(chart: ChartType): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.print();
    }

    private get showAnalyticsPanel(): boolean {
        return Math.abs(dayjs(this.portfolio.overview.firstTradeDate).diff(dayjs(), "day")) > 365;
    }

    private get showProfitChart(): boolean {
        return this.portfolio.overview.bondPortfolio.rows.length !== 0 || this.portfolio.overview.stockPortfolio.rows.length !== 0 ||
            this.portfolio.overview.assetPortfolio.rows.length !== 0 || this.portfolio.overview.etfPortfolio.rows.length !== 0;
    }
}
