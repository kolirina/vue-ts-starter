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
import {DividendInfo, DividendsByYearRow} from "../../services/dividendService";
import {TableHeader} from "../../types/types";
import {TradeUtils} from "../../utils/tradeUtils";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="year" :custom-sort="customSort" hide-actions>
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
                    <td class="text-xs-left">{{ props.item.year }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.dividendsAmount | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.portfolioCosts | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByYearTable extends UI {

    private headers: TableHeader[] = [
        {text: "Год", align: "left", value: "year", width: "50"},
        {text: "Сумма", align: "right", value: "dividendsAmount", width: "65"},
        {text: "Стоимость портфеля", align: "right", value: "portfolioCosts", width: "80"},
        {
            text: "Прибыль за год, %",
            align: "right",
            value: "yield",
            width: "80",
            tooltip: "Прибыль от полученных за год дивидендов, посчитанная по отношению к стоимости портфеля на конец года " +
                "                                или к текущей стоимости если год еще не закончился."
        },
    ];

    @Prop({default: [], required: true})
    private rows: DividendsByYearRow[];

    private customSort(items: DividendInfo[], index: string, isDesc: boolean): DividendInfo[] {
        return TradeUtils.simpleSort(items, index, isDesc);
    }
}
