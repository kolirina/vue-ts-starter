import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {DividendInfo, DividendService} from "../services/dividendService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio, Stock, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="rows" item-key="year" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr>
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortName }}</td>
                    <td class="text-xs-right">{{ props.item.date }}</td>
                    <td class="text-xs-right">{{ props.item.quantity }}</td>
                    <td class="text-xs-right">{{ props.item.perOne | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.amount | amount(true) }}</td>
                    <td class="text-xs-right">{{ props.item.yield }}</td>
                    <td class="text-xs-left">{{ props.item.note }}</td>

                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                            <v-btn slot="activator" color="primary" flat icon dark>
                                <v-icon color="primary" small>fas fa-bars</v-icon>
                            </v-btn>
                            <v-list dense>
                                <v-list-tile @click="openTradeDialog(props.item.stock)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-pencil-alt</v-icon>
                                        Редактировать
                                    </v-list-tile-title>
                                </v-list-tile>
                                <v-divider></v-divider>
                                <v-list-tile @click.stop="deleteDividendTrade(props.item)">
                                    <v-list-tile-title>
                                        <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                                        Удалить
                                    </v-list-tile-title>
                                </v-list-tile>
                            </v-list>
                        </v-menu>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendTradesTable extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @Inject
    private dividendService: DividendService;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Компания", align: "left", value: "shortName"},
        {text: "Дата", align: "left", value: "shortName"},
        {text: "Кол-во, шт.", align: "right", value: "quantity"},
        {text: "На одну акцию", align: "right", value: "perOne"},
        {text: "Сумма", align: "right", value: "amount"},
        {text: "Доходность, %", align: "right", value: "yield"},
        {text: "Заметка", align: "center", value: "note"},
        {text: "Действия", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private rows: DividendInfo[];

    private async openTradeDialog(stock: Stock): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: stock,
            operation: Operation.DIVIDEND,
            assetType: AssetType.STOCK
        });
    }

    private async deleteDividendTrade(dividendTrade: DividendInfo): Promise<void> {
        await this.dividendService.deleteTrade({tradeId: dividendTrade.id, portfolioId: this.portfolio.id});
        this.$snotify.info("Сделка успешно удалена");
    }
}
