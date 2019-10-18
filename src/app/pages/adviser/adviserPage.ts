import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYieldChart} from "../../components/charts/averageAnnualYield";
import {SimpleLineChart} from "../../components/charts/simpleLineChart";
import {Storage} from "../../platform/services/storage";
import {AdviceService} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
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
                                        Информация по ставкам депозитов официальная с ЦБР.
                                    </span>
                                </v-tooltip>
                            </v-layout>
                            <simple-line-chart :data="depositRatesData" :tooltip="'Ставка по депозитам за'"></simple-line-chart>
                        </v-flex>
                    </v-flex>
                </v-layout>
            </expanded-panel>
        </v-container>
    `,
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice, AverageAnnualYieldChart, SimpleLineChart}
})
export class AdviserPage extends UI {

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

    private yieldCompareData: YieldCompareData = null;

    private monthlyInflationData: SimpleChartData = null;

    private depositRatesData: SimpleChartData = null;

    async created(): Promise<void> {
        await this.loadDiagramData();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDiagramData();
    }

    private async loadDiagramData(): Promise<void> {
        this.yieldCompareData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = ChartUtils.makeSimpleChartData(await this.analyticsService.getInflationForLastSixMonths());
        this.depositRatesData = ChartUtils.makeSimpleChartData(await this.analyticsService.getRatesForLastSixMonths());
    }

    private get hasTrades(): boolean {
        return this.portfolio.overview.totalTradesCount > 0;
    }
}
