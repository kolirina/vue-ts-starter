import {DirectiveOptions} from 'vue/types/options';
import {VNodeDirective} from 'vue/types/vnode';
import {UiStateHelper} from '../../utils/uiStateHelper';

/**
 * Директива для управления состоянием UI-элементов
 */
export class StateDirective implements DirectiveOptions {

    /** Имя директивы */
    static NAME = 'state';

    /**
     * Биндит событие для сохранения состояния UI-элементов
     * @param {HTMLElement} el          html элемент
     * @param {VNodeDirective} binding  контекст связывания
     */
    bind(el: HTMLElement, binding: VNodeDirective): void {
        el.addEventListener('click', () => UiStateHelper.toggleState(binding.value));
    }
}