import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {TradeService} from "../services/tradeService";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {AssetRow, Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-data-table :headers="headers" :items="rows" item-key="id" :loading="loading" hide-actions>
            <v-progress-linear slot="progress" color="blue" indeterminate></v-progress-linear>
            <template slot="items" slot-scope="props">
                <tr>
                    <td><span>{{ props.item.company}}</span>
                    </td>
                    <td>
                        <router-link v-if="props.item.ticker" :to="{name: 'share-info', params: {ticker: props.item.ticker}}">{{ props.item.ticker }}</router-link>
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
        {text: "Актив", align: "left", sortable: false, value: "company"},
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Количество", align: "right", value: "quantity", width: "200"},
        {text: "Ср. цена", align: "right", value: "avgBuy", width: "200"},
        {text: "Тек. стоимость", align: "right", value: "currCost", sortable: false, width: "200"},
        {text: "Действия", align: "right", value: "actions", sortable: false, width: "200"}
    ];

    @Prop({default: false})
    private loading: boolean;

    @Prop({default: [], required: true})
    private stocks: StockPortfolioRow[];

    @Prop({default: [], required: true})
    private assets: AssetRow[];

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
    private onPortfolioChange() {
        this.balancesTableRow = [];
        for (const row of this.stocks) {
            this.balancesTableRow.push({
                id: row.id,
                type: "STOCK",
                company: row.stock.shortname,
                ticker: row.stock.ticker,
                quantity: parseInt(row.quantity, 10),
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

    private get rows(): BalancesTableRow[] {
        this.balancesTableRow = [];
        for (const row of this.stocks) {
            this.balancesTableRow.push({
                id: row.id,
                type: "STOCK",
                company: row.stock.shortname,
                ticker: row.stock.ticker,
                quantity: parseInt(row.quantity, 10),
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
        return this.balancesTableRow;
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