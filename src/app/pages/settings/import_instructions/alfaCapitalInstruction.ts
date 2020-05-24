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
            Перейдите в личный кабинет брокера, и выберите пункт История операций.<br>
            Выберите тип отчета <b>Сделки</b> Настройте параметры отчета:

            <ul>
                <li>Укажите договор или оставте пункт Все договоры</li>
                <li>Начало периода</li>
                <li>Окончание периода</li>
                <li>Нажмите кнопку Скачать XLS</li>
            </ul>

            Полученный файл используйте для импорта.<br>
            Будут импортированы сделки по бумагам,
            движения ДС (связанные с вводом/выводом на счет, налоги и расходы не связанные напрямую со сделками).

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="3" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class AlfaCapitalInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/alfacapital/ak.png",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
