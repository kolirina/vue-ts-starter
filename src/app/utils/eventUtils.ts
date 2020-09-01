export class EventUtils {

    private constructor() {
    }

    // Ctrl либо Cmd для macOS
    static isControlKey(event: KeyboardEvent): boolean {
        return event.ctrlKey || event.metaKey || event.key === "Control";
    }

    static isDeletion(event: KeyboardEvent): boolean {
        return event.keyCode === 8 || event.keyCode === 46;
    }

    /**
     * FOR KEYPRESS EVENT ONLY
     * @param event
     * @returns {boolean} true - если введен символ
     */
    static isCharInput(event: KeyboardEvent): boolean {
        const which = event.which;
        return !EventUtils.isControlKey(event)
            && (which === undefined || which !== 0) && which !== 8;
    }

    static getClipboardData = (clipboardEvent: ClipboardEvent | DragEvent): string => {
        let event = clipboardEvent;
        if (event.type === "drop") {
            return (event as DragEvent).dataTransfer.getData("text");
        }
        event = event as ClipboardEvent;
        return event.clipboardData
            ? event.clipboardData.getData("text/plain")
            : (window as any).clipboardData.getData("Text");
    };

    /**
     * Добавить обработчик событий
     * @param {HTMLElement} element                         елемент
     * @param {string} events                               названия событий через пробел
     * @param {EventListenerOrEventListenerObject} callback обработчик событий
     * @param {boolean | AddEventListenerOptions} options   дополнительные опции к событию
     */
    static addEventListener(element: Element, events: string,
                            callback: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void {
        events.split(" ").forEach((event: string): void => element.addEventListener(event, callback));
    }
}
