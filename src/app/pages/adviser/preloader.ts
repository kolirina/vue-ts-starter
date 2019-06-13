import Component from "vue-class-component";
import {UI} from "../../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout>
            <v-layout>
                <img src="./img/common/logo-sign-in.svg" alt="pic">
                <span>
                    Идет анализ
                </span>
            </v-layout>
        </v-layout>
    `
})
export class Preloader extends UI {
}
