import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/UI";
import {StockPortfolioRow, TableHeader} from '../types/types';
import {StockRowInfoDialog} from "./dialogs/stockRowInfoDialog";

@Component({
    // language=Vue
    template: `        
        <div>
            <v-data-table :headers="headers" :items="rows" item-key="ticker" :loading="loading" hide-actions>
                <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
                <template slot="items" slot-scope="props">
                    <tr @click="props.expanded = !props.expanded">
                        <td>{{ props.item.stock.shortname }}</td>
                        <td>{{ props.item.stock.ticker }}</td>
                        <td class="text-xs-right">{{ props.item.avgBuy | amount }}</td>
                        <td class="text-xs-right">{{ props.item.currPrice| amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.currCost| amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.profit| amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.percProfit | number }}</td>
                        <td class="text-xs-right">{{ props.item.percCurrShare | number }}</td>
                        <td class="justify-center layout px-0">
                            <v-btn icon class="mx-0" @click.stop="showInfo(props.item)">
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
                        <v-card-text>Штуки тут</v-card-text>
                    </v-card>
                </template>
            </v-data-table>

            <stock-row-info-dialog :item="selected" v-model="showed"></stock-row-info-dialog>
        </div>
    `,
    components: {StockRowInfoDialog}
})
export class StockTable extends UI {

    private selected: StockPortfolioRow = null;

    private showed = false;

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
    private rows: StockPortfolioRow[];

    @Prop({default: false})
    private loading: boolean;

    private showInfo(selected: StockPortfolioRow): void {
        this.selected = selected;
        this.showed = true;
    }
}
