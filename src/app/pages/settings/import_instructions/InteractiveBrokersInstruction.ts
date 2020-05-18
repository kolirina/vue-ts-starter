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
import {ImageDialog} from "../../../components/dialogs/imageDialog";

@Component({
    // language=Vue
    template: `
        <div>
            <div>Перейдите в личный кабинет брокера</div>

            <span>В боковом меню выберите <b>Отчеты</b></span> → Первая вкладка - <b>"Выписки"</b> → Формат отчета <b>Активность</b> →

            Настройте параметры получаемого отчета
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

            После этого нажмите кнопку <b>Запустить</b>.<br/>

            Полученный отчет используйте для импорта.<br/>
            Если отчет не пройдет импорт, попробуйте пересохранить файл в кодировке UTF-8 или windows-1251.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="3" @click.stop="openImageDialog">
                </figure>
                <figure>
                    <img :src="IMAGES[1]" alt="4" @click.stop="openImageDialog">
                </figure>
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
export class InteractiveBrokersInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/ib/1.png",
        "./img/import_instructions/ib/2.png",
        "./img/import_instructions/ib/3.png",
        "./img/import_instructions/ib/4.png",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
