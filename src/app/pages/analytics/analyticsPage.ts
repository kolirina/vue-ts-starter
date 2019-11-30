import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYieldChart} from "../../components/charts/averageAnnualYield";
import {SimpleLineChart} from "../../components/charts/simpleLineChart";
import {RebalancingComponent} from "../../components/rebalancingComponent";
import {Storage} from "../../platform/services/storage";
import {AdviceService} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
import {PortfolioAccountType, PortfolioService} from "../../services/portfolioService";
import {BigMoney} from "../../types/bigMoney";
import {SimpleChartData, YieldCompareData} from "../../types/charts/types";
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
            <expanded-panel :value="$uistate.adviserDiagramPanel" :withMenu="false" :state="$uistate.ADVISER_DIAGRAM_PANEL">
                <template #header>Аналитическая сводка по портфелю</template>
                <v-layout wrap class="adviser-diagram-section mt-3">
                    <v-flex xs12 sm12 md12 lg6 class="pr-2 left-section">
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

            <rebalancing-component v-show="false"></rebalancing-component>

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
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice, AverageAnnualYieldChart, SimpleLineChart, RebalancingComponent}
})
export class AnalyticsPage extends UI {

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

    private yieldCompareData: YieldCompareData = null;

    private monthlyInflationData: SimpleChartData = null;

    private depositRatesData: SimpleChartData = null;

    private totalDepositInCurrentYear: BigMoney = null;

    async created(): Promise<void> {
        await this.loadDiagramData();
        await this.loadTotalDepositInCurrentYear();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDiagramData();
        await this.loadTotalDepositInCurrentYear();
    }

    private async loadDiagramData(): Promise<void> {
        this.yieldCompareData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = ChartUtils.makeSimpleChartData(await this.analyticsService.getInflationForLastSixMonths());
        this.depositRatesData = ChartUtils.makeSimpleChartData(await this.analyticsService.getRatesForLastSixMonths());
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

    private get getCurrentYearRemainder(): number {
        if (!this.totalDepositInCurrentYear) {
            return null;
        }
        return new Decimal("1000000").minus(this.totalDepositInCurrentYear.amount).toDP(2).toNumber();
    }

    private async loadTotalDepositInCurrentYear(): Promise<void> {
        this.totalDepositInCurrentYear = await this.portfolioService.totalDepositInCurrentYear(this.portfolio.id);
    }
}
