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
            if (el.classList.length && !el.classList.contains("custom-v-menu")) {
                el.addEventListener("mouseover", (event) => {
                    (store as any).state.MAIN.customVMenu.x = event.pageX.toString() + "px";
                    (store as any).state.MAIN.customVMenu.y = event.pageY.toString() + "px";
                    (store as any).state.MAIN.customVMenu.display = "block";
                });
                el.addEventListener("mouseleave", (event) => {
                    if (typeof event.toElement.className !== "undefined") {
                        if (event.toElement.className !== "v-menu-content") {
                            (store as any).state.MAIN.customVMenu.x = "0px";
                            (store as any).state.MAIN.customVMenu.y = "0px";
                            (store as any).state.MAIN.customVMenu.display = "none";
                        }
                    } else {
                        (store as any).state.MAIN.customVMenu.x = "0px";
                        (store as any).state.MAIN.customVMenu.y = "0px";
                        (store as any).state.MAIN.customVMenu.display = "none";
                    }
                });
                el.classList.add("blur");
            }
        }
    }
}