import {DirectiveOptions} from "vue/types/options";
import {VuexConfiguration} from "../../vuex/vuexConfiguration";

const store = VuexConfiguration.getStore();

/**
 * Директива для показа подсказки о истекшем тарифе
 */
export class TariffHint implements DirectiveOptions {

    /** Имя директивы */
    static NAME = "tariffExpiredHint";

    /**
     * @param {HTMLElement} el html элемент
     */
    bind(el: HTMLElement): void {
        /** Проверяем истек ли тариф */
        if ((store as any).getters["MAIN/expiredTariff"]) {
            el.addEventListener("mouseover", (event) => {
                (store as any).state.MAIN.tariffExpiredHintCoords = {
                    x: event.pageX.toString() + "px",
                    y: event.pageY.toString() + "px",
                    display: "block"
                };
            });
            el.addEventListener("mouseleave", (event) => {
                /** Условие что бы при ховере на подсказку она не уезжала */
                if (!(event.toElement.className === "custom-v-menu" || event.toElement.className === "v-menu-content")) {
                    (store as any).state.MAIN.tariffExpiredHintCoords = {
                        x: "0px",
                        y: "0px",
                        display: "none"
                    };
                }
            });
            /** Добавляем класс для блюринга блока */
            el.classList.toggle("blur", true);
        }
    }
}