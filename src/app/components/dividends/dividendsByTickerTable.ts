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
import {Prop} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {DividendInfo} from "../../services/dividendService";
import {TableHeader} from "../../types/types";
import {TradeUtils} from "../../utils/tradeUtils";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="ticker" :custom-sort="customSort" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #headerCell="props">
                <v-tooltip v-if="props.header.tooltip" content-class="custom-tooltip-wrap" bottom>
                    <template #activator="{ on }">
                        <span>
                            {{ props.header.text }}
                        </span>
                        <sup class="custom-tooltip" v-on="on">
                            <v-icon>fas fa-info-circle</v-icon>
                        </sup>
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
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortName }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.amount | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByTickerTable extends UI {

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "45"},
        {text: "Компания", align: "left", value: "shortName", width: "120"},
        {text: "Сумма", align: "right", value: "amount", width: "65"},
        {
            text: "Доходность, %",
            align: "right",
            value: "yield",
            width: "80",
            tooltip: "Дивидендная доходность за все время владения акцией посчитанная по отношению к инвестированным в нее средствам."
        },
    ];

    @Prop({default: [], required: true})
    private rows: DividendInfo[];

    private customSort(items: DividendInfo[], index: string, isDesc: boolean): DividendInfo[] {
        return TradeUtils.simpleSort(items, index, isDesc);
    }
}
