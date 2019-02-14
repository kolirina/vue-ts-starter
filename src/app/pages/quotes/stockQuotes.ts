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
import {Pagination, Portfolio, Stock, TableHeader} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-data-table :headers="headers" :items="stocks" item-key="id" :pagination.sync="pagination"
                          :rows-per-page-items="[25, 50, 100, 200]"
                          :total-items="totalItems">
                <template slot="items" slot-scope="props">
                    <tr class="selectable">
                        <td class="text-xs-left">
                            <stock-link :ticker="props.item.ticker"></stock-link>
                        </td>
                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                        <td class="text-xs-right ii-number-cell">{{ props.item.price | amount(true) }}</td>
                        <td :class="[( Number(props.item.change) >= 0 ) ? 'ii--green-markup' : 'ii--red-markup', 'ii-number-cell', 'text-xs-right']">
                            {{ props.item.change }}&nbsp;%
                        </td>
                        <td class="text-xs-right ii-number-cell">{{ props.item.lotsize }}</td>
                        <td class="text-xs-right">
                            <v-rating v-model="props.item.rating" dense readonly></v-rating>
                        </td>
                        <td class="text-xs-right">
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
                                <v-btn slot="activator" color="primary" flat icon dark>
                                    <v-icon color="primary" small>fas fa-bars</v-icon>
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
                                    <v-list-tile @click.stop="openTradeDialog(props.item, operation.DIVIDEND)">
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
    `
})
export class StockQuotes extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    /** Текущая операция */
    private operation = Operation;
    @Inject
    private marketservice: MarketService;

    private headers: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "50"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Цена", align: "right", value: "price", width: "60"},
        {text: "Изменение", align: "left", value: "change", width: "70"},
        {text: "Размер лота", align: "right", value: "lotsize", width: "45", sortable: false},
        {text: "Рейтинг", align: "center", value: "rating", width: "240"},
        {text: "Профиль эмитента", align: "right", value: "profile", width: "60", sortable: false},
        {text: "Меню", value: "", align: "center", width: "30", sortable: false}
    ];

    private totalItems = 0;

    private pagination: Pagination = {
        descending: false,
        page: 1,
        rowsPerPage: 50,
        sortBy: "ticker",
        totalItems: this.totalItems
    };

    private stocks: Stock[] = [];

    async created(): Promise<void> {

    }

    @Watch("pagination", {deep: true})
    private async onTablePaginationChange(): Promise<void> {
        await this.loadStocks();
    }

    @CatchErrors
    @ShowProgress
    private async loadStocks(): Promise<void> {
        const response = await this.marketservice.loadStocks(this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage, this.pagination.sortBy, this.pagination.descending);
        this.stocks = response.content;
        this.totalItems = response.totalItems;
    }

    private async openTradeDialog(stock: Stock, operation: Operation): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: stock,
            operation,
            assetType: AssetType.STOCK
        });
    }
}
