import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../../app/ui";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {AdviceService, AdviceUnicCode} from "../../services/adviceService";
import {ClientInfo, ClientService} from "../../services/clientService";
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
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Рекомендации</div>
                </v-card-title>
            </v-card>
            <v-card flat class="pa-0">
                <choose-risk v-if="!activePreloader && !isAnalys" @setRiskLevel="setRiskLevel"
                             @analysisPortfolio="analysisPortfolio" :currentRiskLevel="currentRiskLevel"></choose-risk>
                <preloader v-if="activePreloader"></preloader>
                <analysis-result v-if="!activePreloader && isAnalys && advicesUnicCode.length !== 0"
                                 @goToChooseRiskType="goToChooseRiskType" :advicesUnicCode="advicesUnicCode"></analysis-result>
                <empty-advice v-if="!activePreloader && isAnalys && advicesUnicCode.length === 0"></empty-advice>
            </v-card>
        </v-container>
    `,
    components: {ChooseRisk, Preloader, AnalysisResult, EmptyAdvice}
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

    private currentRiskLevel: string = null;

    private activePreloader: boolean = false;

    private isAnalys: boolean = false;

    private advicesUnicCode: AdviceUnicCode[] = [];

    async created(): Promise<void> {
        this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase() || RiskType.LOW.code;
    }

    @Watch("portfolio")
    private onPortfolioChange(): void {
        if (this.isAnalys) {
            this.analysisPortfolio();
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
        setTimeout(async () => {
            await this.reloadUser();
            this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase() || RiskType.LOW.code;
        }, 1000);
    }
}
