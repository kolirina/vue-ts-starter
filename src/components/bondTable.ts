import Component from 'vue-class-component';
import {Prop} from 'vue-property-decorator';
import {UI} from '../app/UI';
import {BondPortfolioRow, TableHeader} from '../types/types';

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
                    <td class="justify-center layout px-0">
                        <v-btn icon class="mx-0">
                            <v-icon color="teal">edit</v-icon>
                        </v-btn>
                        <v-btn icon class="mx-0">
                            <v-icon color="pink">delete</v-icon>
                        </v-btn>
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
        {text: 'Действия', align: 'right', value: 'actions'}
    ];

    @Prop({default: [], required: true})
    private rows: BondPortfolioRow[];

    @Prop({default: false})
    private loading: boolean;
}
