import Component from "vue-class-component";
import {UI} from "../../app/ui";
// import {RiskType} from "../../types/RiskType";

@Component({
    // language=Vue
    template: `
        <v-layout class="pa-4" column>
            <div class="fs16">
                Советчик поможет увеличить прибыль в соответствии с Вашим уровнем риска
            </div>
            <v-layout wrap justify-space-around>
                <v-layout justify-center column class="margT70 maxW275 fs12-non-opacity">
                    <img src="./img/adviser/lowerRisk.svg" alt="pic">
                    <v-layout justify-center class="mt-3">
                        <v-radio-group v-model="risk" row class="mt-0 pt-4 pl-4 margB35" hide-details>
                            <v-radio v-for="item in riskType" :key="item" :label="item" :value="item" class="pl-1"></v-radio>
                        </v-radio-group>
                    </v-layout>
                    <div class="alignC mt-3">
                        Хочу сохранить накопленный капитал, не готов рисковать более 5-10% портфеля
                    </div>
                </v-layout>
            </v-layout>
            <v-layout justify-center class="mt-4">
                <v-btn @click="analysisPortfolio" color="primary" large>Анализ портфеля</v-btn>
            </v-layout>
        </v-layout>
    `
})
export class ChooseRisk extends UI {
    private risk = RiskType.LOWER;
    private riskType = RiskType;

    created(): void {
        console.log(this.riskType.LOWER === this.risk);
    }

    private analysisPortfolio(): void {
        this.$emit("analysisPortfolio", this.risk);
    }
}
