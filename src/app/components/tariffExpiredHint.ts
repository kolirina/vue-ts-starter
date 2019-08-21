import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {Tariff} from "../types/tariff";
import {TariffHint} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="clientInfo && hintCoords" :style="{ left: hintCoords.x, top: hintCoords.y, display: hintCoords.display }" class="custom-v-menu" v-tariff-expired-hint>
            <div v-if="isFreeTariff || isExpiredTrial" class="v-menu-content">
                Подключите любой платный тарифный план (Профессионал или Стандарт) для получения доступа ко всем возможностям сервиса.
                Подробнее узнать о тарифных планах Intelinvest, вы можете по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
            <div v-else-if="isExpiredStandard" class="v-menu-content">
                Продлите вашу подписку на тарифный план Стандарт или подключите тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                Подробнее узнать о тарифных планах Intelinvest, вы можете по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
            <div v-else-if="isExpiredPro" class="v-menu-content">
                Продлите вашу подписку на тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                Подробнее узнать о тарифных планах Intelinvest, вы можете по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
        </div>
    `
})
export class TariffExpiredHint extends UI {

    @MainStore.Getter
    private hintCoords: TariffHint;
    @MainStore.Getter
    private expiredTariff: boolean;
    @MainStore.Getter
    private clientInfo: ClientInfo;

    private tariff = Tariff;

    private goToTariff(): void {
        this.$router.push({path: "/settings/tariffs"});
    }

    private get isFreeTariff(): boolean {
        return this.clientInfo.user.tariff === this.tariff.FREE;
    }

    private get isExpiredTrial(): boolean {
        return this.clientInfo.user.tariff === this.tariff.TRIAL && this.expiredTariff;
    }

    private get isExpiredStandard(): boolean {
        return this.clientInfo.user.tariff === this.tariff.STANDARD && this.expiredTariff;
    }

    private get isExpiredPro(): boolean {
        return this.clientInfo.user.tariff === this.tariff.PRO && this.expiredTariff;
    }
}
