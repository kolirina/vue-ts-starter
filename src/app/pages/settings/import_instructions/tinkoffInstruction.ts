import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Перейдите на сайт <a href="https://www.tinkoff.ru/">https://www.tinkoff.ru</a>,
                в правой панели выберите <b>Брокерский счет</b>. Выберите в меню пункт <b>О счете</b>.
                <br/>
                <v-img :src="IMAGES[0]" height="350" width="360" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
                Убедитесь что подготавливаите отчет в формате Тинькофф банка.
                Настройте параметры отчета:
            <ul>
                <li>Укажите месяц</li>
                <li>Год</li>
                <li>Нажмите кнопку <b><i>Скачать</i></b></li>
            </ul>
            <v-img :src="IMAGES[1]" height="320" width="350" class="grey darken-4" @click="openImage(IMAGES[1])"></v-img>
            Полученный файл используйте для импорта.
            </p>
        </div>
    `
})
export class TinkoffInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/tinkoff/1.png",
        "./img/import_instructions/tinkoff/2.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }
}
