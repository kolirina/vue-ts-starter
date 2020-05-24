/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */
import {Component, UI} from "../../../app/ui";
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div class="tinkoff-instruction">
            <div class="import-default-text-margin-t">
                Вы можете загружать отчеты как за весь период, так и за отдельные месяцы или любые другие произвольные периоды.<br/>
                Также поддерживается импорт отчетов в формате html, которые брокер присылает вам на почту.<br/>
                Можно загружать отчеты обоих форматов, за любые периоды, в том числе и пересекающиеся между собой, дублей сделок при этом не будет.
            </div>

            <div class="mt-4">
                Чтобы получить отчет по брокерскому счету или ИИС за весь период в формате <b>xls/xlsx</b>:<br/>
                Перейдите на сайт <a href="https://online.sberbank.ru/" target="_blank">https://online.sberbank.ru/</a>,
                <span>в левом боковом меню выберите пункт <b>Инвестиции</b></span> →
                <span>Выберите в выпадающем меню пункт <b>Брокерское обслуживание</b></span> →
                <span>Выберите нужный счет (брокерский или ИИС) и нажмите на ссылку <b>Операции по счету</b></span>
            </div>
            <br/>
            <div>
                Для получения списка сделок по бумагам переключитесь на вкладку <b>Сделки</b>
            </div>
            <span class="import-default-text-margin-t">
                Настройте параметры отчета:
            </span> →
            <span>Выберите <b>За период</b></span> →
            <span>Выберите период отчета (оптимальный вариант: с даты первой сделки по текущий день)</span>

            <div>
                Нажмите кнопку <b>Скачать в Excel</b>
            </div>
            <div>
                Полученный файл используйте для импорта.
            </div>

            <div class="mt-5">
                Для получения списка сделок по движению денежных средств переключитесь на вкладку <b>Зачисления/Списания</b>
            </div>
            <span class="import-default-text-margin-t">
                Настройте параметры отчета:
            </span> →
            <span>Выберите <b>За период</b></span> →
            <span>Выберите период отчета (оптимальный вариант: с даты первой сделки по текущий день)</span>
            <div>
                Нажмите кнопку <b>Скачать в Excel</b>
            </div>
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

            <div class="mt-4">
                Для получения отчета по счету или ИИС в старом интерфейсе Сбербанк Онлайн, следуйте инструкции.<br/><br/>
                Чтобы получить отчет за весь период в формате <b>xls/xlsx</b>:<br/>
                Перейдите на сайт <a href="https://online.sberbank.ru/" target="_blank">https://online.sberbank.ru/</a>,
                <div>
                    в верхнем меню нажмите пункт <b>Прочее</b>
                </div>
                <div>
                    Выберите в выпадающем меню пункт <b>Брокерское обслуживание</b>
                </div>
            </div>

            <div>
                Для получения списка сделок по бумагам переключитесь на вкладку <b>Сделки</b>
            </div>
            <div class="import-default-text-margin-t">
                Настройте параметры отчета:
            </div>
            <ul>
                <li>Укажите период</li>
                <li>Настройте параметры (если загружаете впервые, можно оставить настройки по умолчанию)</li>
                <li>Нажмите кнопку Применить</li>
            </ul>
            <div>
                Отобразится список сделок за выбранный период.
            </div>
            <div>
                Нажмите кнопку <b>Скачать в формате Excel</b>
            </div>
            <div>
                Полученный файл используйте для импорта.
            </div>

            <div class="mt-5">
                Для получения списка сделок по движению денежных средств переключитесь на вкладку <b>Зачисления/Списания</b>
            </div>
            <div class="import-default-text-margin-t">
                Настройте параметры отчета:
            </div>
            <ul>
                <li>Укажите период</li>
                <li>Настройте параметры (если загружаете впервые, можно оставить настройки по умолчанию)</li>
                <li>Нажмите кнопку Применить</li>
            </ul>
            <div>
                Отобразится список зачислений/списаний за выбранный период.
            </div>
            <div>
                Нажмите кнопку <b>Скачать в формате Excel</b>
            </div>
            <div>
                Полученный файл используйте для импорта.
            </div>

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[3]" alt="3" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[4]" alt="4" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[5]" alt="5" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[6]" alt="6" @click.stop="openImageDialog">
                </figure>
            </div>

            <div class="mt-4">
                Если у Вас счет ИИС и вы выбрали у брокера опцию зачисления денежных средств от Дивидендов, Купонов, Амортизаций и Погашений на
                отдельный банковский счет, тогда в отчете по Зачислениям/Списаниям не будут отображены начисления по бумагам, а только переводы.<br/>
                В этом случае вы можете легко дополнить историю портфеля по начислениям из пункта меню <b>Инструменты - События</b>.
            </div>
        </div>
    `
})
export class SberbankInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/sberbank/1.png",
        "./img/import_instructions/sberbank/2.png",
        "./img/import_instructions/sberbank/3.png",
        "./img/import_instructions/sberbank/old/1.png",
        "./img/import_instructions/sberbank/old/2.png",
        "./img/import_instructions/sberbank/old/3.png",
        "./img/import_instructions/sberbank/old/4.png",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
