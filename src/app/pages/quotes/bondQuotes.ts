import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
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
        <v-container v-if="portfolio" fluid class="pa-0">
            <additional-pagination :page="pagination.page" :rowsPerPage="pagination.rowsPerPage" :totalItems="totalItems"
                                   :pages="pages" @paginationChange="paginationChange"></additional-pagination>
            <quotes-filter-table :searchQuery="searchQuery" @input="tableSearch" @switchChange="switchChange"
                                 :placeholder="placeholder" :switchValue="showUserShares"></quotes-filter-table>
            <v-data-table :headers="headers" :items="bonds" item-key="id" :pagination.sync="pagination"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="totalItems" class="quotes-table" must-sort>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <bond-link :ticker="props.item.ticker"></bond-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-right">{{ props.item.prevprice }}%</td>
                        <td class="text-xs-center">{{ props.item.change }}%</td>
                        <td class="text-xs-center">{{ props.item.yield }}%</td>
                        <td class="text-xs-center">{{ props.item.accruedint | amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.couponvalue | amount(true) }}</td>
                        <td class="text-xs-center">{{ props.item.nextcoupon }}</td>
                        <td class="text-xs-center">{{ props.item.facevalue | amount(true) }}</td>
                        <td class="text-xs-center">{{ props.item.duration }}</td>
                        <td class="text-xs-center">
                            <v-btn v-if="props.item.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + props.item.ticker" target="_blank"
                               :title="'Профиль эмитента ' + props.item.name + ' на сайте биржи'" icon>
                                <img src="img/quotes/share.svg">
                            </v-btn>
                            <v-btn v-if="props.item.currency !== 'RUB'" :href="'https://finance.yahoo.com/quote/' + props.item.ticker" target="_blank"
                               :title="'Профиль эмитента ' + props.item.name + ' на сайте Yahoo Finance'" icon>
                                <img src="img/quotes/share.svg">
                            </v-btn>
                        </td>
                        <td class="justify-center layout px-0" @click.stop>
                            <v-menu transition="slide-y-transition" bottom left nudge-bottom="25">
                                <v-btn slot="activator" flat icon dark>
                                    <span class="menuDots"></span>
                                </v-btn>
                                <v-list dense>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.BUY)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-plus</v-icon>
                                            Купить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.SELL)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-minus</v-icon>
                                            Продать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.COUPON)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
                                            Купон
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.AMORTIZATION)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-hourglass-half</v-icon>
                                            Амортизация
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.REPAYMENT)">
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
    `,
    components: {AdditionalPagination, QuotesFilterTable}
})
export class BondQuotes extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Текущая операция */
    private operation = Operation;
    @Inject
    private marketservice: MarketService;

    private searchQuery: string = "";

    private showUserShares: boolean = this.marketservice.showUserBonds;

    private placeholder: string = "Поиск";

    private headers: TableHeader[] = [
        {text: "ISIN", align: "left", value: "isin"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Цена", align: "right", value: "prevprice"},
        {text: "Изменение", align: "center", value: "change"},
        {text: "Доходность", align: "center", value: "yield"},
        {text: "НКД", align: "center", value: "accruedint"},
        {text: "Купон", align: "right", value: "couponvalue"},
        {text: "След. купон", align: "center", value: "nextcoupon"},
        {text: "Номинал", align: "center", value: "facevalue"},
        {text: "Дюрация", align: "center", value: "duration"},
        {text: "Профиль эмитента", align: "center", value: "profile", sortable: false},
        {text: "Меню", value: "", align: "center", sortable: false}
    ];

    private totalItems = 0;

    private pages: number = 0;

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "isin",
        totalItems: this.totalItems
    };

    private bonds: Bond[] = [];

    @Watch("pagination", {deep: true})
    private async onTablePaginationChange(): Promise<void> {
        await this.loadBonds();
    }

    @ShowProgress
    private async tableSearch(value: string): Promise<void> {
        this.searchQuery = value;
        await this.loadBonds();
    }

    @ShowProgress
    private async switchChange(value: boolean): Promise<void> {
        await this.marketservice.setShowUserBonds(value);
        this.showUserShares = value;
        await this.loadBonds();
    }

    @ShowProgress
    private async loadBonds(): Promise<void> {
        const response = await this.marketservice.loadBonds(this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending, this.searchQuery, this.showUserShares);
        this.bonds = response.content;
        this.totalItems = response.totalItems;
        this.pages = response.pages;
    }

    private async paginationChange(page: number): Promise<void> {
        this.pagination.page = page;
        await this.loadBonds;
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
