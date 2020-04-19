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

import Component from "vue-class-component";
import {UI} from "../../../app/ui";

@Component({
    // language=Vue
    template: `
        <div>
            <div>
                <div class="import-default-text">
                    Перейдите в личный кабинет брокера, и выберите пункт История операций.
                </div>

                <div class="import-default-text">
                    Выберите тип отчета <b>Сделки</b> Настройте параметры отчета:
                </div>
                <div class="import-format-requirements-ul">
                    <ul>
                        <li>Укажите договор или оставте пункт Все договоры</li>
                        <li>Начало периода</li>
                        <li>Окончание периода</li>
                        <li>Нажмите кнопку Скачать XLS</li>
                    </ul>
                </div>

                <v-img :src="IMAGES[0]" max-width="715" class="grey darken-4 image"></v-img>

                <div class="import-default-text">
                    Полученный файл используйте для импорта.<br>
                    Будут импортированы сделки по бумагам,
                    движения ДС (связанные с вводом/выводом на счет, налоги и расходы не связанные напрямую со сделками).
                </div>
            </div>
        </div>
    `
})
export class AlfaCapitalInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/alfacapital/ak.png",
    ];

}
