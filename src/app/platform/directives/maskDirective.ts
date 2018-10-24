import {InputMask, MaskOptions} from "imask";
import {DirectiveOptions} from "vue/types/options";
import {VNodeDirective} from "vue/types/vnode";

/**
 * Директива для управления состоянием UI-элементов
 */
export class MaskDirective implements DirectiveOptions {

    /** Имя директивы */
    static NAME = "mask";

    private static fireEvent(el: HTMLInputElement, eventName: string, data: any) {
        const e = document.createEvent("CustomEvent");
        e.initCustomEvent(eventName, true, true, data);
        el.dispatchEvent(e);
    }

    private static initMask(el: HTMLInputElement, opts: MaskOptions) {
        console.log("BIND", opts, el);
        const inputMask = new InputMask(el, opts);
        inputMask.on("accept", () => {
            MaskDirective.fireEvent(el, "accept", (el as any).maskRef);
        });
        inputMask.on("complete", () => {
            MaskDirective.fireEvent(el, "complete", (el as any).maskRef);
        });
        (el as any).maskRef = inputMask;
        console.log("IM", inputMask);
    }

    private static destroyMask(el: HTMLInputElement) {
        if ((el as any).maskRef) {
            (el as any).maskRef.destroy();
            delete (el as any).maskRef;
        }
    }

    private static getInputElement(element: HTMLElement): HTMLInputElement {
        if (element.tagName.toLocaleUpperCase() !== "INPUT") {
            const els = element.getElementsByTagName("input");
            if (els.length !== 1) {
                throw new Error("mask directive requires 1 input, found " + els.length);
            } else {
                return els[0];
            }
        }
        return element as HTMLInputElement;
    }

    bind(el: HTMLElement, binding: VNodeDirective) {
        if (!binding.value) {
            return;
        }
        MaskDirective.initMask(MaskDirective.getInputElement(el), binding.value as MaskOptions);
    }

    update(el: HTMLElement, binding: VNodeDirective) {
        const options = binding.value as MaskOptions;
        console.log("UPDATE", binding, MaskDirective.getInputElement(el));
        if (options) {
            if ((el as any).maskRef) {
                (el as any).maskRef.updateOptions(options);
            } else {
                MaskDirective.initMask(MaskDirective.getInputElement(el), options);
            }
        } else {
            MaskDirective.destroyMask(MaskDirective.getInputElement(el));
        }
    }

    unbind(el: HTMLElement) {
        MaskDirective.destroyMask(MaskDirective.getInputElement(el));
    }
}