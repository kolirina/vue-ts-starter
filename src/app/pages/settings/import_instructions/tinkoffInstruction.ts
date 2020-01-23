import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="tinkoff-instruction">
            <div class="import-default-text">
                <div>
                    Перейдите на сайт <a href="https://www.tinkoff.ru/" target="_blank">https://www.tinkoff.ru</a>,
                    <div>
                        в верхнем меню перейдите <b>Инвестиции</b> - <b>Портфель</b>
                    </div>
                    <div>
                        Выберите в выпадающем меню пункт <b>О счете</b>
                    </div>
                </div>
                <v-img :src="IMAGES[0]" height="600" width="800" class="grey darken-4 image"></v-img>
            </div>
            <div class="import-format-requirements-ul">
                <div>
                    Переключите формат отчета в <b>Excel</b>
                </div>
                <v-img :src="IMAGES[1]" height="600" width="800" class="grey darken-4 image"></v-img>
                <div class="import-default-text-margin-t">
                    Настройте параметры отчета:
                </div>
                <ul>
                    <li>Укажите месяц</li>
                    <li>Год</li>
                    <li>Нажмите кнопку Скачать</li>
                </ul>
                <v-img :src="IMAGES[2]" height="600" width="800" class="grey darken-4 image"></v-img>
                <div>
                    Полученный файл используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class TinkoffInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/tinkoff/1.png",
        "./img/import_instructions/tinkoff/2.png",
        "./img/import_instructions/tinkoff/3.png",
    ];

}
