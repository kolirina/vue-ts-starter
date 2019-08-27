import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {OverviewService} from "../services/overviewService";
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
                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                    <sup class="custom-tooltip" slot="activator">
                        <v-icon>fas fa-info-circle</v-icon>
                    </sup>
                    <span>
                        В Вашем портфеле отрицательный баланс денежных средств. Это может являться причиной некорректного отображения стоимости портфеля и других показателей.
                        Для исправления данной ситуации, вам необходимо указать корректный остаток денежных средств по ссылке: Сверить балансы
                    </span>
                </v-tooltip>
            </div>
            <v-layout class="btn-action-section" wrap justify-space-between>
                <v-btn @click="goToCalculations()">
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
