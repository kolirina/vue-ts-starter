import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {QuotesFilterTable} from "../../components/quotesFilterTable";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {MarketService} from "../../services/marketService";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Pagination, Portfolio, Stock, TableHeader} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";
import {Storage} from "../../platform/services/storage";

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
            <v-data-table :headers="headers" :items="stocks" item-key="id" :pagination="pagination" @update:pagination="onTablePaginationChange"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="pagination.totalItems" class="quotes-table" must-sort>
                <template #items="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <stock-link :ticker="props.item.ticker"></stock-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-center ii-number-cell">{{ props.item.price | amount(true) }}</td>
                        <td :class="[( Number(props.item.change) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-center']">
                            {{ props.item.change }}&nbsp;%
                        </td>
                        <td class="text-xs-center ii-number-cell">{{ props.item.lotsize }}</td>
                        <td class="text-xs-center">
                            <v-rating v-model="props.item.rating" color="#A1A6B6" size="10" dense readonly full-icon="fiber_manual_record"
                                      empty-icon="panorama_fish_eye" title=""></v-rating>
                        </td>
                        <td class="text-xs-center">
                            <v-btn v-if="props.item.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + props.item.ticker" target="_blank"
                                   :title="'Профиль эмитента ' + props.item.name + ' на сайте биржи'" icon>
                                <i class="quotes-share"></i>
                            </v-btn>
                            <v-btn v-if="props.item.currency !== 'RUB'" :href="'https://finance.yahoo.com/quote/' + props.item.ticker" target="_blank"
                                   :title="'Профиль эмитента ' + props.item.name + ' на сайте Yahoo Finance'" icon>
                                <i class="quotes-share"></i>
                            </v-btn>
                        </td>
                        <td class="justify-end layout px-0" @click.stop>
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
                                    <v-list-tile @click="openTradeDialog(props.item, operation.DIVIDEND)">
                                        <v-list-tile-title>
                                            <v-icon color="primary" small>fas fa-calendar-alt</v-icon>
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
    components: {AdditionalPagination, QuotesFilterTable}
})
export class StockQuotes extends UI {

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

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Цена", align: "center", value: "price"},
        {text: "Изменение", align: "center", value: "change"},
        {text: "Размер лота", align: "center", value: "lotsize", sortable: false},
        {text: "Рейтинг", align: "center", value: "rating"},
        {text: "Профиль эмитента", align: "center", value: "profile", sortable: false},
        {text: "", value: "", align: "center", sortable: false}
    ];

    private showUserShares: boolean = this.localStorage.get<boolean>("showUserStocks", null);

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "ticker",
        totalItems: 0,
        pages: 0
    };

    private stocks: Stock[] = [];

    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadStocks();
    }

    @ShowProgress
    private async changeShowUserShares(value: boolean): Promise<void> {
        this.localStorage.set<boolean>("showUserStocks", value);
        this.showUserShares = value;
        await this.loadStocks();
    }

    @ShowProgress
    private async tableSearch(value: string): Promise<void> {
        this.searchQuery = value;
        await this.loadStocks();
    }

    @ShowProgress
    private async loadStocks(): Promise<void> {
        const response = await this.marketservice.loadStocks(this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending, this.searchQuery, this.showUserShares);
        this.stocks = response.content;
        this.pagination.totalItems = response.totalItems;
        this.pagination.pages = response.pages;
    }

    private async openTradeDialog(stock: Stock, operation: Operation): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: stock,
            operation,
            assetType: AssetType.STOCK
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }
}