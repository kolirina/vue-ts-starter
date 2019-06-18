import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, UI, Watch} from "../../app/ui";
import {PortfolioService} from "../../services/portfolioService";
import {RiskType} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-layout class="pa-4" column>
            <div class="fs16">
                Советчик поможет увеличить прибыль в соответствии с Вашим уровнем риска
            </div>
            <v-radio-group v-model="mutableCurrentRiskLevel" row class="choose-risk-wrap" hide-details @change="setRiskLevel">
                <v-layout v-for="item in riskType.values()" :key="item.code" wrap justify-space-around>
                    <v-layout justify-center column class="margT70 maxW275 fs12-non-opacity">
                        <img :src="item.imgSrc" alt="pic">
                        <v-layout justify-center class="mt-3">
                                <v-radio :label="item.title" :value="item.code" class="pl-1"></v-radio>
                        </v-layout>
                        <div class="alignC mt-3">
                            {{ item.description }}
                        </div>
                    </v-layout>
                </v-layout>
            </v-radio-group>
            <v-layout justify-center class="mt-4">
                <v-btn @click="analysisPortfolio" color="primary" large>Анализ портфеля</v-btn>
            </v-layout>
        </v-layout>
    `
})
export class ChooseRisk extends UI {
    @Inject
    private portfolioService: PortfolioService;

    private mutableCurrentRiskLevel: string = null;

    private risk = RiskType.LOWER;
    private riskType = RiskType;

    @Prop({required: true, default: null})
    private currentRiskLevel: string;

    async created(): Promise<void> {
        this.mutableCurrentRiskLevel = this.currentRiskLevel;
    }

    @Watch("currentRiskLevel")
    private setMutableCurrentRiskLevel(): void {
        this.mutableCurrentRiskLevel = this.currentRiskLevel;
    }

    private analysisPortfolio(): void {
        this.$emit("analysisPortfolio", this.risk);
    }

    private setRiskLevel(): void {
        this.$emit("setRiskLevel", this.mutableCurrentRiskLevel);
    }

}
