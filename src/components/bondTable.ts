import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {UI} from '../app/UI';
import {BondPortfolioRow, TableHeader} from '../types/types';
import {Operation} from "../types/operation";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {StoreType} from "../vuex/storeType";
import {AssetType} from "../types/assetType";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="rows" item-key="id" :loading="loading" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>{{ props.item.bond.shortname }}</td>
                    <td>{{ props.item.bond.ticker }}</td>
                    <td class="text-xs-right">{{ props.item.avgBuy | number }}</td>
                    <td class="text-xs-right">{{ props.item.currPrice | number }}</td>
                    <td class="text-xs-right">{{ props.item.currCost | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.profit | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.percProfit | number }}</td>
                    <td class="text-xs-right">{{ props.item.percCurrShare | number }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-list-alt</v-icon>
                                        Все сделки
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
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
                    <v-card-text>
                        <v-container grid-list-md>
                            <v-layout wrap>
                                <v-flex :d-block="true">
                                    <span>ISIN:</span>{{ props.item.bond.isin }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>След. купон:</span>{{ props.item.bond.nexcoupon | amount(true) }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>Купон:</span>{{ props.item.bond.couponvalue | amount(true) }}
                                </v-flex>
                                <v-flex v-if="!props.item.bond.isRepaid">
                                    <span>НКД:</span>{{ props.item.bond.accruedint | amount(true) }}
                                </v-flex>
                                <v-flex v-if="props.item.bond.isRepaid">
                                    <span>Статус: Погашена</span>
                                </v-flex>
                                <v-flex>
                                    {{ 'Дата погашения:' + props.item.bond.matdate }}
                                </v-flex>
                                <v-flex>
                                    <span>Номинал покупки:</span>{{ props.item.nominal | amount(true) }}
                                </v-flex>
                                <v-flex>
                                    <span>Дисконт:</span>{{ props.item.bond.amortization | amount(true) }}
                                </v-flex>
                                <v-flex>
                                    {{ 'Вы держите бумагу в портфеле:' + props.item.ownedDays + ' дня, c ' + props.item.firstBuy }}
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                </v-card>
            </template>
        </v-data-table>
    `
})
export class BondTable extends UI {

    private headers: TableHeader[] = [
        {text: 'Компания', align: 'left', sortable: false, value: 'company'},
        {text: 'Тикер', align: 'left', value: 'ticker'},
        {text: 'Ср. цена', align: 'right', value: 'avgBuy'},
        {text: 'Тек. цена', align: 'right', value: 'currPrice'},
        {text: 'Тек. стоимость', align: 'right', value: 'currCost', sortable: false},
        {text: 'Прибыль', align: 'right', value: 'profit', sortable: false},
        {text: 'Прибыль, %', align: 'right', value: 'percProfit'},
        {text: 'Тек. доля', align: 'right', value: 'percCurrShare'},
        {text: 'Действия', align: 'right', value: 'actions', sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private rows: BondPortfolioRow[];

    @Prop({default: false})
    private loading: boolean;

    private operation = Operation;

    private async openTradeDialog(bondRow: BondPortfolioRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: bondRow.bond,
            operation,
            assetType: AssetType.BOND
        });
    }

    private async deleteAllTrades(bondRow: BondPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            console.log('TODO DELETE ALL TRADES');
        }
    }
}
