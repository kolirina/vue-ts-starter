import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/UI";
import {PortfolioParams, TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="portfolios" item-key="id" hide-actions>
            <template slot="items" slot-scope="props">
                <tr>
                    <td>
                        <v-checkbox v-model="props.item.combined"></v-checkbox>
                    </td>
                    <td class="text-xs-left">{{ props.item.name }}</td>
                    <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                    <td class="text-xs-center">{{ props.item.type }}</td>
                    <td class="text-xs-center">{{ props.item.openDate }}</td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class CombinedPortfoliosTable extends UI {

    private headers: TableHeader[] = [
        {text: 'Выбран', align: 'center', value: 'combined'},
        {text: 'Название', align: 'center', value: 'name'},
        {text: 'Валюта', align: 'center', value: 'viewCurrency'},
        {text: 'Тип счета', align: 'center', value: 'type'},
        {text: 'Дата открытия', align: 'center', value: 'openDate'}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioParams[];
}
