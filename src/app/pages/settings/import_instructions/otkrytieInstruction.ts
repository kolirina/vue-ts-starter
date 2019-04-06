import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера, в раздел Отчеты и Налоги. Перейдите<br>
                    на вкладку Официальная отчетность далее вкладка Отчеты и справки.
                    Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Тип отчета / справки выберите пункт Брокерский отчет</li>
                        <li>Выберите нужный инвестиционный счет</li>
                        <li>Портфель</li>
                        <li>Укажите период</li>
                        <li>Укажите формат отчета <strong>xml</strong></li>
                        <li>Нажмите кнопку <strong>Заказать отчет / справку</strong></li>
                    </ul>
                </div>
                <v-img :src="IMAGES[0]" height="436" width="933" class="grey darken-4 image" @click.stop="openImage(IMAGES[0])"></v-img>
                <div class="import-default-text">
                    После успешного формирования отчета он появится в таблице ниже в статусе "готово".
                </div>
                <v-img :src="IMAGES[1]" height="148 " width="724.5" class="grey darken-4 image" @click.stop="openImage(IMAGES[1])"></v-img>
                <div class="import-default-text">
                    Полученный файл используйте для импорта.
                </div>
            </div>
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
