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
            Перейдите в online-терминал. Перейдите на вкладку <b>Сделки</b>

            Для получения отчета нажмите Экспорт в Excel<br>
            Полученный файл используйте для импорта.

            <div class="import-instructions__gallery">
                <figure>
                    <img :src="IMAGES[0]" alt="0" @click.stop="openImageDialog">
                </figure>
            </div>
        </div>
    `
})
export class FreedomFinanceInstruction extends UI {

    private IMAGES: string[] = [
        "./img/import_instructions/freedom_finance/1.png",
    ];

    private async openImageDialog(): Promise<void> {
        await new ImageDialog().show((event as any).target.attributes[0].nodeValue);
    }
}
