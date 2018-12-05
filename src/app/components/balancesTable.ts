import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {AssetRow, Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {AddTradeDialog} from "./dialogs/addTradeDialog";
import {ConfirmDialog} from "./dialogs/confirmDialog";
import {BtnReturn} from "./dialogs/customDialog";
import {ShareTradesDialog} from "./dialogs/shareTradesDialog";

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
                        <router-link :to="{name: 'share-info', params: {ticker: props.item.ticker}}">{{ props.item.ticker }}</router-link>
                    </td>
                    <td class="text-xs-right">{{ props.item.quantity | number }}</td>
                    <td class="text-xs-right">{{ props.item.avgBuy | amount }}</td>
                    <td class="text-xs-right">{{ props.item.currPrice| amount(true) }}</td>
                    <td class="justify-center layout px-0" @click.stop>
                        <v-menu transition="slide-y-transition" bottom left>
                        </v-menu>
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

    private async deleteAllTrades(stockRow: StockPortfolioRow): Promise<void> {
        const result = await new ConfirmDialog().show(`Вы уверены, что хотите удалить все сделки по ценной бумаге?`);
        if (result === BtnReturn.YES) {
            await this.tradeService.deleteAllTrades({
                assetType: "STOCK",
                ticker: stockRow.stock.ticker,
                portfolioId: this.portfolio.id
            });
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private set rows(balancesTableRows: BalancesTableRow[]) {
        this.balancesTableRow = [];
        for (const row of this.portfolio.overview.stockPortfolio.rows) {
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
        console.log("!!!", this.portfolio.overview.assetRows);
        for (const row of this.portfolio.overview.assetRows) {
            if (row.type = "EURO") {
                this.balancesTableRow.push({
                    id: "",
                    type: "EURO",
                    company: "Евро",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "RUBLES") {
                this.balancesTableRow.push({
                    id: "",
                    type: "RUBLES",
                    company: "Рубль",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "DOLLARS") {
                this.balancesTableRow.push({
                    id: "",
                    type: "DOLLARS",
                    company: "Доллар США",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            }
        }
    }

    @Watch("portfolio")
    private async onPortfolioChange() {
        // this.rows = this.balancesTableRow;
        this.balancesTableRow = [];
        for (const row of await this.portfolio.overview.stockPortfolio.rows) {
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
        console.log("!!!", await this.portfolio.overview.assetRows);
        for (const row of await this.portfolio.overview.assetRows) {
            if (row.type = "EURO") {
                this.balancesTableRow.push({
                    id: "",
                    type: "EURO",
                    company: "Евро",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "RUBLES") {
                this.balancesTableRow.push({
                    id: "",
                    type: "RUBLES",
                    company: "Рубль",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "DOLLARS") {
                this.balancesTableRow.push({
                    id: "",
                    type: "DOLLARS",
                    company: "Доллар США",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            }
        }
    }

    private get rows(): BalancesTableRow[] {
        // = this.portfolio.overview.stockPortfolio.rows;
        this.balancesTableRow = [];
        for (const row of this.portfolio.overview.stockPortfolio.rows) {
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
        console.log("!!!", this.portfolio.overview.assetRows);
        for (const row of this.portfolio.overview.assetRows) {
            if (row.type = "EURO") {
                this.balancesTableRow.push({
                    id: "",
                    type: "EURO",
                    company: "Евро",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "RUBLES") {
                this.balancesTableRow.push({
                    id: "",
                    type: "RUBLES",
                    company: "Рубль",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
            } else if (row.type = "DOLLARS") {
                this.balancesTableRow.push({
                    id: "",
                    type: "DOLLARS",
                    company: "Доллар США",
                    ticker: "",
                    quantity: "",
                    avgBuy: "",
                    currCost: row.currCost
                });
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
    quantity: string,
    avgBuy: string,
    currCost: string
}