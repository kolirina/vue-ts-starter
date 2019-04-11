import dayjs from "dayjs";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
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
import {DateUtils} from "../utils/dateUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="paddT0">
            <dashboard :data="portfolio.overview.dashboardData" :side-bar-opened="sideBarOpened" :view-currency="portfolio.portfolioParams.viewCurrency"></dashboard>

            <expanded-panel :disabled="true" :withMenu="true" name="trades" :alwaysOpen="true" :value="[true]">
                <template #header>Сделки</template>
                <template #list>
                    <v-list-tile-title @click="openTableSettings(TABLES_NAME.TRADE)">Настроить колонки</v-list-tile-title>
                    <v-list-tile-title @click="exportTable(ExportType.TRADES)">Экспорт в xlsx</v-list-tile-title>
                    <v-list-tile-title :disabled="isDownloadNotAllowed()" @click="downloadFile">Экспорт в csv</v-list-tile-title>
                </template>
                <trades-table-filter v-if="tradesFilter" :store-key="StoreKeys.TRADES_FILTER_SETTINGS_KEY" @filter="onFilterChange" :filter="tradesFilter"
                                     :is-default="isDefaultFilter"></trades-table-filter>
                <trades-table v-if="tradePagination" :trades="trades" :trade-pagination="tradePagination"
                              :headers="getHeaders(TABLES_NAME.TRADE)" @delete="onDelete"></trades-table>
            </expanded-panel>

            <v-container v-if="pages > 1">
                <v-layout align-center justify-center row>
                    <v-pagination v-model="pagination.page" @input="onPageChange" :length="pages"></v-pagination>
                </v-layout>
            </v-container>
        </v-container>
    `,
    components: {TradesTable, ExpandedPanel, TradesTableFilter}
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
    /** Общее количество сделок */
    private totalTrades = 0;
    /** Количество страниц */
    private pages = 0;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;

    private pagination: Pagination = {
        descending: true,
        page: 1,
        rowsPerPage: 50,
        sortBy: "date",
        totalItems: this.totalTrades
    };

    private tradePagination: TablePagination = {
        pagination: this.pagination,
        totalItems: this.totalTrades
    };

    private trades: TradeRow[] = [];

    private tradesFilter: TradesFilter = null;

    private headers: TableHeaders = this.tablesService.headers;

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

    /**
     * Открывает диалог с настройкой заголовков таблицы
     */
    private async openTableSettings(tableName: string): Promise<void> {
        await new TableSettingsDialog().show({
            tableName: tableName,
            headers: this.headers[tableName]
        });
    }

    private async onPageChange(): Promise<void> {
        await this.loadTrades();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadTrades();
    }

    @Watch("tradePagination.pagination", {deep: true})
    private async onTradePaginationChange(): Promise<void> {
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
        this.totalTrades = result.totalItems;
        this.pages = result.pages;
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
