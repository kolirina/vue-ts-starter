import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {TariffHint} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div :style="{ left: hintCoords.x, top: hintCoords.y, display: hintCoords.display }" class="custom-v-menu" v-tariff-expired-hint>
            <div class="v-menu-content">
                Подключите тарифный план “Профессионал”, чтобы открыть доступ ко всем возможностям сервиса.
                Подробнее узнать про тарифные планы Intelinvest вы можете пройдя по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
        </div>
    `
})
export class TariffExpiredHint extends UI {

    @MainStore.Getter
    private hintCoords: TariffHint;

    private goToTariff(): void {
        this.$router.push({path: "/settings/tariffs"});
    }
}
