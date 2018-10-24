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
        UI.on(EventType.HANDLE_ERROR, (error: Error) => {
            this.$snotify.error(error.message);
            window.console.error(error);
        });
    }
}