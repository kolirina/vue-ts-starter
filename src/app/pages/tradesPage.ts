import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AdditionalPagination} from "../components/additionalPagination";
import {EmptySearchResult} from "../components/emptySearchResult";
import {TradesTable} from "../components/tables/tradesTable";
import {TradesTableFilter} from "../components/tradesTableFilter";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams} from "../services/portfolioService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {CopyMoveTradeRequest, TradeService, TradesFilter} from "../services/tradeService";
import {TradesFilterService} from "../services/tradesFilterService";
import {AssetType} from "../types/assetType";
import {EventType} from "../types/eventType";
import {StoreKeys} from "../types/storeKeys";
import {Pagination, Portfolio, TableHeader, TradeRow} from "../types/types";
import {PortfolioUtils} from "../utils/portfolioUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {PortfolioBasedPage} from "./portfolioBasedPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="portfolio" class="h100pc">
            <empty-portfolio-stub v-if="isEmptyBlockShowed" @openCombinedDialog="showDialogCompositePortfolio"></empty-portfolio-stub>
            <v-container v-else fluid class="paddT0 h100pc">
                <dashboard :overview="portfolio.overview" :side-bar-opened="sideBarOpened" :view-currency="portfolio.portfolioParams.viewCurrency"></dashboard>
                <expanded-panel name="trades" :value="[true]" class="auto-cursor" data-v-step="0" disabled with-menu always-open>
                    <template #header>Сделки</template>
                    <v-layout justify-space-between wrap class="trades-filter-section">
                        <trades-table-filter v-if="tradesFilter" :store-key="StoreKeys.TRADES_FILTER_SETTINGS_KEY" @filter="onFilterChange" :filter="tradesFilter"
                                             :is-default="isDefaultFilter" data-v-step="1" :table-name="TABLES_NAME.TRADE"></trades-table-filter>
                        <additional-pagination :pagination="pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
                    </v-layout>
                    <empty-search-result v-if="isEmptySearchResult" @resetFilter="resetFilter"></empty-search-result>
                    <trades-table v-else :trades="trades" :pagination="pagination" @copyTrade="copyTrade" @moveTrade="moveTrade"
                                  :headers="getHeaders()" @delete="onDelete" @resetFilter="resetFilter" @update:pagination="onTablePaginationChange"
                                  data-v-step="2">
                    </trades-table>
                </expanded-panel>
            </v-container>
        </div>
    `,
    components: {TradesTable, TradesTableFilter, AdditionalPagination, EmptySearchResult}
})
export class TradesPage extends PortfolioBasedPage {

    @Inject
    protected overviewService: OverviewService;
    @Inject
    protected tablesService: TablesService;
    @Inject
    protected tradeService: TradeService;
    @Inject
    protected tradesFilterService: TradesFilterService;
    @Inject
    protected exportService: ExportService;

    @MainStore.Getter
    protected portfolio: Portfolio;
    /** Комбинированный портфель */
    @MainStore.Getter
    protected combinedPortfolioParams: PortfolioParams;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    protected reloadPortfolio: () => Promise<void>;
    @MainStore.Getter
    private sideBarOpened: boolean;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    private pagination: Pagination = {
        descending: true,
        page: 1,
        rowsPerPage: 50,
        sortBy: "date",
        totalItems: 0,
        pages: 0
    };

    private trades: TradeRow[] = [];

    private tradesFilter: TradesFilter = null;

    private isEmptySearchResult: boolean = false;

    private TABLES_NAME = TABLES_NAME;
    private ExportType = ExportType;

    /**
     * Загрузка сделок будет произведена в вотчере на объект с паджинацией
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.tradesFilter = this.tradesFilterService.getFilter(StoreKeys.TRADES_FILTER_SETTINGS_KEY);
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
        UI.on(EventType.TRADE_UPDATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
        UI.off(EventType.TRADE_UPDATED);
    }

    private getHeaders(): TableHeader[] {
        return this.tablesService.getFilterHeaders(this.TABLES_NAME.TRADE, !this.allowActions);
    }

    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadTrades();
    }

    private async copyTrade(requestData: CopyMoveTradeRequest): Promise<void> {
        await this.tradeService.copyTrade(requestData);
        this.overviewService.resetCacheForId(requestData.toPortfolioId);
        this.resetCombinedOverviewCache(requestData.toPortfolioId);
        this.$snotify.info("Сделка успешно копирована");
    }

    private async moveTrade(requestData: CopyMoveTradeRequest): Promise<void> {
        await this.tradeService.moveTrade(requestData);
        this.overviewService.resetCacheForId(requestData.fromPortfolioId);
        this.overviewService.resetCacheForId(requestData.toPortfolioId);
        this.resetCombinedOverviewCache(requestData.fromPortfolioId);
        this.resetCombinedOverviewCache(requestData.toPortfolioId);
        await this.loadTrades();
        this.$snotify.info("Сделка успешно перемещена");
    }

    private async resetFilter(): Promise<void> {
        this.tradesFilter = this.tradesFilterService.getDefaultFilter();
        await this.onFilterChange();
    }

    private async onPageChange(): Promise<void> {
        await this.loadTrades();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadTrades();
    }

    @ShowProgress
    private async onDelete(tradeRow: TradeRow): Promise<void> {
        await this.tradeService.deleteTrade({portfolioId: this.portfolio.id, tradeId: tradeRow.id});
        await this.reloadPortfolio();
        await this.loadTrades();
        this.resetCombinedOverviewCache(tradeRow.portfolioId);
        const assetType = AssetType.valueByName(tradeRow.asset);
        this.$snotify.info(`Операция '${tradeRow.operationLabel}' ${assetType === AssetType.MONEY ? "" :
            `по ${assetType === AssetType.ASSET ? "активу" : "бумаге"} ${tradeRow.ticker}`} была успешно удалена`);
    }

    private async loadTrades(): Promise<void> {
        const result = await this.tradeService.loadTrades(
            this.portfolio.id,
            this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage,
            this.pagination.sortBy,
            this.pagination.descending,
            this.tradesFilterService.getTradesFilterRequest(this.tradesFilter),
            this.portfolio.portfolioParams.combinedIds
        );
        this.trades = result.content;
        this.pagination.totalItems = result.totalItems;
        this.pagination.pages = result.pages;
        this.isEmptySearchResult = this.trades.length === 0;
    }

    private async onFilterChange(): Promise<void> {
        await this.loadTrades();
        // при смене фильтра сбрасываем паджинацию чтобы не остаться на несуществующей странице
        this.pagination.page = 1;
        this.tradesFilterService.saveFilter(StoreKeys.TRADES_FILTER_SETTINGS_KEY, this.tradesFilter);
    }

    private resetCombinedOverviewCache(portfolioId: number): void {
        PortfolioUtils.resetCombinedOverviewCache(this.combinedPortfolioParams, portfolioId, this.overviewService);
    }

    private get isDefaultFilter(): boolean {
        return this.tradesFilterService.isDefaultFilter(this.tradesFilter);
    }

    private get allowActions(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }
}
