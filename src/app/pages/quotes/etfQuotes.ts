import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {EmptySearchResult} from "../../components/emptySearchResult";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
import {StockRate} from "../../components/stockRate";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {FiltersService} from "../../services/filtersService";
import {MarketService, QuotesFilter} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {EventType} from "../../types/eventType";
import {Operation} from "../../types/operation";
import {StoreKeys} from "../../types/storeKeys";
import {Pagination, Portfolio, Share, StockTypeShare, TableHeader} from "../../types/types";
import {TradeUtils} from "../../utils/tradeUtils";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="pa-0" data-v-step="0">
            <quotes-filter-table :filter="filter" @input="tableSearch" @changeShowUserShares="changeShowUserShares" @filter="onFilterChange" :min-length="1" placeholder="Поиск"
                                 :store-key="StoreKeys.ETF_QUOTES_FILTER_KEY">
                <additional-pagination :pagination="pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
            </quotes-filter-table>
            <empty-search-result v-if="isEmptySearchResult" @resetFilter="resetFilter"></empty-search-result>
            <v-data-table v-else
                          :headers="headers" :items="etf" item-key="id" :pagination="pagination" @update:pagination="onTablePaginationChange"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="pagination.totalItems" class="data-table quotes-table normalize-table table-bottom-pagination" must-sort>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <stock-link v-if="props.item.shareType === 'STOCK'" :ticker="props.item.ticker"></stock-link>
                            <asset-link v-if="props.item.shareType === 'ASSET'" :ticker="String(props.item.id)">{{ props.item.ticker }}</asset-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-center ii-number-cell">
                            {{ props.item.price | amount(true, null, true, false) }} <span class="second-value">{{ currencyForPrice(props.item) }}</span>
                        </td>
                        <td :class="[( Number(props.item.change) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-center']">
                            {{ props.item.change }}&nbsp;%
                        </td>
                        <td class="text-xs-center">{{ props.item.currency }}</td>
                        <td class="text-xs-center">
                            <template v-if="props.item.shareType === 'STOCK'">
                                <v-btn v-if="props.item.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + props.item.ticker" target="_blank"
                                       :title="'Профиль эмитента ' + props.item.name + ' на сайте биржи'" icon>
                                    <i class="quotes-share"></i>
                                </v-btn>
                                <v-btn v-if="props.item.currency !== 'RUB'" :href="'https://finance.yahoo.com/quote/' + props.item.ticker" target="_blank"
                                       :title="'Профиль эмитента ' + props.item.name + ' на сайте Yahoo Finance'" icon>
                                    <i class="quotes-share"></i>
                                </v-btn>
                            </template>
                        </td>
                        <td class="justify-end layout px-0" @click.stop>
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
                                    <v-list-tile @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                        <v-list-tile-title>
                                            Дивиденд
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
    components: {AdditionalPagination, QuotesFilterTable, EmptySearchResult, StockRate}
})
export class EtfQuotes extends UI {

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

    /** Фильтр котировок */
    private filter: QuotesFilter = this.filtersService.getFilter<QuotesFilter>(StoreKeys.ETF_QUOTES_FILTER_KEY, {
        searchQuery: "",
        showUserShares: false
    });

    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Признак что ничего не найдено */
    private isEmptySearchResult: boolean = false;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Цена", align: "center", value: "price"},
        {text: "Изменение", align: "center", value: "change"},
        {text: "Валюта", align: "center", value: "currency", width: "50"},
        {text: "Профиль эмитента", align: "center", value: "profile", sortable: false},
        {text: "", value: "", align: "center", sortable: false}
    ];

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "ticker",
        totalItems: 0,
        pages: 0
    };

    private etf: StockTypeShare[] = [];

    async created(): Promise<void> {
        this.filter.showUserShares = this.localStorage.get<boolean>("showUserStocks", false);
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio(this.portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    private async resetFilter(): Promise<void> {
        this.filter.searchQuery = "";
        this.filter.showUserShares = false;
        this.filter.currency = null;
        await this.loadEtf();
    }

    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadEtf();
    }

    private async changeShowUserShares(showUserShares: boolean): Promise<void> {
        this.localStorage.set<boolean>("showUserStocks", showUserShares);
        this.filter.showUserShares = showUserShares;
        await this.loadEtf();
    }

    /**
     * Обрабатывает изменение фильтра
     */
    private async onFilterChange(): Promise<void> {
        await this.loadEtf();
    }

    private async tableSearch(search: string): Promise<void> {
        this.filter.searchQuery = search;
        await this.loadEtf();
    }

    @ShowProgress
    private async loadEtf(): Promise<void> {
        const response = await this.marketservice.loadEtf(this.pagination, this.filter);
        this.etf = response.content;
        this.pagination.totalItems = response.totalItems;
        this.pagination.pages = response.pages;
        this.isEmptySearchResult = this.etf.length === 0;
    }

    private async openTradeDialog(share: Share, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: share,
            operation,
            assetType: AssetType.valueByName(share.shareType)
        });
    }

    private currencyForPrice(stock: StockTypeShare): string {
        return TradeUtils.currencySymbolByAmount(stock.price).toLowerCase();
    }
}
