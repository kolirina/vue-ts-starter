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
import {SortUtils} from "../../utils/sortUtils";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="year" :custom-sort="customSort" hide-actions expand must-sort>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
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
                <tr class="selectable" @dblclick="props.expanded = !props.expanded">
                    <v-layout justify-center align-center class="h40">
                        <span @click="props.expanded = !props.expanded" class="data-table-cell" :class="{'data-table-cell-open': props.expanded, 'path': true}"></span>
                    </v-layout>
                    <td class="text-xs-left">{{ props.item.year }}</td>
                    <td class="text-xs-right ii-number-cell">
                        {{ props.item.totalAmount | amount(true) }}&nbsp;<span class="second-value">{{ props.item.totalAmount | currencySymbol }}</span>
                    </td>
                    <td class="text-xs-right ii-number-cell">
                        {{ props.item.portfolioCosts | amount(true) }}&nbsp;<span class="second-value">{{ props.item.portfolioCosts | currencySymbol }}</span>
                    </td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}&nbsp;<span class="second-value">%</span></td>
                </tr>
            </template>

            <template #expand="props">
                <table class="ext-info selectable" @click.stop>
                    <tr>
                        <td>
                            <div class="ext-info__item">
                                Получено дивидендов {{ props.item.dividendsAmount | amount(true) }} <span>{{ props.item.dividendsAmount | currencySymbol }}</span><br>
                                Стоимость бумаг {{ props.item.stocksAndAssetsCost | amount(true) }} <span>{{ props.item.stocksAndAssetsCost | currencySymbol }}</span><br>
                                Прибыль за год {{ props.item.dividendsYield }} <span>%</span><br>
                            </div>
                        </td>
                        <td>
                            <div class="ext-info__item">
                                Получено купонов {{ props.item.couponsAmount | amount(true) }} <span>{{ props.item.dividendsAmount | currencySymbol }}</span><br>
                                Стоимость бумаг {{ props.item.bondsCost | amount(true) }} <span>{{ props.item.bondsCost | currencySymbol }}</span><br>
                                Прибыль за год {{ props.item.couponsYield }} <span>%</span><br>
                            </div>
                        </td>
                    </tr>
                </table>
            </template>
        </v-data-table>
    `
})
export class DividendsByYearTable extends UI {

    private headers: TableHeader[] = [
        {text: "", align: "left", ghost: true, sortable: false, value: "", active: true, width: "50"},
        {text: "Год", align: "left", value: "year", width: "50"},
        {text: "Сумма", align: "right", value: "totalAmount", width: "65"},
        {text: "Стоимость портфеля", align: "right", value: "portfolioCosts", width: "80"},
        {
            text: "Прибыль за год, %",
            align: "right",
            value: "yield",
            width: "80",
            tooltip: "Прибыль от полученных за год начислений, посчитанная по отношению к стоимости портфеля на конец года " +
                "                                или к текущей стоимости если год еще не закончился."
        },
    ];

    @Prop({default: [], required: true})
    private rows: DividendsByYearRow[];

    private customSort(items: DividendInfo[], index: string, isDesc: boolean): DividendInfo[] {
        return SortUtils.simpleSort(items, index, isDesc);
    }
}
