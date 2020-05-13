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

/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import {Component, Prop, UI} from "../../app/ui";
import {DealImportError} from "../../services/importService";
import {TableHeader} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="errorItems" class="data-table" hide-actions must-sort>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-center"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                    <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                    <td class="text-xs-left error-message">{{ props.item.message }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class ImportErrorsTable extends UI {

    @Prop({type: Array, required: true})
    private errorItems: DealImportError[];

    /** Заголовки таблицы с ошибками */
    private headers: TableHeader[] = [
        {text: "Дата", align: "center", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "center", value: "message", sortable: false}
    ];
}
