import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYieldChart} from "../../components/charts/averageAnnualYield";
import {SimpleLineChart} from "../../components/charts/simpleLineChart";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {Storage} from "../../platform/services/storage";
import {AdviceService, AdviceUnicCode} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
import {SimpleChartData, YieldCompareData} from "../../types/charts/types";
import {EventType} from "../../types/eventType";
import {Portfolio, RiskType} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
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
                <template #header>Аналитика</template>
                <v-card v-if="hasTrades" flat class="pa-0">
                    <choose-risk v-if="!activePreloader && !isAnalys" @setRiskLevel="setRiskLevel"
                                 @analysisPortfolio="analysisPortfolio" :currentRiskLevel="currentRiskLevel"></choose-risk>
                    <preloader v-if="activePreloader"></preloader>
                    <analysis-result v-if="!activePreloader && isAnalys && advicesUnicCode.length !== 0"
                                     @goToChooseRiskType="goToChooseRiskType" :advicesUnicCode="advicesUnicCode"></analysis-result>
                    <empty-advice v-if="!activePreloader && isAnalys && advicesUnicCode.length === 0" @goToChooseRiskType="goToChooseRiskType"></empty-advice>
                </v-card>
                <v-card v-if="!hasTrades" flat class="py-5">
                    <div class="alignC fs16">
                        В вашем портфеле не обнаружено сделок для анализа
                    </div>
                </v-card>
            </expanded-panel>
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
                        <v-flex v-if="depositeRatesData" class="mt-3 pa-2">
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
                            <simple-line-chart :data="depositeRatesData" :tooltip="'Ставка по депозитам за'"></simple-line-chart>
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

    private currentRiskLevel: string = null;

    private activePreloader: boolean = false;

    private isAnalys: boolean = false;

    private advicesUnicCode: AdviceUnicCode[] = [];

    private yieldCompareData: YieldCompareData = null;

    private monthlyInflationData: SimpleChartData = null;

    private depositeRatesData: SimpleChartData = null;

    async created(): Promise<void> {
        if (this.clientInfo.user.riskLevel) {
            this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase();
            await this.analysisPortfolio();
        } else {
            this.currentRiskLevel = RiskType.LOW.code;
        }
        await this.loadDiagramData();
        UI.on(EventType.TRADE_CREATED, async () => await this.analysisPortfolio());
        UI.on(EventType.TRADE_UPDATED, async () => await this.analysisPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
        UI.off(EventType.TRADE_UPDATED);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        if (this.isAnalys) {
            await this.analysisPortfolio();
        }
        await this.loadDiagramData();
    }

    private async loadDiagramData(): Promise<void> {
        this.yieldCompareData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = ChartUtils.makeSimpleChartData(await this.analyticsService.getInflationForLastSixMonths());
        // TODO удалить после выкатки исправления дат на прод
        const data = await this.analyticsService.getRatesForLastSixMonths();
        data.forEach(item => {
            const timeZoneIndex = item.date.indexOf("T");
            if (timeZoneIndex !== -1) {
                const date = DateUtils.parseDate(item.date.substring(0, timeZoneIndex));
                item.date = DateUtils.formatDate(date.add(1, "day"), DateFormat.DATE2);
            }
        });
        this.depositeRatesData = ChartUtils.makeSimpleChartData(data);
        // this.depositeRatesData = ChartUtils.makeSimpleChartData(await this.analyticsService.getRatesForLastSixMonths());
    }

    private async analysisPortfolio(): Promise<void> {
        this.activePreloader = true;
        this.isAnalys = true;
        const start = new Date().getTime();
        if (!this.clientInfo.user.riskLevel) {
            await this.setRiskLevel(this.currentRiskLevel);
        }
        this.advicesUnicCode = await this.adviceService.loadAdvices(this.portfolio.id.toString());
        const end = new Date().getTime();
        if (end - start >= 5000) {
            this.activePreloader = false;
        } else {
            setTimeout(() => {
                this.activePreloader = false;
            }, 1000 - (end - start));
        }
    }

    private async goToChooseRiskType(): Promise<void> {
        const result = await new ConfirmDialog().show(`Перейти к настройкам выбора степени риска?`);
        if (result === BtnReturn.YES) {
            this.activePreloader = false;
            this.isAnalys = false;
        }
    }

    private async setRiskLevel(riskLevel: string): Promise<void> {
        await this.adviceService.setRiskLevel(riskLevel.toUpperCase());
        this.clientService.resetClientInfo();
        await this.reloadUser();
        this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase() || RiskType.LOW.code;
    }

    private get hasTrades(): boolean {
        return this.portfolio.overview.totalTradesCount > 0;
    }
}
