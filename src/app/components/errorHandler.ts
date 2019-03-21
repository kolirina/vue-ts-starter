import Component from "vue-class-component";
import {UI} from "../app/ui";
import {EventType} from "../types/eventType";

@Component({
    template: `<div></div>`
})
export class ErrorHandler extends UI {

    /**
     * Подписывается на обработку событий
     * @inheritDoc
     */
    created(): void {
        UI.on(EventType.HANDLE_ERROR, (error: Error | string) => {
            const message = error instanceof Error ? (window.console.error(error), error.message) : error;
            this.$snotify.error(message);
        });
    }
}