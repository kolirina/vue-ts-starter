import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            Перейдите в личный кабинет брокера, и выберите пункт <b>Отчеты</b>.

            Выберите тип отчета <b>Брокерский</b> Настройте параметры отчета:
            <ul>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Нажмите кнопку Сохранить XLS</li>
            </ul>

            Полученный файл используйте для импорта.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="3" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="4" @click.stop="openImageDialog">
                </figure>
            </div>

            <div class="alfa-line"></div>

            Вы также можете использовать отчеты в формате xml, которые можно<br>
            выгрузить из старой версии личного кабинета. Для этого на главном экране<br>
            перейдите по ссылке Старый ЛК<br>

            В старой версии ЛК брокера

            Выберите пункт меню Отчеты → Бухгалтерские отчеты<br>
            Настройте параметры отчета:
            <ul>
                <li>Укажите вид отчета. (<b>ОТЧЕТ ОБ УРЕГУЛИРОВАННЫХ СДЕЛКАХ</b>)</li>
                <li>Укажите счет</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Чекбоксы По всем счетам и Включить сделки РЕПО/SWAP оставьте неотмеченными</li>
                <li>Нажмите кнопку <b>Построить отчет</b></li>
            </ul>

            После успешного формирования отчета он появится в таблице ниже<br>
            в статусе "готово". Скачайте отчет в формате xml и используйте его<br>
            для импорта.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[2]" alt="5" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[3]" alt="6" @click.stop="openImageDialog">
                </figure>
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

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
