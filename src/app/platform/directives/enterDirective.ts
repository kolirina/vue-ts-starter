/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {DirectiveOptions, VNodeDirective} from "vue";

export class EnterDirective implements DirectiveOptions {

    /** Имя директивы */
    static readonly NAME = "enter";

    /** Массив элементов с функциями для которых указана данная директива */
    private static readonly instances: EnterDirectiveInstance[] = [];

    /** События на которые срабатывает директива */
    private static readonly events: string[] = ["keypress"];

    /**
     * Функция обработчик события click/touch. Если используется модификатор once, то будет выполнено действие у последнего элемента в стэке,
     * иначе будут вызваны обработчики всех элементов.
     * @param {Event} event click/touch
     */
    private static onEvent(event: KeyboardEvent): void {
        const instance: EnterDirectiveInstance = EnterDirective.instances[EnterDirective.instances.length - 1];
        EnterDirective.instances.forEach((instanceItem: any) => {
            EnterDirective.eventListener(event, instanceItem);
        });
    }

    /**
     * Выполняет действия при вызове события
     * @param {Event} event событие
     * @param instance объект
     */
    private static eventListener(event: KeyboardEvent, instance: EnterDirectiveInstance): void {
        if ((!instance.useCtrl || event.ctrlKey) && (event.code === "Enter" || event.keyCode === 13)) {
            if (event.target !== instance.el && !instance.el.contains(event.target) && typeof instance.callback === "function") {
                instance.callback(event);
            }
        }
    }

    bind(el: HTMLElement, binding: VNodeDirective): void {
        EnterDirective.instances.push({el, callback: binding.value, useCtrl: binding.modifiers?.useCtrl});
        // необходимо отсортировать элементы, чтобы вложенные закрывались первыми
        EnterDirective.instances.sort((a: EnterDirectiveInstance, b: EnterDirectiveInstance): number => {
            return a.el.contains(b.el) ? 1 : -1;
        });
        if (EnterDirective.instances.length === 1) {
            EnterDirective.events.forEach((e: any) => {
                setTimeout(() => {
                    // добавляем обработчики после обработки события, в результате которого создался элемент с директивой,
                    // иначе элемент может быть скрыт тем же событием в котором он был отрисован, когда событие всплывет до элемента `document`
                    document.addEventListener(e, EnterDirective.onEvent);
                });
            });
        }
    }

    update(el: HTMLElement, binding: VNodeDirective): void {
        if (typeof binding.value !== "function") {
            throw new Error("Ошибка биндинга. Аргумент должен быть функцией");
        }
        const instance = EnterDirective.instances.find((i: EnterDirectiveInstance) => i.el === el);
        instance.callback = binding.value;
    }

    unbind(el: HTMLElement): void {
        const indexOfUnboundInstance = EnterDirective.instances.indexOf(EnterDirective.instances.find((i: EnterDirectiveInstance) => i.el === el));
        EnterDirective.instances.splice(indexOfUnboundInstance);
        if (EnterDirective.instances.length === 0) {
            EnterDirective.events.forEach((e: any) => document.removeEventListener(e, EnterDirective.onEvent));
        }
    }
}

export interface EnterDirectiveInstance {
    el: any;
    callback: (event: any) => void;
    useCtrl: boolean;
}
