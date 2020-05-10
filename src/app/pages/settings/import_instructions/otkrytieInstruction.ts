import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Перейдите в личный кабинет брокера, в раздел Отчеты и Налоги.<br>
            Перейдите на вкладку Официальная отчетность далее вкладка Отчеты и справки.<br>
            Настройте параметры отчета:
            <ul>
                <li>Тип отчета / справки выберите пункт Брокерский отчет</li>
                <li>Выберите нужный инвестиционный счет</li>
                <li>Портфель</li>
                <li>Укажите период</li>
                <li>Укажите формат отчета <strong>xml</strong></li>
                <li>Нажмите кнопку <strong>Заказать отчет / справку</strong></li>
            </ul>
            <v-img :src="IMAGES[0]" max-width="933" class="grey darken-4 image"></v-img>

            После успешного формирования отчета он появится в таблице ниже в статусе "готово".

            <v-img :src="IMAGES[1]" max-width="724.5" class="grey darken-4 image"></v-img>
            Полученный файл используйте для импорта.
        </div>
    `
})
export class OtkrytieInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/otkrytie/1.png",
        "./img/import_instructions/otkrytie/2.png"
    ];

}
