import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {AverageAnnualYield} from "../../components/charts/averageAnnualYield";
import {MonthlyInflationChart} from "../../components/charts/monthlyInflationChart";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {AdviceService, AdviceUnicCode} from "../../services/adviceService";
import {AnalyticsService} from "../../services/analyticsService";
import {ClientInfo, ClientService} from "../../services/clientService";
import {EventType} from "../../types/eventType";
import {Portfolio, RiskType} from "../../types/types";
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
                <v-card-title @click="isShowAnalytics = !isShowAnalytics" class="header-first-card__wrapper-title">
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
                <v-card-title @click="isShowPortfolioSummary = !isShowPortfolioSummary" class="header-first-card__wrapper-title">
                    <v-layout justify-space-between align-center class="pointer-cursor pr-3">
                        <div class="section-title header-first-card__title-text">Аналитическая сводка по портфелю</div>
                        <v-icon :class="['', isShowPortfolioSummary ? 'rotate-icons' : '']" >keyboard_arrow_right</v-icon>
                    </v-layout>
                </v-card-title>
            </v-card>
            <v-card v-if="isShowPortfolioSummary && averageAnnualYieldData" flat class="pa-4">
                <average-annual-yield :data="averageAnnualYieldData"></average-annual-yield>
            </v-card>
            <v-card v-if="isShowPortfolioSummary && monthlyInflationData"  flat>
                <monthly-inflation-chart :data="monthlyInflationData"></monthly-inflation-chart>
            </v-card>
        </v-container>
    `,
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice, AverageAnnualYield, MonthlyInflationChart}
})
export class AdviserPage extends UI {

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

    private isShowPortfolioSummary: boolean = true;

    private averageAnnualYieldData: any = null;

    private monthlyInflationData: any = null;

    async created(): Promise<void> {
        if (this.clientInfo.user.riskLevel) {
            this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase();
            await this.analysisPortfolio();
        } else {
            this.currentRiskLevel = RiskType.LOW.code;
        }
        UI.on(EventType.TRADE_CREATED, async () => await this.analysisPortfolio());
        UI.on(EventType.TRADE_UPDATED, async () => await this.analysisPortfolio());
        this.averageAnnualYieldData = await this.analyticsService.getComparedYields(this.portfolio.id.toString());
        this.monthlyInflationData = await this.analyticsService.getInflationForLastSixMonths();
        const res = await this.analyticsService.getInflationForLastSixMonths();
        console.log(this.monthlyInflationData);
        console.log(res);
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
}
