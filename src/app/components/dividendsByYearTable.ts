import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {DividendsByYearRow} from "../services/dividendService";
import {TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="year" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left">{{ props.item.year }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.dividendsAmount | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.portfolioCosts | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByYearTable extends UI {

    private headers: TableHeader[] = [
        {text: "Год", align: "left", value: "year"},
        {text: "Сумма", align: "right", value: "dividendsAmount"},
        {text: "Стоимость портфеля", align: "right", value: "portfolioCosts"},
        {text: "Прибыль за год, %", align: "right", value: "yield"},
    ];

    @Prop({default: [], required: true})
    private rows: DividendsByYearRow[];
}
