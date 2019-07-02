import Component from "vue-class-component";
import {UI} from "../../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout column>
            <v-layout class="pa-4">
                <v-spacer></v-spacer>
                <a @click.stop="goToChooseRiskType" class="decorationNone">Настройки</a>
            </v-layout>
            <v-layout justify-center align-center column class="py-5">
                <img src="./img/adviser/goodPortfolio.svg" alt="pic">
                <div class="alignC mt-3 fs12-non-opacity non-sovet-block">
                    Советов для вас нет, а это значит вы хорошо справляетесь с портфелем. Отличная работа!
                </div>
            </v-layout>
        </v-layout>
    `
})
export class EmptyAdvice extends UI {
    private goToChooseRiskType(): void {
        this.$emit("goToChooseRiskType");
    }
}
