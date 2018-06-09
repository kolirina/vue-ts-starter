import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/UI";
import {PortfolioRow, TableHeader} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="portfolios" item-key="id" hide-actions>
            <template slot="items" slot-scope="props">
                <tr @click="props.expanded = !props.expanded">
                    <td @click.stop>
                        <v-edit-dialog :return-value.sync="props.item.name" large lazy persistent>
                            <div>{{ props.item.name }}</div>
                            <div slot="input" class="mt-3 title">Редактирование названия</div>
                            <v-text-field slot="input" v-model="props.item.name" :rules="[max25chars]" label="Редактировать" single-line counter autofocus></v-text-field>
                        </v-edit-dialog>
                    </td>
                    <td class="text-xs-right">{{ props.item.fixFee }}</td>
                    <td class="text-xs-center">{{ props.item.currency }}</td>
                    <td class="text-xs-center">{{ props.item.type }}</td>
                    <td class="text-xs-center">{{ props.item.openDate }}</td>
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
                    <v-card-text>НАстройки доступа к портфелю</v-card-text>
                </v-card>
            </template>
        </v-data-table>
    `
})
export class PortfoliosTable extends UI {

    private headers: TableHeader[] = [
        {text: 'Название', align: 'left', value: 'name'},
        {text: 'Фикс. комиссия', align: 'right', value: 'fixFee'},
        {text: 'Валюта', align: 'center', value: 'currency'},
        {text: 'Тип счета', align: 'center', value: 'type'},
        {text: 'Дата открытия', align: 'center', value: 'openDate'}
    ];

    @Prop({default: [], required: true})
    private portfolios: PortfolioRow[];

    private max25chars(v: string): any {
        return v.length <= 25 || 'Input too long!'
    }
}
