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

import {Component, Prop, UI} from "../../app/ui";
import {ShareEvent} from "../../services/eventService";
import {BigMoney} from "../../types/bigMoney";
import {TableHeader} from "../../types/types";
import {SortUtils} from "../../utils/sortUtils";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="bondNewsHeaders" :items="bondNews" item-key="id" :custom-sort="customSortNews"
                      class="data-table dividend-news-table events-table" hide-actions must-sort>
            <template #headerCell="props">
                <v-tooltip v-if="props.header.tooltip" content-class="custom-tooltip-wrap" bottom>
                    <template #activator="{ on }">
                        <span class="data-table__header-with-tooltip" v-on="on">
                            {{ props.header.text }}
                        </span>
                    </template>
                    <span>
                        {{ props.header.tooltip }}
                    </span>
                </v-tooltip>
                <span v-else>
                    {{ props.header.text }}
                </span>
            </template>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left pl-30">
                        <stock-link :ticker="props.item.share.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.share.name }}</td>
                    <td class="text-xs-right">{{ props.item.type | operationDesc }}</td>
                    <td class="text-xs-right">{{ props.item.amountPerShare | amount(true) }} {{ props.item.amountPerShare | currencySymbol }}</td>
                    <td class="text-xs-right">
                        <template v-if="showOriginalAmount(props.item)">
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <template #activator="{ on }">
                                    <span class="data-table__header-with-tooltip" v-on="on">
                                        {{ props.item.totalAmount | amount(true, 2, true, true) }}&nbsp;
                                        <span>{{ props.item.totalAmount | currencySymbol }}</span>
                                    </span>
                                </template>
                                <span>
                                    В валюте бумаги:
                                    {{ props.item.totalAmountOriginal | amount(true, 2, true, true) }}&nbsp;
                                    <span>{{ props.item.totalAmountOriginal | currencySymbol }}</span>
                                </span>
                            </v-tooltip>
                        </template>
                        <template v-else>
                            {{ props.item.totalAmount | amount(true, 2, true, true) }} {{ props.item.totalAmount | currencySymbol }}
                        </template>
                    </td>
                    <td class="text-xs-right">{{ props.item.date | date }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class BondNewsTable extends UI {

    @Prop({default: [], required: true})
    private bondNews: ShareEvent[];

    /** Заголовки таблицы Новости по облигациям */
    private bondNewsHeaders: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "60"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Событие", align: "right", value: "type", width: "100"},
        {text: "На 1 бумагу", align: "right", value: "amountPerShare", width: "100"},
        {text: "Всего", align: "right", value: "totalAmount", width: "150", tooltip: "Сумма выплаты"},
        {text: "Дата", align: "center", value: "date", sortable: false, width: "70"},
    ];

    private showOriginalAmount(event: ShareEvent): boolean {
        return event.totalAmountOriginal && new BigMoney(event.totalAmountOriginal).currency !== new BigMoney(event.totalAmount).currency;
    }

    private customSortNews(items: ShareEvent[], index: string, isDesc: boolean): ShareEvent[] {
        return SortUtils.customSortEvents(items, index, isDesc);
    }
}
