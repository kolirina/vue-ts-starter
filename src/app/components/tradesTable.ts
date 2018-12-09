import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../app/ui";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {TableHeader, TablePagination, TradeRow} from "../types/types";
import {TradeUtils} from "../utils/tradeUtils";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="trades" item-key="id" :pagination.sync="tradePagination.pagination"
                      :total-items="tradePagination.totalItems"
                      :loading="tradePagination.loading" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>
                        <stock-link v-if="props.item.asset === 'STOCK'" :ticker="props.item.ticker"></stock-link>
                        <bond-link v-if="props.item.asset === 'BOND'" :ticker="props.item.ticker"></bond-link>
                        <span v-if="props.item.asset === 'MONEY'">{{ props.item.ticker }}</span>
                    </td>
                    <td>{{ props.item.companyName }}</td>
                    <td>{{ props.item.operationLabel }}</td>
                    <td class="text-xs-center">{{ props.item.date | date }}</td>
                    <td class="text-xs-right">{{ props.item.quantity }}</td>
                    <td class="text-xs-right">{{ getPrice(props.item) }}</td>
                    <td class="text-xs-right">{{ getFee(props.item) }}</td>
                    <td class="text-xs-right">{{ props.item.signedTotal | amount(true) }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.BUY)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-plus</v-icon>
                                        Купить
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.SELL)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-minus</v-icon>
                                        Продать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.DIVIDEND)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Дивиденд
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.COUPON)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                        Купон
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.AMORTIZATION)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                        Амортизация
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-list-tile @click.stop="openTradeDialog(props.item, operation.REPAYMENT)">
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
                    <v-card-text>{{ props.item.comment }}</v-card-text>
                </v-card>
            </template>

            <template slot="no-data">
                <v-alert :value="true" color="info" icon="info">
                    Добавьте свою первую сделку и она отобразится здесь
                </v-alert>
            </template>
        </v-data-table>
    `
})
export class TradesTable extends UI {

    private headers: TableHeader[] = [
        {text: "Тикер/ISIN", align: "left", value: "ticker"},
        {text: "Название", align: "left", value: "name"},
        {text: "Операция", align: "left", value: "operationLabel"},
        {text: "Дата", align: "center", value: "date"},
        {text: "Количество", align: "right", value: "quantity", sortable: false},
        {text: "Цена", align: "right", value: "price", sortable: false},
        {text: "Комиссия", align: "right", value: "fee"},
        {text: "Итого", align: "right", value: "signedTotal"},
        {text: "Действия", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private trades: TradeRow[];

    @Prop({required: true, type: Object})
    private tradePagination: TablePagination;

    /** Текущая операция */
    private operation = Operation;

    @Watch("trades")
    private onTradesUpdate(trades: TradeRow[]): void {
        this.trades = trades;
    }

    private async openTradeDialog(tradeRow: TradeRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: null,
            operation,
            assetType: AssetType.STOCK
        });
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
}
