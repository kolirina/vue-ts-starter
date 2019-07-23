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
            <div>
                <v-layout column class="margB64">
                    <div class="fs12-non-opacity margT30">
                        Анализ Intelinvest
                    </div>
                    <advice-template v-for="advice in advices" :key="advice.problem" :advice="advice"></advice-template>
                </v-layout>
                <v-layout column>
                    <div class="fs12-non-opacity">
                        Анализ от Дмитрия Толстякова <a href="https://fin-ra.ru/" target="_blank" class="decorationNone">“Блог Разумные Инвестиции”</a>
                    </div>
                    <!-- <advice-template v-for="advice in advices" :key="advice.problem" :advice="advice"></advice-template> -->
                </v-layout>
            </div>
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
