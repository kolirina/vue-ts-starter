/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Component, UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера
                </div>

                <div class="import-default-text">
                    В боковом меню выберите <b>"Отчеты"</b> - <b>"Выписки"</b>
                </div>

                <v-img :src="IMAGES[0]" height="567" width="933" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Выберите параметры, которые указаны на следующем рисунке:
                </div>

                <div class="import-format-requirements-ul">
                    <ul>
                        <li>"Тип отчета" - <b>"Отчеты по умолчанию"</b></li>
                        <li>"Тип выписки по умолчанию" - <b>"Активность"</b></li>
                        <li>"Период" - <b>"Индивидуальный срок"</b></li>
                        <li><b>"Начальная дата"</b> и <b>"Конечная дата"</b> - укажите значения, которые Вам необходимы. Как правило, для получения полной информации необходимо
                            выбрать интервал,
                            который бы соответствовал всему времени существования брокерского счета (с даты создания до текущей даты)
                        </li>
                        <li>"Формат" - Используйте для импорта отчеты в формате <b>cpt</b>, <b>xls</b>, <b>csv</b>. Форматы отчетов указаны в порядке предпочтительности.</li>
                        <li>"Язык" - <b>"Русский"</b></li>
                    </ul>
                </div>

                <v-img :src="IMAGES[1]" height="384" width="933" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    После этого нажмите кнопку "СОСТАВИТЬ ОТЧЕТ".<br/>
                    Если отчет не пройдет импорт, попробуйте пересохранить файл в кодировке UTF-8 или windows-1251.
                </div>
            </div>
        </div>
    `
})
export class InteractiveBrokersInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/ib/1.png",
        "./img/import_instructions/ib/2.png",
    ];

}
