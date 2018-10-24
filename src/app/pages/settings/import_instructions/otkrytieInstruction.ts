import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Перейдите в личный кабинет брокера, в раздел <b>Отчеты и Налоги</b>. Перейдите на вкладку <b>Официальная отчетность</b>
                далее вкладка <b>Отчеты и справки</b>.
                <br/>
                Настройте параметры отчета:
            <ul>
                <li><i>Тип отчета / справки</i> выберите пункт <i>Брокерский отчет</i></li>
                <li>Выберите нужный инвестиционный счет</li>
                <li>Портфель</li>
                <li>Укажите период</li>
                <li>Укажите формат отчета <b><i>xml</i></b></li>
                <li>Нажмите кнопку <b><i>Заказать отчет / справку</i></b></li>
            </ul>
            <v-img :src="IMAGES[0]" height="240" width="300" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
            После успешного формирования отчета он появится в таблице ниже в статусе готово.
            <v-img :src="IMAGES[1]" height="240" width="300" class="grey darken-4" @click="openImage(IMAGES[1])"></v-img>
            Полученный файл используйте для импорта.
            </p>
        </div>
    `
})
export class OtkrytieInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/otkrytie/1.png",
        "./img/import_instructions/otkrytie/2.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
