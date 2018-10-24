import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";


@Component({
    // language=Vue
    template: `
        <div>
            <p>
                Перейдите в личный кабинет брокера, и выберите пункт <b>Отчеты</b>.
                <br/>
                <v-img :src="IMAGES[0]" height="190" width="160" class="grey darken-4" @click="openImage(IMAGES[0])"></v-img>
                Выберите тип отчета <b>Брокерский</b>
                Настройте параметры отчета:
            <ul>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Нажмите кнопку <b><i>Сохранить XLS</i></b></li>
            </ul>
            <v-img :src="IMAGES[1]" height="104" width="178" class="grey darken-4" @click="openImage(IMAGES[1])"></v-img>
            Полученный файл используйте для импорта.
            </p>
            <hr/>
            <p>
                Вы также можете использовать отчеты в формате xml, которые можно выгрузить из старой версии личного кабинета.
                Для этого на главном экране перейдите по ссылке <i>Старый ЛК</i>
                <br/>
                В старой версии ЛК брокера
                <v-img :src="IMAGES[2]" height="120" width="300" class="grey darken-4" @click="openImage(IMAGES[2])"></v-img>
                выберите пункт меню <b>Отчеты</b> -> <b>Бухгалтерские отчеты</b>
                <v-img :src="IMAGES[3]" height="100" width="140" class="grey darken-4" @click="openImage(IMAGES[3])"></v-img>
                Настройте параметры отчета:
            <ul>
                <li>Укажите вид отчета. (<b>ОТЧЕТ ОБ УРЕГУЛИРОВАННЫХ СДЕЛКАХ</b>)</li>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li><i>Чекбоксы По всем счетам</i> и <i>Включить сделки РЕПО/SWAP</i> оставьте неотмеченными</li>
                <li>Нажмите кнопку <b><i>Построить отчет</i></b></li>
            </ul>
            <v-img :src="IMAGES[4]" height="200" width="300" class="grey darken-4" @click="openImage(IMAGES[4])"></v-img>
            После успешного формирования отчета он появится в таблице ниже в статусе готово.
            <br/>
            Скачайте отчет в формате xml и используйте его для импорта.
            </p>
        </div>
    `
})
export class AlfadirectInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/alfadirect/1.png",
        "./img/import_instructions/alfadirect/2.png",
        "./img/import_instructions/alfadirect/3.png",
        "./img/import_instructions/alfadirect/4.png",
        "./img/import_instructions/alfadirect/5.png"
    ];

    private async openImage(url: string): Promise<void> {
        await new ImageDialog().show(url);
    }

}
