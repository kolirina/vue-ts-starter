import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {PortfolioParams} from "../services/portfolioService";
import {TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="portfolios" item-key="id" hide-actions @click.stop must-sort>
            <template #items="props">
                <tr class="selectable">
                    <td>
                        <v-checkbox v-model="props.item.combined" @change="onSetCombined(props.item)" hide-details></v-checkbox>
                    </td>
                    <td class="text-xs-left table-text-word-break">{{ props.item.name }}</td>
                    <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                    <td class="text-xs-left">{{ props.item.type }}</td>
                    <td class="text-xs-right">{{ props.item.openDate }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class CombinedPortfoliosTable extends UI {

    private headers: TableHeader[] = [
        {text: "", align: "center", value: "combined", width: "50", sortable: false},
        {text: "Название", align: "left", value: "name"},
        {text: "Валюта", align: "center", value: "viewCurrency", width: "80"},
        {text: "Тип счета", align: "left", value: "type", width: "100"},
        {text: "Дата открытия", align: "right", value: "openDate", width: "100"}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];

    private onSetCombined(portfolioParams: PortfolioParams): void {
        this.$emit("change", {id: portfolioParams.id, combined: portfolioParams.combined});
    }
}
