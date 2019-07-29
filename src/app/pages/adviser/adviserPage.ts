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
import {AdviserSchedule, YieldCompareData} from "../../types/charts/types";
import {EventType} from "../../types/eventType";
import {StoreKeys} from "../../types/storeKeys";
import {Portfolio, RiskType} from "../../types/types";
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
        <v-container>
            <v-card flat class="header-first-card">
                <v-card-title @click="toggleAnalyticsBlock" class="header-first-card__wrapper-title">
                    <v-layout justify-space-between align-center class="pointer-cursor pr-3">
                        <div class="section-title header-first-card__title-text">Аналитика</div>
                        <v-icon :class="['', isShowAnalytics ? 'rotate-icons' : '']" >keyboard_arrow_right</v-icon>
                    </v-layout>
                </v-card-title>
            </v-card>
            <v-card v-if="tradesCount && isShowAnalytics" flat class="pa-0">
                <choose-risk v-if="!activePreloader && !isAnalys" @setRiskLevel="setRiskLevel"
                             @analysisPortfolio="analysisPortfolio" :currentRiskLevel="currentRiskLevel"></choose-risk>
                <preloader v-if="activePreloader"></preloader>
                <analysis-result v-if="!activePreloader && isAnalys && advicesUnicCode.length !== 0"
                                 @goToChooseRiskType="goToChooseRiskType" :advicesUnicCode="advicesUnicCode"></analysis-result>
                <empty-advice v-if="!activePreloader && isAnalys && advicesUnicCode.length === 0" @goToChooseRiskType="goToChooseRiskType"></empty-advice>
            </v-card>
            <v-card v-if="!tradesCount && isShowAnalytics" flat class="py-5">
                <div class="alignC fs16">
                    В вашем портфеле не обнаружено сделок для анализа
                </div>
            </v-card>
            <v-card flat class="header-first-card margT30">
                <v-card-title @click="toggleDiagramsBlock" class="header-first-card__wrapper-title pb-2">
                    <v-layout justify-space-between align-center class="pointer-cursor pr-3">
                        <div class="section-title header-first-card__title-text">Аналитическая сводка по портфелю</div>
                        <v-icon :class="['', isDiagramsBlockShow ? 'rotate-icons' : '']" >keyboard_arrow_right</v-icon>
                    </v-layout>
                </v-card-title>
            </v-card>
            <v-layout v-if="isDiagramsBlockShow" wrap class="adviser-diagram-section">
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

    private isShowAnalytics: boolean = true;

    private isDiagramsBlockShow: boolean = true;

    private yieldCompareData: YieldCompareData = null;

    private monthlyInflationData: AdviserSchedule = null;

    private depositeRatesData: AdviserSchedule = null;

    async created(): Promise<void> {
        this.isShowAnalytics = this.localStorage.get(StoreKeys.ANALYTICS_STATE_KEY, true);
        this.isDiagramsBlockShow = this.localStorage.get(StoreKeys.DIAGRAM_BLOCK_STATE_KEY, true);
        if (this.clientInfo.user.riskLevel) {
            this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase();
            await this.analysisPortfolio();
        } else {
            this.currentRiskLevel = RiskType.LOW.code;
        }
        const diagramData = {
            monthlyInflationData: await this.analyticsService.getInflationForLastSixMonths(),
            depositeRatesData: await this.analyticsService.getRatesForLastSixMonths()
        };
        this.getYieldCompareData();
        this.monthlyInflationData = ChartUtils.convertInflationData(diagramData.monthlyInflationData);
        this.depositeRatesData = ChartUtils.convertRatesData(diagramData.depositeRatesData);
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
        this.getYieldCompareData();
    }

    private async getYieldCompareData(): Promise<void> {
        const result = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.yieldCompareData = result;
    }

    private async analysisPortfolio(): Promise<void> {
        this.activePreloader = true;
        this.isAnalys = true;
        const start = new Date().getTime();
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

    private get tradesCount(): boolean {
        return this.portfolio.overview.totalTradesCount > 0;
    }

    private toggleAnalyticsBlock(): void {
        this.isShowAnalytics = !this.isShowAnalytics;
        this.localStorage.set(StoreKeys.ANALYTICS_STATE_KEY, this.isShowAnalytics);
    }

    private toggleDiagramsBlock(): void {
        this.isDiagramsBlockShow = !this.isDiagramsBlockShow;
        this.localStorage.set(StoreKeys.DIAGRAM_BLOCK_STATE_KEY, this.isDiagramsBlockShow);
    }
}
