import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {DividendInfo, DividendService} from "../services/dividendService";
import {Portfolio, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="year" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr>
                    <td class="text-xs-left">
                        <stock-link :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-left">{{ props.item.shortName }}</td>
                    <td class="text-xs-right">{{ props.item.year }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.quantity }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.perOne | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.amount | amount(true) }}</td>
                    <td class="text-xs-right ii-number-cell">{{ props.item.yield }}</td>

                    <td class="justify-center layout px-0">
                        <v-btn slot="activator" @click="deleteAllTrades(props.item)" color="primary" flat icon dark>
                            <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                        </v-btn>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class DividendsByYearAndTickerTable extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @Inject
    private dividendService: DividendService;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Компания", align: "left", value: "shortName"},
        {text: "Год", align: "right", value: "year"},
        {text: "Кол-во, шт.", align: "right", value: "quantity"},
        {text: "На одну акцию", align: "right", value: "perOne"},
        {text: "Сумма", align: "right", value: "amount"},
        {text: "Доходность, %", align: "right", value: "yield"},
        {text: "Действия", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private rows: DividendInfo[];

    private async deleteAllTrades(dividendTrade: DividendInfo): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все дивиденды по выбранной акции?`);
        if (result === BtnReturn.YES) {
            await this.dividendService.deleteAllTrades({ticker: dividendTrade.ticker, year: dividendTrade.year, portfolioId: this.portfolio.id});
            await this.reloadPortfolio(this.portfolio.id);
            this.$snotify.info(`Все дивидендные сделки по тикеру ${dividendTrade.ticker} были успешно удалены`);
        }
    }
}
