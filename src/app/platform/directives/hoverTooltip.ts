import {DirectiveOptions} from "vue/types/options";
import {VNodeDirective} from "vue/types/vnode";
import {VuexConfiguration} from "../../vuex/vuexConfiguration";

const store = VuexConfiguration.getStore();

/**
 * Директива для показа ховер тултипа
 */
export class HoverTooltip implements DirectiveOptions {

    /** Имя директивы */
    static NAME = "hover";

    /**
     * Биндит событие для сохранения состояния UI-элементов
     * @param {HTMLElement} el          html элемент
     * @param {VNodeDirective} binding  контекст связывания
     */
    bind(el: HTMLElement, binding: VNodeDirective): void {
        if (!(store as any).state.MAIN.isTariffExpired) {
            if (!el.classList.contains("custom-v-menu")) {
                el.addEventListener("mouseover", (event) => {
                    (store as any).state.MAIN.tariffExpiredHintCoords = {
                        x: event.pageX.toString() + "px",
                        y: event.pageY.toString() + "px",
                        display: "block"
                    };
                });
                el.addEventListener("mouseleave", (event) => {
                    if (event.toElement.className !== "v-menu-content") {
                        (store as any).state.MAIN.tariffExpiredHintCoords = {
                            x: event.pageX.toString() + "0px",
                            y: event.pageY.toString() + "0px",
                            display: "none"
                        };
                    }
                });
                el.classList.toggle("blur", true);
            }
        }
    }
}