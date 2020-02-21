import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYieldChart} from "../../components/charts/averageAnnualYield";
import {PieChart} from "../../components/charts/pieChart";
import {SimpleLineChart} from "../../components/charts/simpleLineChart";
import {Filters} from "../../platform/filters/Filters";
import {Storage} from "../../platform/services/storage";
import {AdviceService} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
import {PortfolioAccountType, PortfolioService} from "../../services/portfolioService";
import {BigMoney} from "../../types/bigMoney";
import {ChartType, CustomDataPoint, SimpleChartData, YieldCompareData} from "../../types/charts/types";
import {Portfolio} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
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
            <expanded-panel :value="$uistate.adviserDiagramPanel" :with-menu="false" :state="$uistate.ADVISER_DIAGRAM_PANEL">
                <template #header>Аналитическая сводка по портфелю</template>
                <v-layout wrap class="adviser-diagram-section mt-3">
                    <v-flex xs12 sm12 md12 lg6 class="pr-2 left-section profitability-diagram">
                        <v-flex v-if="yieldCompareData" class="margT30 pa-2">
                            <v-layout class="item-header">
                                <span class="fs13">Сравнение среднегодовой доходности</span>
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

            <expanded-panel v-if="yieldContributorsChartData.length" :value="$uistate.yieldContributorsChart" :state="$uistate.YIELD_CONTRIBUTORS_CHART_PANEL"
                            customMenu class="mt-3">
                <template #header>
                    Эффективность бумаг в портфеле
                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                        <template #activator="{ on }">
                            <v-icon v-on="on" class="fs12 vAlignSuper">far fa-question-circle</v-icon>
                        </template>
                        <span>
                            Диаграмма бумаг, оказавших максимальный эффект на доходность портфеля
                        </span>
                    </v-tooltip>
                </template>
                <template #customMenu>
                    <chart-export-menu @print="print(ChartType.YIELD_CONTRIBUTORS_CHART)" @exportTo="exportTo(ChartType.YIELD_CONTRIBUTORS_CHART, $event)"
                                       class="exp-panel-menu"></chart-export-menu>
                </template>
                <v-card-text>
                    <pie-chart :ref="ChartType.YIELD_CONTRIBUTORS_CHART" :data="yieldContributorsChartData" :view-currency="viewCurrency"
                               balloon-title="Эффективность бумаг в портфеле" tooltip-format="YIELDS" v-tariff-expired-hint></pie-chart>
                </v-card-text>
            </expanded-panel>

            <expanded-panel v-if="showInfoPanel && false" :value="$uistate.analyticsInfoPanel" :withMenu="false" :state="$uistate.ANALYTICS_INFO_PANEL" class="mt-3">
                <template #header>Информация</template>

                <v-layout wrap class="adviser-diagram-section mt-3">
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
                                            <div>Сумма внесенных на ИИС денежных средств с начала года:
                                                {{ totalDepositInCurrentYear.amount | number }} ₽</div>
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
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice, AverageAnnualYieldChart, SimpleLineChart}
})
export class AnalyticsPage extends UI {

    $refs: {
        yieldContributorsChart: PieChart,
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
    /** Данные для сравнения доходностей */
    private yieldCompareData: YieldCompareData = null;
    /** Ставки по инфляции */
    private monthlyInflationData: SimpleChartData = null;
    /** Ставки по депозитам */
    private depositRatesData: SimpleChartData = null;
    /** Всего внесений в текущем году */
    private totalDepositInCurrentYear: BigMoney = null;
    /** Данные для диаграммы эффективности бумаг */
    private yieldContributorsChartData: CustomDataPoint[] = [];
    /** Типы круговых диаграмм */
    private ChartType = ChartType;

    async created(): Promise<void> {
        await this.loadDiagramData();
        await this.loadTotalDepositInCurrentYear();
        this.yieldContributorsChartData = await this.doYieldContributorsChartData();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDiagramData();
        await this.loadTotalDepositInCurrentYear();
        this.yieldContributorsChartData = await this.doYieldContributorsChartData();
    }

    private async loadDiagramData(): Promise<void> {
        this.yieldCompareData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = ChartUtils.makeSimpleChartData(await this.analyticsService.getInflationForLastSixMonths());
        this.depositRatesData = ChartUtils.makeSimpleChartData(await this.analyticsService.getRatesForLastSixMonths());
    }

    private get viewCurrency(): string {
        return Filters.currencySymbolByCurrency(this.portfolio.portfolioParams.viewCurrency);
    }

    private get hasTrades(): boolean {
        return this.portfolio.overview.totalTradesCount > 0;
    }

    private get showInfoPanel(): boolean {
        return this.portfolio.portfolioParams.accountType === PortfolioAccountType.IIS && this.totalDepositInCurrentYear?.amount.isPositive();
    }

    private get currentYearPercent(): number {
        if (!this.totalDepositInCurrentYear) {
            return null;
        }
        return this.totalDepositInCurrentYear.amount.div(new Decimal("10000")).toDP(2, Decimal.ROUND_HALF_UP).toNumber();
    }

    private doYieldContributorsChartData(): CustomDataPoint[] {
        return ChartUtils.doYieldContributorsPieChartData(this.portfolio.overview, this.viewCurrency);
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

}
