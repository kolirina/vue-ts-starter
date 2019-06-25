import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, UI} from "../../app/ui";
import {Advice, AdviceService, AdviceUnicCode} from "../../services/adviceService";
import {AdviceTemplate} from "./adviceTemplate";

@Component({
    // language=Vue
    template: `
        <v-layout class="pa-4" column>
            <v-layout>
                <div class="fs16">
                    Результаты анализа
                </div>
                <v-spacer></v-spacer>
                <a @click.stop="goToChooseRiskType" class="decorationNone">Настройки</a>
            </v-layout>
            <div class="fs12-non-opacity info-about-portfolio pa-3 mt-4">
                Небольшое количество советов, означает что ваш портфель близок к оптимальному и вы выбрали хорошую стратегию инвестирования.
            </div>
            <v-layout column>
                <advice-template v-for="advice in advices" :key="advice.problem" :advice="advice"></advice-template>
            </v-layout>
        </v-layout>
    `,
    components: {AdviceTemplate}
})
export class AnalysisResult extends UI {

    @Prop({required: true, default: null})
    private advicesUnicCode: AdviceUnicCode[];

    private advices: Advice[] = [];

    @Inject
    private adviceService: AdviceService;

    created(): void {
        this.advicesUnicCode.forEach((element: AdviceUnicCode) => {
            this.advices.push(this.adviceService.getAdvice(element));
        });
    }

    private goToChooseRiskType(): void {
        this.$emit("goToChooseRiskType");
    }

}
