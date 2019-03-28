import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {TradeService} from "../services/tradeService";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {AssetRow, Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ConfirmDialog} from "./dialogs/confirmDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table class="data-table" :headers="headers" :items="rows" item-key="id" :custom-sort="customSort" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template #items="props">
                <tr class="selectable">
                    <td class="text-xs-left"><span>{{ props.item.company}}</span>
                    </td>
                    <td class="text-xs-left">
                        <stock-link v-if="props.item.ticker" :ticker="props.item.ticker"></stock-link>
                    </td>
                    <td class="text-xs-right">{{ props.item.quantity }}</td>
                    <td class="text-xs-right"><span v-if="props.item.type === 'STOCK'">{{ props.item.avgBuy | amount }}</span></td>
                    <td class="text-xs-right">{{ props.item.currCost | amount(true)}}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-icon v-if="props.item.type === 'STOCK'" color="primary" small @click="deleteAllTrades(props.item)">fas fa-trash-alt</v-icon>
                    </td>
                </tr>
            </template>
        </v-data-table>
    `
})
export class BalancesTable extends UI {

    @Inject
    private tradeService: TradeService;

    @MainStore.Getter
    private portfolio: Portfolio;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    private balancesTableRow: BalancesTableRow[] = [];

    private operation = Operation;

    private headers: TableHeader[] = [
        {text: "Актив", align: "left", sortable: false, value: "company", width: "80"},
        {text: "Тикер", align: "left", value: "ticker", width: "45"},
        {text: "Количество", align: "right", value: "quantity", width: "60"},
        {text: "Ср. цена", align: "right", value: "avgBuy", width: "60"},
        {text: "Тек. стоимость", align: "right", value: "currCost", width: "65"},
        {text: "Действия", align: "center", value: "actions", sortable: false, width: "25"}
    ];

    @Prop({default: [], required: true})
    private stocks: StockPortfolioRow[];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

    created(): void {
        this.prepareRows();
    }

    private async deleteAllTrades(stockRow: BalancesTableRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.tradeService.deleteAllTrades({
                assetType: "STOCK",
                ticker: stockRow.ticker,
                portfolioId: this.portfolio.id
            });
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    @Watch("portfolio")
    private onPortfolioChange(): void {
        this.prepareRows();
    }

    private get rows(): BalancesTableRow[] {
        return this.balancesTableRow;
    }

    private prepareRows(): void {
        this.balancesTableRow = [];
        for (const row of this.stocks) {
            this.balancesTableRow.push({
                id: row.id,
                type: "STOCK",
                company: row.stock.shortname,
                ticker: row.stock.ticker,
                quantity: row.quantity,
                avgBuy: row.avgBuy,
                currCost: row.currCost
            });
        }
        for (const row of this.assets) {
            if (row.assetType === "MONEY") {
                const currCost = new BigMoney(row.currCost);
                if (currCost.currency === "EUR") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "EURO",
                        company: "Евро",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                } else if (currCost.currency === "RUB") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "RUBLE",
                        company: "Рубль",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                } else if (currCost.currency === "USD") {
                    this.balancesTableRow.push({
                        id: "",
                        type: "DOLLAR",
                        company: "Доллар США",
                        ticker: "",
                        quantity: null,
                        avgBuy: "",
                        currCost: row.currCost
                    });
                }
            }
        }
    }

    private customSort(items: BalancesTableRow[], index: string, isDesc: boolean): BalancesTableRow[] {
        return SortUtils.simpleSort(items, index, isDesc);
    }
}

type BalancesTableRow = {
    id: string,
    type: string,
    company: string,
    ticker: string,
    quantity: number,
    avgBuy: string,
    currCost: string
};
