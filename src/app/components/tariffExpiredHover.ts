import {Container, Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../app/ui";
import {VMenu} from "../services/vMenu";

@Component({
    // language=Vue
    template: `
        <div :style="{ left: getLeftOffset(), top: getTopOffset() }" class="custom-v-menu">
            <div class="content">
                Подключите тарифный план “Профессионал”, чтобы открыть доступ ко всем возможностям сервиса.
                Подробнее узнать про тарифные планы Intelinvest вы можете пройдя по ссылке.
            </div>
        </div>
    `
})
export class TariffExpiredHover extends UI {

    @Inject
    private vMenu: VMenu;

    private getLeftOffset(): string {
        return this.vMenu.offsetX + "px" || "0px";
    }

    private getTopOffset(): string {
        return this.vMenu.offsetY  || "0px";
    }

}
