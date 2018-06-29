import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/UI";
import {TableHeader, TradeRow} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="trades" item-key="id" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td>
                        <router-link v-if="props.item.companyName" :to="{name: 'share-info', params: {ticker: props.item.ticker}}">{{ props.item.ticker }}</router-link>
                        <span v-else>{{ props.item.ticker }}</span>
                    </td>
                    <td>{{ props.item.companyName }}</td>
                    <td>{{ props.item.operationLabel }}</td>
                    <td class="text-xs-center">{{ props.item.date | date('L') }}</td>
                    <td class="text-xs-right">{{ props.item.quantity }}</td>
                    <td class="text-xs-right">{{ props.item.price | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.fee | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.signedTotal | amount(true) }}</td>
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
}
