import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {AssetRow, TableHeader} from "../types/types";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="assets" hide-actions class="elevation-1">
            <template slot="items" slot-scope="props">
                <td>{{ props.item.type | assetDesc }}</td>
                <td class="text-xs-right">{{ props.item.currCost | amount(true) }}</td>
                <td class="text-xs-right">{{ props.item.profit | amount(true) }}</td>
                <td class="text-xs-right">{{ props.item.percCurrShare | number }}</td>
                <td class="justify-center layout px-0" @click.stop>
                    <v-menu transition="slide-y-transition" bottom left>
                        <v-btn slot="activator" color="primary" flat icon dark>
                            <v-icon color="primary" small>fas fa-bars</v-icon>
                        </v-btn>
                        <v-list dense>
                            <v-list-tile @click.stop="openTradeDialog(props.item, operation.BUY)">
                                <v-list-tile-title>
                                    <v-icon color="primary" small>fas fa-plus</v-icon>
                                    Купить
                                </v-list-tile-title>
                            </v-list-tile>
                            <v-list-tile @click.stop="openTradeDialog(props.item, operation.SELL)">
                                <v-list-tile-title>
                                    <v-icon color="primary" small>fas fa-minus</v-icon>
                                    Продать
                                </v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </td>
            </template>
        </v-data-table>
    `
})
export class AssetTable extends UI {

    private headers: TableHeader[] = [
        {text: "Актив", sortable: false, value: "name"},
        {text: "Текущая стоимость", align: "center", value: "currCost"},
        {text: "Прибыль", align: "center", value: "profit"},
        {text: "Текущая доля", align: "center", value: "percCurrShare"},
        {text: "Действия", align: "center", value: "name", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    private operation = Operation;

    private async openTradeDialog(assetRow: AssetRow, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            operation,
            assetType: assetRow.type === "STOCK" ? AssetType.STOCK : AssetType.BOND
        });
    }
}
