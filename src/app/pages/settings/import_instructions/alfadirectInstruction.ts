import Component from "vue-class-component";
import {UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера, и выберите пункт Отчеты.
                </div>

                <v-img :src="IMAGES[0]" height="479" width="800" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Выберите тип отчета <b>Брокерский</b> Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Укажите счет</li>
                        <li>Начало периода</li>
                        <li>Окончание периода</li>
                        <li>Нажмите кнопку Сохранить XLS</li>
                    </ul>
                </div>

                <v-img :src="IMAGES[1]" height="697" width="960" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Полученный файл используйте для импорта.
                </div>

                <div class="alfa-line"></div>

                <div class="import-default-text">
                    Вы также можете использовать отчеты в формате xml, которые можно<br>
                    выгрузить из старой версии личного кабинета. Для этого на главном экране<br>
                    перейдите по ссылке Старый ЛК<br>
                    В старой версии ЛК брокера
                </div>

                <v-img :src="IMAGES[2]" height="297" width="762" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Выберите пункт меню Отчеты -> Бухгалтерские отчеты<br>
                    Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Укажите вид отчета. (<b>ОТЧЕТ ОБ УРЕГУЛИРОВАННЫХ СДЕЛКАХ</b>)</li>
                        <li>Укажите счет</li>
                        <li>Начало периода</li>
                        <li>Окончание периода</li>
                        <li>Чекбоксы По всем счетам и Включить сделки РЕПО/SWAP оставьте неотмеченными</li>
                        <li>Нажмите кнопку <b>Построить отчет</b></li>
                    </ul>
                </div>

                <v-img :src="IMAGES[3]" height="264" width="980" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    После успешного формирования отчета он появится в таблице ниже<br>
                    в статусе "готово". Скачайте отчет в формате xml и используйте его<br>
                    для импорта.
                </div>
            </div>
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
