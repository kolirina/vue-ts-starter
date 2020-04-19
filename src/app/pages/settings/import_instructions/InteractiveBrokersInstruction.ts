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
                    В боковом меню выберите <b>Отчеты</b>
                </div>

                <v-img :src="IMAGES[0]" max-width="933" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Первая вкладка - <b>"Выписки"</b><br/>
                    Формат отчета <b>Активность</b>
                </div>

                <v-img :src="IMAGES[1]" max-width="933" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Настройте параметры получаемого отчета
                </div>

                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Период - <b>Индивидуальный срок</b></li>
                        <li><b>Начальная дата</b> и <b>Конечная дата</b> - укажите значения, которые Вам необходимы. Как правило, для получения полной информации необходимо
                            выбрать интервал,
                            который бы соответствовал всему времени существования брокерского счета (с даты создания до текущей даты)
                        </li>
                        <li>Формат - <b>csv</b></li>
                        <li>Язык - <b>Русский</b> (Если применимо)</li>
                    </ul>
                    Либо можете получить отчет за определенный год
                    <ul>
                        <li>Период - <b>Годовой</b></li>
                        <li>Дата - укажите требуемый год</li>
                        <li>Формат - <b>csv</b></li>
                        <li>Язык - <b>Русский</b> (Если применимо)</li>
                    </ul>
                </div>

                <v-img :src="IMAGES[2]" max-width="802" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    После этого нажмите кнопку <b>Запустить</b>.<br/>
                </div>

                <v-img :src="IMAGES[3]" max-width="933" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Полученный отчет используйте для импорта.<br/>
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
        "./img/import_instructions/ib/3.png",
        "./img/import_instructions/ib/4.png",
    ];

}
