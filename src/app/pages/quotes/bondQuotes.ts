import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {MarketService} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Bond, Pagination, Portfolio, TableHeader} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-data-table :headers="headers" :items="bonds" item-key="id" :pagination.sync="pagination"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="totalItems">
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <bond-link :ticker="props.item.ticker"></bond-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-right">{{ props.item.prevprice }}%</td>
                        <td class="text-xs-right">{{ props.item.change }}%</td>
                        <td class="text-xs-right">{{ props.item.yield }}%</td>
                        <td class="text-xs-right">{{ props.item.accruedint | amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.couponvalue | amount(true) }}</td>
                        <td class="text-xs-center">{{ props.item.nextcoupon }}</td>
                        <td class="text-xs-right">{{ props.item.facevalue | amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.duration }}</td>
                        <td class="text-xs-center">
                            <a v-if="props.item.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + props.item.ticker" target="_blank"
                               :title="'Профиль эмитента ' + props.item.name + ' на сайте биржи'">
                                <i class="fas fa-external-link-alt"></i>
                            </a>
                            <a v-if="props.item.currency !== 'RUB'" :href="'https://finance.yahoo.com/quote/' + props.item.ticker" target="_blank"
                               :title="'Профиль эмитента ' + props.item.name + ' на сайте Yahoo Finance'">
                                <i class="fab fa-yahoo" aria-hidden="true"></i>
                            </a>
                        </td>
                        <td class="justify-center layout px-0" @click.stop>
                            <v-menu transition="slide-y-transition" bottom left>
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots"></span>
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
                                    <v-list-tile @click.stop="openTradeDialog(props.item, operation.COUPON)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                            Купон
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click.stop="openTradeDialog(props.item, operation.AMORTIZATION)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                            Амортизация
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click.stop="openTradeDialog(props.item, operation.REPAYMENT)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-recycle</v-icon>
                                            Погашение
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </td>
                    </tr>
                </template>
            </v-data-table>
        </v-container>
    `
})
export class BondQuotes extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Текущая операция */
    private operation = Operation;
    @Inject
    private marketservice: MarketService;

    private headers: TableHeader[] = [
        {text: "ISIN", align: "left", value: "isin", width: "50"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Цена", align: "right", value: "prevprice", width: "60"},
        {text: "Изменение", align: "left", value: "change", width: "60"},
        {text: "Доходность", align: "right", value: "yield", width: "60"},
        {text: "НКД", align: "right", value: "accruedint", width: "45"},
        {text: "Купон", align: "right", value: "couponvalue", width: "45"},
        {text: "След. купон", align: "center", value: "nextcoupon", width: "60"},
        {text: "Номинал", align: "right", value: "facevalue", width: "60"},
        {text: "Дюрация", align: "right", value: "duration", width: "60"},
        {text: "Профиль эмитента", align: "center", value: "profile", width: "60", sortable: false},
        {text: "Меню", value: "", align: "center", width: "30", sortable: false}
    ];

    private totalItems = 0;

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "isin",
        totalItems: this.totalItems
    };

    private bonds: Bond[] = [];

    async created(): Promise<void> {

    }

    @Watch("pagination", {deep: true})
    private async onTablePaginationChange(): Promise<void> {
        await this.loadStocks();
    }

    @CatchErrors
    @ShowProgress
    private async loadStocks(): Promise<void> {
        const response = await this.marketservice.loadBonds(this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending);
        this.bonds = response.content;
        this.totalItems = response.totalItems;
    }

    private async openTradeDialog(bond: Bond, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: bond,
            operation,
            assetType: AssetType.BOND
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }
}
