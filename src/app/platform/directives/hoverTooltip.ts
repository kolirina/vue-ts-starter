import {DirectiveOptions} from "vue/types/options";
import {VNodeDirective} from "vue/types/vnode";
import {UiStateHelper} from "../../utils/uiStateHelper";

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
        el.addEventListener("mouseover", (event) => {
            UiStateHelper.offsetX(event.clientX.toString());
            UiStateHelper.offsetY(event.clientY.toString());
        });
        // el.addEventListener("mouseleave", () => {
        // });
        el.classList.add("blur");
    }
}