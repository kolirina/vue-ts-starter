import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {NegativeBalanceDialog} from "./dialogs/negativeBalanceDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-layout class="negative-balance-notification" align-center justify-space-between wrap>
            <div class="fs16 description">
                У Вас отрицательный баланс денежных средств
                <v-menu open-on-hover bottom nudge-bottom="11" content-class="pa-3 bg-white" max-width="600">
                    <span class="custom-tooltip" slot="activator">
                        <v-icon>fas fa-info-circle</v-icon>
                    </span>
                    <span class="fs13">
                        В Вашем портфеле отрицательный баланс денежных средств. Это может являться причиной некорректного отображения стоимости портфеля и других показателей.
                    </span>
                </v-menu>
            </div>
            <v-layout class="btn-action-section" wrap justify-space-between>
                <v-btn @click="goToCalculations">
                    Сверить расчеты
                </v-btn>
                <v-btn @click="openDialogResidueIndications">
                    Сверить балансы
                </v-btn>
            </v-layout>
        </v-layout>
    `
})
export class NegativeBalanceNotification extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;

    private goToCalculations(): void {
        window.open("https://blog.intelinvest.ru/calculations-explained");
    }

    private async openDialogResidueIndications(): Promise<void> {
        const result = await new NegativeBalanceDialog().show({
            store: this.$store.state[StoreType.MAIN]
        });
        if (result === BtnReturn.YES) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }
}
