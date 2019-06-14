import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo} from "../../services/clientService";
import {PortfolioService} from "../../services/portfolioService";
import {StoreType} from "../../vuex/storeType";
import {AnalysisResult} from "./analysisResult";
import {EmptyAdvice} from "./emptyAdvice";
import {ChooseRisk} from "./chooseRisk";
import {Preloader} from "./preloader";
import {Portfolio} from "../../types/types";
import {RiskType} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Советчик</div>
                </v-card-title>
            </v-card>
            <v-card flat class="pa-0">
                <choose-risk v-if="!activePreloader && !isAnalys" @setRiskLevel="setRiskLevel"
                             @analysisPortfolio="analysisPortfolio" :currentRiskLevel="currentRiskLevel"></choose-risk>
                <preloader v-if="activePreloader"></preloader>
                <analysis-result v-if="!activePreloader && isAnalys" @goToChooseRiskType="goToChooseRiskType"></analysis-result>
                <!-- <empty-advice></empty-advice> -->
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
    private portfolioService: PortfolioService;

    private currentRiskLevel: string = null;

    private activePreloader: boolean = false;

    private isAnalys: boolean = false;

    async created(): Promise<void> {
        this.currentRiskLevel = this.clientInfo.user.riskLevel.toLowerCase() || RiskType.LOWER.code;
        console.log(await this.portfolioService.getAdvice(this.portfolio.id.toString()));
    }

    private async analysisPortfolio(riskType: any): Promise<void> {

        this.activePreloader = true;
        this.isAnalys = true;
    }

    private async goToChooseRiskType(): Promise<void> {
        const result = await new ConfirmDialog().show(`Перейти к настройкам выбора степени риска?`);
        if (result === BtnReturn.YES) {
            this.activePreloader = false;
            this.isAnalys = false;
        }
    }

    private async setRiskLevel(riskLevel: string): Promise<void> {
        await this.portfolioService.setRiskLevel(riskLevel);
        await this.reloadUser();
    }

}
