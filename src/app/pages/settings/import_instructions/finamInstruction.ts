import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Перейдите в личный кабинет брокера. Перейдите на вкладку просмотра <b>Единой денежной позиции</b>
                далее вкладка <b>Справка по счету</b>.
                <br/>
                <v-img :src="IMAGES[0]" height="210" width="330" class="grey darken-4" @click.stop="openImage(IMAGES[0])"></v-img>
                <br/>
                Настройте параметры отчета:
            <ul>
                <li>Укажите период</li>
                <li>Укажите формат отчета <b><i>xml</i></b></li>
                <li>Нажмите кнопку <b><i>Сформировать</i></b></li>
            </ul>
            <br/>
            <v-img :src="IMAGES[1]" height="210" width="330" class="grey darken-4" @click.stop="openImage(IMAGES[1])"></v-img>
            <br/>
            После успешного формирования отчета появится запрос на скачивание отчета.
            Полученный файл используйте для импорта.
            </p>
        </div>
    `
})
export class FinamInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/finam/1.png",
        "./img/import_instructions/finam/2.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
