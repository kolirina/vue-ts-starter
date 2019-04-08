import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div class="tinkoff-instruction">
            <div class="import-default-text">
                <div>
                    Перейдите на сайт <a href="https://www.tinkoff.ru/" target="_blank">https://www.tinkoff.ru</a>,
                    <div>
                        в правой панели выберите Брокерский счет.
                    </div>
                    <div>
                        Выберите в меню пункт О счете.
                    </div>
                </div>
                <v-img :src="IMAGES[0]" height="235" width="582" class="grey darken-4 image"></v-img>
            </div>
            <div class="import-format-requirements-ul">
                <div>
                    Убедитесь что подготавливаете отчет в формате Тинькофф банка.
                </div>
                <div class="import-default-text-margin-t">
                    Настройте параметры отчета:
                </div>
                <ul>
                    <li>Укажите месяц</li>
                    <li>Год</li>
                    <li>Нажмите кнопку Скачать</li>
                </ul>
                <div>
                    Полученный файл используйте для импорта.
                </div>
            </div>
            <v-img :src="IMAGES[1]" height="528" width="536" class="grey darken-4 image"></v-img>
        </div>
    `
})
export class TinkoffInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/tinkoff/1.png",
        "./img/import_instructions/tinkoff/2.png"
    ];

}
