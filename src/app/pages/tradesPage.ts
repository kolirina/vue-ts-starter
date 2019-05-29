import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AdditionalPagination} from "../components/additionalPagination";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {EmptySearchResult} from "../components/emptySearchResult";
import {ExpandedPanel} from "../components/expandedPanel";
import {TradesTable} from "../components/tradesTable";
import {TradesTableFilter} from "../components/tradesTableFilter";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {ExportService, ExportType} from "../services/exportService";
import {FilterService} from "../services/filterService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {TradeService, TradesFilter} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {StoreKeys} from "../types/storeKeys";
import {Tariff} from "../types/tariff";
import {Pagination, Portfolio, TableHeader, TablePagination, TradeRow} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {DateUtils} from "../utils/dateUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="paddT0">
            <dashboard :data="portfolio.overview.dashboardData" :side-bar-opened="sideBarOpened" :view-currency="portfolio.portfolioParams.viewCurrency"></dashboard>

            <expanded-panel :disabled="true" :withMenu="true" name="trades" :alwaysOpen="true" :value="[true]" class="auto-cursor">
                <template #header>Сделки</template>
                <template #list>
                    <v-list-tile-title @click="openTableSettings(TABLES_NAME.TRADE)">Настроить колонки</v-list-tile-title>
                    <v-list-tile-title @click="exportTable(ExportType.TRADES)">Экспорт в xlsx</v-list-tile-title>
                    <v-list-tile-title :disabled="isDownloadNotAllowed()" @click="downloadFile">Экспорт в csv</v-list-tile-title>
                </template>
                <v-layout>
                    <trades-table-filter v-if="tradesFilter" :store-key="StoreKeys.TRADES_FILTER_SETTINGS_KEY" @filter="onFilterChange" :filter="tradesFilter"
                                         :is-default="isDefaultFilter"></trades-table-filter>
                    <v-spacer></v-spacer>
                    <additional-pagination :pagination="tradePagination.pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
                </v-layout>
                <empty-search-result v-if="isEmptySearchResult" @resetFilter="resetFilter"></empty-search-result>
                <trades-table v-else :trades="trades" :trade-pagination="tradePagination"
                              :headers="getHeaders(TABLES_NAME.TRADE)" @delete="onDelete" @resetFilter="resetFilter" @update:pagination="onTablePaginationChange"></trades-table>
            </expanded-panel>
        </v-container>
    `,
    components: {TradesTable, ExpandedPanel, TradesTableFilter, AdditionalPagination, EmptySearchResult}
})
export class TradesPage extends UI {

    @Inject
    tablesService: TablesService;
    @Inject
    private tradeService: TradeService;
    @Inject
    private filterService: FilterService;
    @Inject
    private exportService: ExportService;

    /** Инофрмация о пользователе */
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
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

    private tradePagination: TablePagination = {
        pagination: this.pagination
    };

    private trades: TradeRow[] = [];

    private tradesFilter: TradesFilter = null;

    private headers: TableHeaders = this.tablesService.headers;

    private isEmptySearchResult: boolean = false;

    private TABLES_NAME = TABLES_NAME;
    private ExportType = ExportType;

    /**
     * Загрузка сделок будет произведена в вотчере на объект с паджинацией
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.tradesFilter = this.filterService.getFilter(StoreKeys.TRADES_FILTER_SETTINGS_KEY);
    }

    getHeaders(name: string): TableHeader[] {
        return this.tablesService.getFilterHeaders(name);
    }

    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadTrades();
    }

    /**
     * Открывает диалог с настройкой заголовков таблицы
     */
    private async openTableSettings(tableName: string): Promise<void> {
        await new TableSettingsDialog().show({
            tableName: tableName,
            headers: this.headers[tableName]
        });
    }

    private async resetFilter(): Promise<void> {
        this.tradesFilter = this.filterService.getDefaultFilter();
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
        await this.reloadPortfolio(this.portfolio.id);
        await this.loadTrades();
        this.$snotify.info(`Операция '${tradeRow.operationLabel}' ${AssetType.valueByName(tradeRow.asset) === AssetType.MONEY ? "" :
            `по бумаге ${tradeRow.ticker}`} была успешно удалена`);
    }

    @ShowProgress
    private async loadTrades(): Promise<void> {
        const result = await this.tradeService.loadTrades(
            this.portfolio.id,
            this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage,
            this.tradePagination.pagination.sortBy,
            this.tradePagination.pagination.descending,
            this.filterService.getTradesFilterRequest(this.tradesFilter)
        );
        this.trades = result.content;
        this.pagination.totalItems = result.totalItems;
        this.pagination.pages = result.pages;
        this.tradePagination.pagination = this.pagination;
        this.isEmptySearchResult = this.trades.length === 0;
    }

    @ShowProgress
    private async exportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }

    /**
     * Отправляет запрос на скачивание файла со сделками в формате csv
     */
    @ShowProgress
    private async downloadFile(): Promise<void> {
        await this.exportService.exportTrades(this.portfolio.id);
    }

    private async onFilterChange(): Promise<void> {
        await this.loadTrades();
        // при смене фильтра сбрасываем паджинацию чтобы не остаться на несуществующей странице
        this.pagination.page = 1;
        this.filterService.saveFilter(StoreKeys.TRADES_FILTER_SETTINGS_KEY, this.tradesFilter);
    }

    private get isDefaultFilter(): boolean {
        return this.filterService.isDefaultFilter(this.tradesFilter);
    }

    /**
     * Возвращает признак доступности для загрузки файла со сделками
     */
    private isDownloadNotAllowed(): boolean {
        const userTariff = this.clientInfo.user.tariff;
        return userTariff === Tariff.TRIAL || (dayjs().isAfter(DateUtils.parseDate(this.clientInfo.user.paidTill)) && userTariff !== Tariff.FREE);
    }
}
