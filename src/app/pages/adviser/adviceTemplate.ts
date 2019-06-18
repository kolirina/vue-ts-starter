import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, UI} from "../../app/ui";
import {Advice} from "../../services/adviceService";

@Component({
    // language=Vue
    template: `
        <v-layout class="advice-item margT20" column>
            <v-layout @click="isOpen = !isOpen" class="fs14 pa-3 bold advice-item__header" align-center>
                {{ advice.problem }}
                <span :class="['exp-panel-arrow', 'ml-3', isOpen ? 'rotate-icons' : '']"></span>
            </v-layout>
            <v-expand-transition>
                <div v-show="isOpen" class="px-3 pb-3">
                    <div class="fs13">
                        {{ advice.description }}
                    </div>
                    <div v-if="advice.decisionTitle" class="fs13 mt-3">
                        {{ advice.decisionTitle }}
                    </div>
                    <div :class="!advice.decisionTitle ? 'mt-3' : 'mt-1'">
                        <div v-for="decision in advice.decisions" class="fs14">
                            <v-icon>done</v-icon> Решение: {{ decision }}
                        </div>
                    </div>
                </div>
            </v-expand-transition>
        </v-layout>
    `
})
export class AdviceTemplate extends UI {
    @Prop({required: true, default: null})
    private advice: Advice;

    private isOpen: boolean = true;

    private goToChooseRiskType(): void {
        this.$emit("goToChooseRiskType");
    }
}
