import Component from "vue-class-component";
import {UI} from "../app/ui";
import {EventType} from "../types/eventType";
import {ErrorInfo} from "../types/types";

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
            const message = error instanceof Error ? (window.console.error(error), error.message) : this.getErrorMessage(error) || error;
            this.$snotify.error(message);
        });
    }

    /**
     * Если пришла сетевая ошибка из API, пробуем получить текст сообщения из нее
     * @param error серверная ошибка
     */
    private getErrorMessage(error: any): string {
        if (error.hasOwnProperty("errorCode") && error.hasOwnProperty("message") && error.hasOwnProperty("fields")) {
            return (error as ErrorInfo).message;
        }
        return null;
    }
}