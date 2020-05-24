import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div class="tinkoff-instruction">
            <div class="import-default-text-margin-t">
                Вы можете загружать отчеты как за весь период, так и за отдельные месяцы.<br/>
                Получить отчет за весь период в формате xls/xlsx можно двумя способами:
            </div>
            <ul>
                <li>Запросить отчет в чате техподдержки через личный кабинет</li>
                <li>Запросить отчет в чате техподдержки через мобильное приложение</li>
            </ul>
            <div>
                Полученный файл используйте для импорта.
            </div>
            <div class="mt-4">
                Для получения отчета за конкретный месяц используйте инструкцию ниже.<br/>
                Перейдите на сайт <a href="https://www.tinkoff.ru/" target="_blank">https://www.tinkoff.ru</a> →
                в верхнем меню перейдите <b>Инвестиции</b> - <b>Портфель</b> →
                Выберите в выпадающем меню пункт <b>О счете</b> →
                Переключите формат отчета в <b>Excel</b>
            </div>


            <div class="import-default-text-margin-t">
                Настройте параметры отчета:
            </div>
            <ul>
                <li>Укажите месяц</li>
                <li>Год</li>
                <li>Нажмите кнопку Скачать</li>
            </ul>
            <div>
                Полученный файл используйте для импорта.
            </div>

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="1" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[2]" alt="2" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class TinkoffInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/tinkoff/1.png",
        "./img/import_instructions/tinkoff/2.png",
        "./img/import_instructions/tinkoff/3.png",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
