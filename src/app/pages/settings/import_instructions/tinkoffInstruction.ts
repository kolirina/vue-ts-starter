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
            <div class="import-default-text import-default-text-margin-t">
                Для получения файла импорта в мобильном приложении:
            </div>
            <div class="import-default-text">
                <div>
                    Зайдите в мобильное приложение,
                    <div>
                        в нижей панели выберите пункт "Еще".
                    </div>
                    <div>
                        Выберите в меню пункт Профиль.
                    </div>
                    <v-img :src="IMAGES[0]" height="600" width="300" class="grey darken-4 image"></v-img>
                    <div>
                        Перейдите в раздел Отчеты и сформируейте Брокерский отчет Тинькофф за желаемый период.
                    </div>
                    <v-img :src="IMAGES[1]" height="600" width="300" class="grey darken-4 image"></v-img>
                </div>
            </div>
        </div>
    `
})
export class TinkoffInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/tinkoff/1.png",
        "./img/import_instructions/tinkoff/2.png"
    ];
}
