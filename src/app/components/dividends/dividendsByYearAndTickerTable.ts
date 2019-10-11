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

import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {DividendInfo, DividendService} from "../../services/dividendService";
import {Portfolio, TableHeader} from "../../types/types";
import {SortUtils} from "../../utils/sortUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ConfirmDialog} from "../dialogs/confirmDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="year" :custom-sort="customSort" hide-actions must-sort>
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
                <tr class="selectable">
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortName }}</td>
                    <td class="text-xs-right">{{ props.item.year }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.quantity | integer }}</td>
                    <td class="text-xs-right ii-number-cell">
                        {{ props.item.perOne | amount(true) }}&nbsp;<span class="second-value">{{ props.item.perOne | currencySymbol }}</span>
                    </td>
                    <td class="text-xs-right ii-number-cell">
                        {{ props.item.amount | amount(true) }}&nbsp;<span class="second-value">{{ props.item.amount | currencySymbol }}</span>
                    </td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}&nbsp;<span class="second-value">%</span></td>

                    <td class="px-0">
                        <v-layout align-center justify-center>
                            <v-menu transition="slide-y-transition" bottom left>
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="deleteAllTrades(props.item)">
                                        <v-list-tile-title class="delete-btn">
                                            Удалить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </v-layout>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByYearAndTickerTable extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @Inject
    private dividendService: DividendService;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "45"},
        {text: "Компания", align: "left", value: "shortName", width: "120"},
        {text: "Год", align: "right", value: "year", width: "30"},
        {text: "Кол-во, шт.", align: "right", value: "quantity", width: "65"},
        {text: "На одну акцию", align: "right", value: "perOne", width: "65"},
        {text: "Сумма", align: "right", value: "amount", width: "65"},
        {text: "Доходность, %", align: "right", value: "yield", width: "80", tooltip: "Дивидендная доходность посчитанная по отношению к исторической цене акции на конец года."},
        {text: "", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private rows: DividendInfo[];

    private async deleteAllTrades(dividendTrade: DividendInfo): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все дивиденды по выбранной акции?`);
        if (result === BtnReturn.YES) {
            await this.deleteAllTradesAndShowMessage(dividendTrade);
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async deleteAllTradesAndShowMessage(dividendTrade: DividendInfo): Promise<void> {
        await this.dividendService.deleteAllTrades({ticker: dividendTrade.ticker, year: dividendTrade.year, portfolioId: this.portfolio.id});
        await this.reloadPortfolio(this.portfolio.id);
        this.$snotify.info(`Все дивидендные сделки по тикеру ${dividendTrade.ticker} были успешно удалены`);
    }

    private customSort(items: DividendInfo[], index: string, isDesc: boolean): DividendInfo[] {
        return SortUtils.simpleSort(items, index, isDesc);
    }
}
