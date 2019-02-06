import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {TableHeadersState, TablesService} from "../services/tablesService";
import {TradeFields} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {Portfolio, TableHeader, TablePagination, TradeRow} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="trades" item-key="id" :pagination.sync="tradePagination.pagination"
                      :total-items="tradePagination.totalItems" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>
                        <v-icon class="data-table-cell" v-bind:class="{'data-table-cell-open': props.expanded}">play_arrow</v-icon>
                    </td>
                    <td v-if="tableHeadersState.ticker">
                        <stock-link v-if="props.item.asset === 'STOCK'" :ticker="props.item.ticker"></stock-link>
                        <bond-link v-if="props.item.asset === 'BOND'" :ticker="props.item.ticker"></bond-link>
                        <span v-if="props.item.asset === 'MONEY'">{{ props.item.ticker }}</span>
                    </td>
                    <td v-if="tableHeadersState.name">{{ props.item.companyName }}</td>
                    <td v-if="tableHeadersState.operationLabel">{{ props.item.operationLabel }}</td>
                    <td v-if="tableHeadersState.date" class="text-xs-center">{{ props.item.date | date }}</td>
                    <td v-if="tableHeadersState.quantity" class="text-xs-right ii-number-cell">{{ props.item.quantity }}</td>
                    <td v-if="tableHeadersState.price" class="text-xs-right ii-number-cell">{{ getPrice(props.item) }}</td>
                    <td v-if="tableHeadersState.facevalue">{{ props.item.facevalue }}</td>
                    <td v-if="tableHeadersState.nkd">{{ props.item.nkd }}</td>
                    <td v-if="tableHeadersState.fee" class="text-xs-right ii-number-cell">{{ getFee(props.item) }}</td>
                    <td v-if="tableHeadersState.signedTotal" class="text-xs-right ii-number-cell">{{ props.item.signedTotal | amount(true) }}</td>
                    <td v-if="tableHeadersState.totalWithoutFee" class="text-xs-right ii-number-cell">{{ props.item.totalWithoutFee | amount }}</td>
                    <td v-if="props.item.parentTradeId" class="justify-center px-0" @click.stop>
                        <v-tooltip :max-width="250" top>
                            <a slot="activator">
                                <v-icon color="primary" small>fas fa-link</v-icon>
                            </a>
                            <span>
                                Это связанная сделка, отредактируйте основную сделку для изменения.
                            </span>
                        </v-tooltip>
                    </td>
                    <td v-else class="justify-center px-0" @click.stop="openEditTradeDialog(props.item)">
                        <a>
                            <v-icon color="primary" small>fas fa-pencil-alt</v-icon>
                        </a>
                    </td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="!isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.DEPOSIT)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Внести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.WITHDRAW)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Вывести
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.INCOME)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>far fa-grin-beam</v-icon>
                                        Доход
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isMoneyTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.LOSS)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>far fa-sad-tear</v-icon>
                                        Расход
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isStockTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.DIVIDEND)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Дивиденд
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isBondTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isBondTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.AMORTIZATION)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                        Амортизация
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile v-if="isBondTrade(props.item)" @click.stop="openTradeDialog(props.item, operation.REPAYMENT)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-recycle</v-icon>
                                        Погашение
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click="deleteTrade(props.item)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>

            <template slot="expand" slot-scope="props">
                <v-card flat>
                    <v-card-text>{{ props.item.note }}</v-card-text>
                </v-card>
            </template>

            <template slot="no-data">
                <v-alert :value="true" color="info" icon="info">
                    {{ tradePagination.totalItems ? "Ничего не найдено" : "Добавьте свою первую сделку и она отобразится здесь"}}
                </v-alert>
            </template>
        </v-data-table>
    `
})
export class TradesTable extends UI {

    @Inject
    private tablesService: TablesService;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    @Prop()
    private headers: TableHeader[];

    @Prop({default: [], required: true})
    private trades: TradeRow[];

    @Prop({required: true, type: Object})
    private tradePagination: TablePagination;

    private tableHeadersState: TableHeadersState;

    /** Текущая операция */
    private operation = Operation;

    beforeMount(): void {
        /** Установка состояния заголовков таблицы */
        this.setHeadersState();
    }

    @Watch("headers")
    onHeadersChange(): void {
        this.setHeadersState();
    }

    setHeadersState(): void {
        this.tableHeadersState = this.tablesService.getHeadersState(this.headers);
    }

    @Watch("trades")
    private onTradesUpdate(trades: TradeRow[]): void {
        this.trades = trades;
    }

    private async openTradeDialog(trade: TradeRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: null,
            operation,
            assetType: AssetType.valueByName(trade.asset)
        });
    }

    private async openEditTradeDialog(trade: TradeRow): Promise<void> {
        const tradeFields: TradeFields = {
            ticker: trade.ticker,
            date: trade.date,
            quantity: trade.quantity,
            price: this.moneyPrice(trade) ? TradeUtils.decimal(trade.moneyPrice) : this.percentPrice(trade) ? trade.bondPrice : null,
            facevalue: trade.facevalue,
            nkd: trade.nkd,
            perOne: null,
            fee: BigMoney.isEmptyOrZero(trade.fee) ? null : trade.fee,
            note: trade.note,
            keepMoney: CommonUtils.exists(trade.moneyTradeId),
            moneyAmount: trade.signedTotal,
            currency: trade.currency
        };
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            assetType: AssetType.valueByName(trade.asset),
            operation: Operation.valueByName(trade.operation),
            tradeFields: tradeFields,
            tradeId: trade.id,
            editedMoneyTradeId: trade.moneyTradeId
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async deleteTrade(tradeRow: TradeRow): Promise<void> {
        this.$emit("delete", tradeRow);
    }

    private getPrice(trade: TradeRow): string {
        return TradeUtils.getPrice(trade);
    }

    private getFee(trade: TradeRow): string {
        return TradeUtils.getFee(trade);
    }

    private percentPrice(trade: TradeRow): boolean {
        return TradeUtils.percentPrice(trade);
    }

    private moneyPrice(trade: TradeRow): boolean {
        return TradeUtils.moneyPrice(trade);
    }

    private isBondTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.BOND;
    }

    private isStockTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.STOCK;
    }

    private isMoneyTrade(trade: TradeRow): boolean {
        return AssetType.valueByName(trade.asset) === AssetType.MONEY;
    }
}
