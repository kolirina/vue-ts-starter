import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {DividendInfo} from "../services/dividendService";
import {TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="ticker" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortName }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.amount | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByTickerTable extends UI {

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Компания", align: "left", value: "shortName"},
        {text: "Сумма", align: "right", value: "amount"},
        {text: "Доходность, %", align: "right", value: "yield"},
    ];

    @Prop({default: [], required: true})
    private rows: DividendInfo[];
}
