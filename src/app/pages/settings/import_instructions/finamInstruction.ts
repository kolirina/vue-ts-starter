import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера. Перейдите на вкладку просмотра <strong>Единой<br>
                    денежной позиции</strong> далее вкладка <strong>Справка по счету.</strong>
                </div>
                    <v-img :src="IMAGES[0]" height="350" width="980" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Укажите период</li>
                        <li>Укажите формат отчета <b><i>xml</i></b></li>
                        <li>Нажмите кнопку <b><i>Сформировать</i></b></li>
                    </ul>
                </div>
                <v-img :src="IMAGES[1]" height="384" width="980" class="grey darken-4 image"></v-img>
                <div class="import-default-text">
                    После успешного формирования отчета появится запрос на скачивание отчета.<br>
                    Полученный файл используйте для импорта.
                </div>
            </div>
        </div>
    `
})
export class FinamInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/finam/1.png",
        "./img/import_instructions/finam/2.png"
    ];

}
