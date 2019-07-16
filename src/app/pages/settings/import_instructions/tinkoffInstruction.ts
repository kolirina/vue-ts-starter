import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="tinkoff-instruction">
            <div class="import-format-requirements-ul">
                <div class="import-default-text-margin-t">
                    Получить отчет в формате xls/xlsx можно двумя способами:
                </div>
                <ul>
                    <li>Запросить отчет в чате техподдержки через личный кабинет</li>
                    <li>Сформировать отчет в мобильном приложении</li>
                </ul>
                <div>
                    Полученный файл используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class TinkoffInstruction extends UI {
}
