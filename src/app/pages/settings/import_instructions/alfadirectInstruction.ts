import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            Перейдите в личный кабинет брокера, и выберите пункт Отчеты.

            <v-img :src="IMAGES[0]" max-width="800" class="grey darken-4 image"></v-img>

            Выберите тип отчета <b>Брокерский</b> Настройте параметры отчета:
            <ul>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Нажмите кнопку Сохранить XLS</li>
            </ul>

            <v-img :src="IMAGES[1]" max-width="960" class="grey darken-4 image"></v-img>

            Полученный файл используйте для импорта.

            <div class="alfa-line"></div>

            Вы также можете использовать отчеты в формате xml, которые можно<br>
            выгрузить из старой версии личного кабинета. Для этого на главном экране<br>
            перейдите по ссылке Старый ЛК<br>
            В старой версии ЛК брокера

            <v-img :src="IMAGES[2]" max-width="762" class="grey darken-4 image"></v-img>

            Выберите пункт меню Отчеты -> Бухгалтерские отчеты<br>
            Настройте параметры отчета:
            <ul>
                <li>Укажите вид отчета. (<b>ОТЧЕТ ОБ УРЕГУЛИРОВАННЫХ СДЕЛКАХ</b>)</li>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Чекбоксы По всем счетам и Включить сделки РЕПО/SWAP оставьте неотмеченными</li>
                <li>Нажмите кнопку <b>Построить отчет</b></li>
            </ul>

            <v-img :src="IMAGES[3]" max-width="980" class="grey darken-4 image"></v-img>

            После успешного формирования отчета он появится в таблице ниже<br>
            в статусе "готово". Скачайте отчет в формате xml и используйте его<br>
            для импорта.
        </div>
    `
})
export class AlfadirectInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/alfadirect/1.png",
        "./img/import_instructions/alfadirect/2.png",
        "./img/import_instructions/alfadirect/3.png",
        "./img/import_instructions/alfadirect/4.png"
    ];

}
