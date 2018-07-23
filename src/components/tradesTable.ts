import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {UI} from '../app/UI';
import {AssetType} from '../types/assetType';
import {Operation} from '../types/operation';
import {TableHeader, TradeRow} from '../types/types';
import {StoreType} from '../vuex/storeType';
import {AddTradeDialog} from './dialogs/addTradeDialog';
import {ConfirmDialog} from './dialogs/confirmDialog';
import {BtnReturn} from './dialogs/customDialog';

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="trades" item-key="id" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>
                        <router-link v-if="props.item.asset === 'STOCK'" :to="{name: 'share-info', params: {ticker: props.item.ticker}}">{{ props.item.ticker }}
                        </router-link>
                        <router-link v-if="props.item.asset === 'BOND'" :to="{name: 'bond-info', params: {isin: props.item.ticker}}">{{ props.item.ticker }}
                        </router-link>
                        <span v-if="props.item.asset === 'MONEY'">{{ props.item.ticker }}</span>
                    </td>
                    <td>{{ props.item.companyName }}</td>
                    <td>{{ props.item.operationLabel }}</td>
                    <td class="text-xs-center">{{ props.item.date | date('L') }}</td>
                    <td class="text-xs-right">{{ props.item.quantity }}</td>
                    <td class="text-xs-right">{{ props.item.price | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.fee | amount(true) }}</td>
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
                                <v-list-tile @click="deleteAllTrades(props.item)">
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
        </v-data-table>
    `
})
export class TradesTable extends UI {

    private headers: TableHeader[] = [
        {text: 'Тикер/ISIN', align: 'left', sortable: false, value: 'ticker'},
        {text: 'Название', align: 'left', value: 'name'},
        {text: 'Операция', align: 'left', value: 'operationLabel'},
        {text: 'Дата', align: 'center', value: 'date'},
        {text: 'Количество', align: 'right', value: 'quantity', sortable: false},
        {text: 'Цена', align: 'right', value: 'price', sortable: false},
        {text: 'Комиссия', align: 'right', value: 'fee'},
        {text: 'Итого', align: 'right', value: 'signedTotal'}
    ];

    @Prop({default: [], required: true})
    private trades: TradeRow[];

    private operation = Operation;

    private async openTradeDialog(tradeRow: TradeRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: null,
            operation,
            assetType: AssetType.STOCK
        });
    }

    private async deleteAllTrades(tradeRow: TradeRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            console.log('TODO DELETE ALL TRADES');
        }
    }

    private async deleteTrade(tradeRow: TradeRow): Promise<void> {
        console.log('TODO DELETE TRADE', tradeRow);
    }
}
