import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {EmptySearchResult} from "../../components/emptySearchResult";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {FiltersService} from "../../services/filtersService";
import {MarketService, QuotesFilter} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {EventType} from "../../types/eventType";
import {Operation} from "../../types/operation";
import {StoreKeys} from "../../types/storeKeys";
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
            <quotes-filter-table :filter="filter" @input="tableSearch" @changeShowUserShares="changeShowUserShares" @filter="onFilterChange" :min-length="3" placeholder="Поиск"
                                 :store-key="StoreKeys.BOND_QUOTES_FILTER_KEY" show-types></quotes-filter-table>
            <empty-search-result v-if="isEmptySearchResult" @resetFilter="resetFilter"></empty-search-result>
            <v-data-table v-else
                          :headers="headers" :items="bonds" item-key="id" :pagination="pagination" @update:pagination="onTablePaginationChange"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="pagination.totalItems" class="data-table table-bottom-pagination normalize-table" must-sort>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <bond-link :ticker="props.item.ticker"></bond-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-left">{{ props.item.typeName }}</td>
                        <td class="text-xs-right ii-number-cell">{{ props.item.prevprice }}%</td>
                        <td class="text-xs-center">{{ props.item.change }}%</td>
                        <td class="text-xs-center">{{ props.item.yield }}%</td>
                        <td class="text-xs-center">{{ props.item.accruedint | amount(true) }}</td>
                        <td class="text-xs-right">{{ props.item.couponvalue | amount(true) }}</td>
                        <td class="text-xs-center">{{ props.item.nextcoupon }}</td>
                        <td class="text-xs-center">{{ props.item.facevalue | amount(true) }}</td>
                        <td class="text-xs-center">{{ props.item.currency }}</td>
                        <td class="text-xs-center">{{ props.item.duration }}</td>
                        <td class="text-xs-center">
                            <v-btn :href="'http://moex.com/ru/issue.aspx?code=' + props.item.ticker" target="_blank"
                                   :title="'Профиль эмитента ' + props.item.name + ' на сайте биржи'" icon>
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
                                            Купить
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.SELL)">
                                        <v-list-tile-title>
                                            Продать
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.COUPON)">
                                        <v-list-tile-title>
                                            Купон
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.AMORTIZATION)">
                                        <v-list-tile-title>
                                            Амортизация
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click="openTradeDialog(props.item, operation.REPAYMENT)">
                                        <v-list-tile-title>
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
    components: {AdditionalPagination, QuotesFilterTable, EmptySearchResult}
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
    @Inject
    private filtersService: FiltersService;

    /** Признак что ничего не найдено */
    private isEmptySearchResult: boolean = false;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    /** Фильтр котировок */
    private filter: QuotesFilter = this.filtersService.getFilter<QuotesFilter>(StoreKeys.BOND_QUOTES_FILTER_KEY, {
        searchQuery: "",
        showUserShares: false
    });

    private headers: TableHeader[] = [
        {text: "ISIN", align: "left", value: "isin"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Тип", align: "left", value: "typeName"},
        {text: "Цена", align: "right", value: "prevprice"},
        {text: "Изменение", align: "center", value: "change"},
        {text: "Доходность", align: "center", value: "yield"},
        {text: "НКД", align: "center", value: "accruedint"},
        {text: "Купон", align: "right", value: "couponvalue"},
        {text: "След. купон", align: "center", value: "nextcoupon"},
        {text: "Номинал", align: "center", value: "facevalue"},
        {text: "Валюта", align: "center", value: "currency", width: "50"},
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

    async created(): Promise<void> {
        this.filter.showUserShares = this.localStorage.get<boolean>("showUserBonds", false);
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio(this.portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    private async resetFilter(): Promise<void> {
        this.filter.searchQuery = "";
        this.filter.showUserShares = false;
        this.filter.currency = null;
        await this.loadBonds();
    }

    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadBonds();
    }

    private async tableSearch(search: string): Promise<void> {
        this.filter.searchQuery = search;
        await this.loadBonds();
    }

    /**
     * Обрабатывает изменение фильтра
     */
    private async onFilterChange(): Promise<void> {
        await this.loadBonds();
    }

    private async changeShowUserShares(showUserShares: boolean): Promise<void> {
        this.localStorage.set<boolean>("showUserBonds", showUserShares);
        this.filter.showUserShares = showUserShares;
        await this.loadBonds();
    }

    @ShowProgress
    private async loadBonds(): Promise<void> {
        const response = await this.marketservice.loadBonds(this.pagination, this.filter);
        this.bonds = response.content;
        this.pagination.totalItems = response.totalItems;
        this.pagination.pages = response.pages;
        this.isEmptySearchResult = this.bonds.length === 0;
    }

    private async openTradeDialog(bond: Bond, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: bond,
            operation,
            assetType: AssetType.BOND
        });
    }
}
