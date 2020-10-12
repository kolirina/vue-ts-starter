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
import {DividendNewsItem} from "../../services/eventService";
import {TableHeader} from "../../types/types";
import {SortUtils} from "../../utils/sortUtils";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="dividendNewsHeaders" :items="dividendNews" item-key="id" :custom-sort="customSortNews"
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
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortname }}</td>
                    <td class="text-xs-right">{{ props.item.meetDate | date }}</td>
                    <td class="text-xs-right">{{ props.item.cutDate | date }}</td>
                    <td class="text-xs-right ii-number-cell">
                        {{ props.item.recCommonValue | number }}
                        <span class="amount__currency">{{ props.item.currency | currencySymbolByCurrency }}</span>
                        <span title="Доходность относительно текущей цены">({{ props.item.yield }} %)</span>
                    </td>
                    <td class="text-xs-center pr-3">{{ props.item.source }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendNewsTable extends UI {

    @Prop({default: [], required: true})
    private dividendNews: DividendNewsItem[];

    /** Заголовки таблицы Дивидендные новости */
    private dividendNewsHeaders: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "50"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Дата собрания акционеров", align: "right", value: "meetDate", width: "70"},
        {text: "Закрытие реестра", align: "right", value: "cutDate", width: "70"},
        {text: "Размер возможных дивидендов", align: "right", value: "recCommonValue", width: "60", tooltip: "Доходность рассчитана относительно текущей цена акции."},
        {text: "Источник", align: "center", value: "source", sortable: false, width: "70"}
    ];

    private customSortNews(items: DividendNewsItem[], index: string, isDesc: boolean): DividendNewsItem[] {
        return SortUtils.customSortNews(items, index, isDesc);
    }
}
