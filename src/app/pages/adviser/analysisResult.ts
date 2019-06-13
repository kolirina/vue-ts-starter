import Component from "vue-class-component";
import {UI} from "../../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout class="pa-4">
            <v-layout>
                <div class="fs16">
                    Советчик поможет увеличить прибыль в соответствии с Вашим уровнем риска
                </div>
                <v-spacer></v-spacer>
                <div @click.stop="goToChooseRiskType">Настройки</div>
            </v-layout>
            <div class="fs12-non-opacity info-about-portfolio pa-3">
                Небольшое количество советов, означает что ваш портфель близок к оптимальному и вы выбрали хорошую стратегию инвестирования.
            </div>
            <v-layout>
            </v-layout>
        </v-layout>
    `
})
export class AnalysisResult extends UI {
    private goToChooseRiskType(): void {
        this.$emit("goToChooseRiskType");
    }
}
