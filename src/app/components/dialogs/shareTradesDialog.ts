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
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="headline">Сделки по бумаге <b>{{ data.ticker }}</b></span>
                    <v-spacer></v-spacer>
                </v-card-title>
                <v-card-text>
                    <v-data-table :headers="headers" :items="data.trades" item-key="id" hide-actions>
                        <template #items="props">
                            <tr class="selectable" @click="props.expanded = !props.expanded">
                                <td>{{ props.item.operationLabel }}</td>
                                <td class="text-xs-center">{{ props.item.date | date }}</td>
                                <td class="text-xs-right">{{ props.item.quantity }}</td>
                                <td class="text-xs-right">{{ getPrice(props.item) }}</td>
                                <td class="text-xs-right">{{ getFee(props.item) }}</td>
                                <td class="text-xs-right">{{ props.item.signedTotal | amount(true) }}</td>
                            </tr>
                        </template>

                        <template #expand="props">
                            <v-card flat>
                                <v-card-text>{{ props.item.comment }}</v-card-text>
                            </v-card>
                        </template>
                    </v-data-table>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" dark @click.native="close">OK</v-btn>
                </v-card-actions>
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
