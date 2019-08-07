import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {AssetRow, Pagination, Portfolio, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="assets" :custom-sort="customSort" :pagination.sync="pagination" hide-actions must-sort>
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
                    <td class="text-xs-left">{{ props.item.type | assetDesc }}</td>
                    <td class="text-xs-right ii-number-cell" v-tariff-expired-hint>{{ props.item.currCost | amount(true) }}</td>
                    <td :class="markupClasses(amount(props.item.profit))" v-tariff-expired-hint>
                        {{ props.item.profit | amount(true) }}
                    </td>
                    <td :class="markupClasses(amount(props.item.dailyPl))" v-tariff-expired-hint>{{ props.item.dailyPl | amount(true) }}</td>
                    <td :class="markupClasses(Number(props.item.dailyPlPercent))" v-tariff-expired-hint>{{ props.item.dailyPlPercent | number }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" flat icon dark>
                                <span class="menuDots"></span>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.DEPOSIT)">
                                    <v-list-tile-title>
                                        Внести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click="openTradeDialog(props.item, operation.WITHDRAW)">
                                    <v-list-tile-title>
                                        Вывести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isStockTrade(props.item)" @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                    <v-list-tile-title>
                                        Дивиденд
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isBondTrade(props.item)" @click="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        Купон
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
export class AssetTable extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    private headers: TableHeader[] = [
        {text: "Актив", sortable: false, align: "left", value: "name"},
        {text: "Текущая стоимость", align: "right", value: "currCost"},
        {
            text: "Прибыль",
            align: "right",
            value: "profit",
            tooltip: "Прибыль, образованная активами данного типа за все время. Она включает в себя: прибыль от совершенных " +
                "                        ранее сделок (бумага куплена дешевле и продана дороже), выплаченные дивиденды и купоны, " +
                "                        курсовую прибыль (бумага куплена дешевле и подорожала, но еще не продана)."
        },
        {text: "Изменение за день", align: "right", value: "dailyPl"},
        {text: "Изменение за день, %", align: "right", value: "dailyPlPercent"},
        {text: "Текущая доля", align: "right", value: "percCurrShare"},
        {text: "", align: "center", value: "actions", sortable: false, width: "25"}
    ];
    /** Паджинация для задания дефолтной сортировки */
    private pagination: Pagination = {
        descending: false,
        sortBy: "percCurrShare",
        rowsPerPage: -1
    };

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    private operation = Operation;

    private async openTradeDialog(assetRow: AssetRow, operation: Operation): Promise<void> {
        const assetType = PortfolioAssetType.valueByName(assetRow.type);
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            operation,
            moneyCurrency: assetType.currency ? assetType.currency.code : null,
            assetType: assetType.assetType
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private amount(value: string): number {
        if (!value) {
            return 0.00;
        }
        const amount = new BigMoney(value);
        return amount.amount.toNumber();
    }

    private isBondTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.BOND;
    }

    private isStockTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.STOCK;
    }

    private isMoneyTrade(item: AssetRow): boolean {
        return PortfolioAssetType.valueByName(item.type).assetType === AssetType.MONEY;
    }

    private customSort(items: AssetRow[], index: string, isDesc: boolean): AssetRow[] {
        return SortUtils.simpleSort(items, index, isDesc);
    }

    private markupClasses(amount: number): string[] {
        return TradeUtils.markupClasses(amount);
    }
}
