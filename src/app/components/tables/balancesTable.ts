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
import {namespace} from "vuex-class/lib/bindings";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {TradeService} from "../../services/tradeService";
import {BigMoney} from "../../types/bigMoney";
import {Operation} from "../../types/operation";
import {AssetRow, Pagination, Portfolio, StockPortfolioRow, TableHeader} from "../../types/types";
import {SortUtils} from "../../utils/sortUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {ConfirmDialog} from "../dialogs/confirmDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="id" :custom-sort="customSort" :pagination.sync="pagination" hide-actions must-sort>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left"><span>{{ props.item.company}}</span>
                    </td>
                    <td class="text-xs-left">
                        <stock-link v-if="props.item.ticker" :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-right">{{ props.item.quantity | quantity(true) }}</td>
                    <td class="text-xs-right"><span v-if="props.item.type === 'STOCK'">{{ props.item.avgBuy | amount }}</span></td>
                    <td class="text-xs-right">{{ props.item.currCost | amount(true)}}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left min-width="173" nudge-bottom="30">
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
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class BalancesTable extends UI {

    @Inject
    private tradeService: TradeService;

    @MainStore.Getter
    private portfolio: Portfolio;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;

    private balancesTableRow: BalancesTableRow[] = [];

    private operation = Operation;

    private headers: TableHeader[] = [
        {text: "Актив", align: "left", value: "company", width: "80"},
        {text: "Тикер", align: "left", value: "ticker", width: "45"},
        {text: "Количество", align: "right", value: "quantity", width: "60"},
        {text: "Ср. цена", align: "right", value: "avgBuy", width: "60"},
        {text: "Тек. стоимость", align: "right", value: "currCost", width: "65"},
        {text: "", align: "right", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private stocks: StockPortfolioRow[];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    /** Паджинация для задания дефолтной сортировки */
    private pagination: Pagination = {
        descending: false,
        sortBy: "currCost",
        rowsPerPage: -1
    };

    created(): void {
        this.prepareRows();
    }

    private async deleteAllTrades(stockRow: BalancesTableRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.tradeService.deleteAllTrades({
                assetType: "STOCK",
                ticker: stockRow.ticker,
                portfolioId: this.portfolio.id
            });
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    @Watch("portfolio")
    private onPortfolioChange(): void {
        this.prepareRows();
    }

    private get rows(): BalancesTableRow[] {
        return this.balancesTableRow;
    }

    private prepareRows(): void {
        this.balancesTableRow = [];
        for (const row of this.stocks) {
            this.balancesTableRow.push({
                id: row.id,
                type: "STOCK",
                company: row.share.shortname,
                ticker: row.share.ticker,
                quantity: row.quantity,
                avgBuy: row.avgBuy,
                currCost: row.currCost
            });
        }
        for (const row of this.assets) {
            if (row.assetType === "MONEY") {
                const currCost = new BigMoney(row.currCost);
                if (currCost.currency === "EUR") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "EURO",
                        company: "Евро",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                } else if (currCost.currency === "RUB") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "RUBLE",
                        company: "Рубль",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                } else if (currCost.currency === "USD") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "DOLLAR",
                        company: "Доллар США",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                }
            }
        }
    }

    private customSort(items: BalancesTableRow[], index: string, isDesc: boolean): BalancesTableRow[] {
        return SortUtils.simpleSort(items, index, isDesc);
    }
}

type BalancesTableRow = {
    id: string,
    type: string,
    company: string,
    ticker: string,
    quantity: number,
    avgBuy: string,
    currCost: string
};
