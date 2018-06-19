import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/UI";
import {TableHeader, AssetRow} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="assets" hide-actions class="elevation-1">
            <template slot="items" slot-scope="props">
                <td>{{ assetDesc(props.item.type) }}</td>
                <td class="text-xs-right">{{ props.item.currCost | amount(true) }}</td>
                <td class="text-xs-right">{{ props.item.profit | amount(true) }}</td>
                <td class="text-xs-right">{{ props.item.percCurrShare | number }}</td>
                <td class="justify-center layout px-0">
                    <v-btn icon class="mx-0">
                        <v-icon color="teal">edit</v-icon>
                    </v-btn>
                    <v-btn icon class="mx-0">
                        <v-icon color="pink">delete</v-icon>
                    </v-btn>
                </td>
            </template>
        </v-data-table>
    `
})
export class AssetTable extends UI {

    private headers: TableHeader[] = [
        {text: 'Актив', sortable: false, value: 'name'},
        {text: 'Текущая стоимость', align: 'center', value: 'currCost'},
        {text: 'Прибыль', align: 'center', value: 'profit'},
        {text: 'Текущая доля', align: 'center', value: 'percCurrShare'},
        {text: 'Действия', align: 'center', value: 'name', sortable: false}
    ];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    private assetDesc(type: string): string {
        switch (type) {
            case 'STOCK':
                return 'Акции';
            case 'BOND':
                return 'Облигации';
            case 'RUBLES':
                return 'Рубли';
            case 'DOLLARS':
                return 'Доллары';
        }
        throw new Error('Неизвестный тип актива: ' + type);
    }
}
