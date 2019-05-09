import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
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
            <div class="additional-pagination-quotes-table">
                <additional-pagination :pagination="pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
            </div>
            <quotes-filter-table :searchQuery="searchQuery" @input="tableSearch" @changeShowUserShares="changeShowUserShares"
                                 placeholder="Поиск" :showUserSharesValue="showUserShares"></quotes-filter-table>
            <v-data-table :headers="headers" :items="bonds" item-key="id" :pagination.sync="pagination"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="pagination.totalItems" class="quotes-table" must-sort>
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
    @Inject
    private localStorage: Storage;

    private searchQuery: string = "";

    private showUserShares: boolean = this.localStorage.get<boolean>("showUserBonds", null);

    private searchPlaceholder: string = "Поиск";

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

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "isin",
        totalItems: 0,
        pages: 0
    };

    private bonds: Bond[] = [];
    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadBonds();
    }

    @ShowProgress
    private async tableSearch(value: string): Promise<void> {
        this.searchQuery = value;
        await this.loadBonds();
    }

    @ShowProgress
    private async changeShowUserShares(value: boolean): Promise<void> {
        this.localStorage.set<boolean>("showUserBonds", value);
        this.showUserShares = value;
        await this.loadBonds();
    }

    @ShowProgress
    private async loadBonds(): Promise<void> {
        const response = await this.marketservice.loadBonds(this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending, this.searchQuery, this.showUserShares);
        this.bonds = response.content;
        this.pagination.totalItems = response.totalItems;
        this.pagination.pages = response.pages;
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
