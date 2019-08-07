import {Container, Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI, Watch} from "../app/ui";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div :style="{ left: coordsMenu.x, top: coordsMenu.y, display: coordsMenu.display }" class="custom-v-menu" v-hover>
            <div class="v-menu-content">
                Подключите тарифный план “Профессионал”, чтобы открыть доступ ко всем возможностям сервиса.
                Подробнее узнать про тарифные планы Intelinvest вы можете пройдя по <span @click.stop="goToTariff" class="link">ссылке</span>.
            </div>
        </div>
    `
})
export class TariffExpiredHover extends UI {

    @MainStore.Getter
    private coordsMenu: any;

    private goToTariff(): void {
        this.$router.push({path: "/settings/tariffs"});
    }
}
