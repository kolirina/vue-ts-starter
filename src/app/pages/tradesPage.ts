import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {TradesFilterComponent} from "../components/tradesFilter";
import {TradesTable} from "../components/tradesTable";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {FilterService} from "../services/filterService";
import {TradeService, TradesFilter} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {Pagination, Portfolio, TablePagination, TradeRow} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>

            <trades-filter-component v-if="tradesFilter" @filterChange="onFilterChange" :tradesFilter="tradesFilter"></trades-filter-component>

            <trades-table v-if="tradePagination" :trades="trades" :trade-pagination="tradePagination" @delete="onDelete"></trades-table>
            <v-container v-if="pages > 1">
                <v-layout align-center justify-center row>
                    <v-pagination v-model="page" :length="pages"></v-pagination>
                </v-layout>
            </v-container>
        </v-container>
    `,
    components: {TradesTable, TradesFilterComponent}
})
export class TradesPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    @Inject
    private tradeService: TradeService;
    @Inject
    private filterService: FilterService;

    private page = 1;

    private totalTrades = 0;

    private pageSize = 50;

    private pages = 0;

    private pagination: Pagination = {
        descending: false,
        page: this.page,
        rowsPerPage: this.pageSize,
        sortBy: "ticker",
        totalItems: this.totalTrades
    };

    private tradePagination: TablePagination = null;

    private trades: TradeRow[] = [];

    private tradesFilter: TradesFilter = null;

    /**
     * Загрузка сделок будет произведена в вотчере на объект с паджинацией
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.tradesFilter = this.filterService.getFilter(FilterService.TRADES_FILTER_KEY);
        this.tradePagination = {
            pagination: this.pagination,
            totalItems: this.totalTrades
        };
        this.calculatePagination();
    }

    @Watch("page")
    private async onPageChange(): Promise<void> {
        await this.loadTrades();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadTrades();
        this.calculatePagination();
    }

    @Watch("tradePagination.pagination", {deep: true})
    private async onTradePaginationChange(): Promise<void> {
        await this.loadTrades();
    }

    @CatchErrors
    private async onDelete(tradeRow: TradeRow): Promise<void> {
        await this.tradeService.deleteTrade({portfolioId: this.portfolio.id, tradeId: tradeRow.id});
        await this.reloadPortfolio(this.portfolio.id);
        await this.loadTrades();
        this.calculatePagination();
        this.$snotify.info(`Операция '${tradeRow.operationLabel}' ${AssetType.valueByName(tradeRow.asset) === AssetType.MONEY ? "" :
            `по бумаге ${tradeRow.ticker}`} была успешно удалена`);
    }

    private calculatePagination(): void {
        this.totalTrades = this.portfolio.overview.totalTradesCount;
        this.pages = parseInt(String(this.totalTrades / this.pageSize), 10);
    }

    @CatchErrors
    @ShowProgress
    private async loadTrades(): Promise<void> {
        this.trades = await this.tradeService.loadTrades(
            this.portfolio.id,
            this.pageSize * (this.page - 1),
            this.pageSize,
            this.tradePagination.pagination.sortBy,
            this.tradePagination.pagination.descending,
            this.filterService.getTradesFilterRequest(this.tradesFilter)
        );
    }

    private async onFilterChange(): Promise<void> {
        await this.loadTrades();
        this.filterService.saveFilter(FilterService.TRADES_FILTER_KEY, this.tradesFilter);
    }
}
