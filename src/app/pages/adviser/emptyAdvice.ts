import Component from "vue-class-component";
import {UI} from "../../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout justify-center align-center column class="margT70 maxW275 fs12-non-opacity">
            <v-layout justify-center>
                <img src="./img/adviser/goodPortfolio.svg" alt="pic">
                <div class="alignC mt-3 fs12-non-opacity non-sovet-block">
                    Советов для вас нет, а это значит вы хорошо справляетесь с портфелем. Отличная работа!
                </div>
            </v-layout>
        </v-layout>
    `
})
export class EmptyAdvice extends UI {
}
