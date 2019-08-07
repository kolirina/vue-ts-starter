import {DirectiveOptions} from "vue/types/options";
import {VuexConfiguration} from "../../vuex/vuexConfiguration";

const store = VuexConfiguration.getStore();

/**
 * Директива для показа подсказки и истекшем тарифе
 */
export class TariffHint implements DirectiveOptions {

    /** Имя директивы */
    static NAME = "tariffExpiredHint";

    /**
     * @param {HTMLElement} el html элемент
     */
    bind(el: HTMLElement): void {
        if ((store as any).state.MAIN.isTariffExpired) {
            if (!el.classList.contains("custom-v-menu")) {
                el.addEventListener("mouseover", (event) => {
                    (store as any).state.MAIN.tariffExpiredHintCoords = {
                        x: event.pageX.toString() + "px",
                        y: event.pageY.toString() + "px",
                        display: "block"
                    };
                });
                el.addEventListener("mouseleave", (event) => {
                    if (!(event.toElement.className === "custom-v-menu" || event.toElement.className === "v-menu-content")) {
                        (store as any).state.MAIN.tariffExpiredHintCoords = {
                            x: "0px",
                            y: "0px",
                            display: "none"
                        };
                    }
                });
                el.classList.toggle("blur", true);
            }
        }
    }
}