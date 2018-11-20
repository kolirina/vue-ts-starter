import Component from "vue-class-component";
import {TableHeader, TradeRow} from "../../types/types";
import {TradeUtils} from "../../utils/tradeUtils";
import {CustomDialog} from "./customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="750px">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title>Сделки по бумаге <b>{{ data.ticker }}</b></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click.native="close">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <v-data-table :headers="headers" :items="data.trades" item-key="id" hide-actions>
                        <template slot="items" slot-scope="props">
                            <tr @click="props.expanded = !props.expanded">
                                <td>{{ props.item.operationLabel }}</td>
                                <td class="text-xs-center">{{ props.item.date | date }}</td>
                                <td class="text-xs-right">{{ props.item.quantity }}</td>
                                <td class="text-xs-right">{{ getPrice(props.item) }}</td>
                                <td class="text-xs-right">{{ getFee(props.item) }}</td>
                                <td class="text-xs-right">{{ props.item.signedTotal | amount(true) }}</td>
                            </tr>
                        </template>

                        <template slot="expand" slot-scope="props">
                            <v-card flat>
                                <v-card-text>{{ props.item.comment }}</v-card-text>
                            </v-card>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class ShareTradesDialog extends CustomDialog<ShareTradesDialogData, void> {

    private headers: TableHeader[] = [
        {text: "Операция", align: "left", value: "operationLabel"},
        {text: "Дата", align: "center", value: "date"},
        {text: "Количество", align: "right", value: "quantity", sortable: false},
        {text: "Цена", align: "right", value: "price", sortable: false},
        {text: "Комиссия", align: "right", value: "fee"},
        {text: "Итого", align: "right", value: "signedTotal"}
    ];

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

export type ShareTradesDialogData = {
    trades: TradeRow[],
    ticker: string
};
