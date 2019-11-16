/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {DataPoint} from "highcharts";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI, Watch} from "../app/ui";
import {PieChart} from "../components/charts/pieChart";
import {PortfolioLineChart} from "../components/charts/portfolioLineChart";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {NegativeBalanceNotification} from "../components/negativeBalanceNotification";
import {PortfolioRowFilter, PortfolioRowsTableFilter} from "../components/portfolioRowsTableFilter";
import {AggregateAssetTable} from "../components/tables/aggregateAssetTable";
import {AssetTable} from "../components/tables/assetTable";
import {BondTable} from "../components/tables/bondTable";
import {StockTable} from "../components/tables/stockTable";
import {Filters} from "../platform/filters/Filters";
import {Storage} from "../platform/services/storage";
import {ExportType} from "../services/exportService";
import {PortfolioBlockType} from "../services/onBoardingTourService";
import {OverviewService} from "../services/overviewService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {ChartType, HighStockEventsGroup, SectorChartData} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {AssetPortfolioRow, BlockType, BondPortfolioRow, EventType, Overview, StockPortfolioRow, TableHeader} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {PortfolioUtils} from "../utils/portfolioUtils";
import {UiStateHelper} from "../utils/uiStateHelper";

@Component({
    // language=Vue
    template: `
        <v-container v-if="overview" fluid class="paddT0">
            <v-layout column>
                <dashboard :data="overview.dashboardData" :view-currency="viewCurrency" :side-bar-opened="sideBarOpened"
                           :data-v-step="getTourStepIndex(PortfolioBlockType.DASHBOARD)"></dashboard>

                <negative-balance-notification v-if="showNegativeBalance"></negative-balance-notification>

                <slot name="afterDashboard"></slot>

                <aggregate-asset-table v-if="blockNotEmpty(emptyBlockType.AGGREGATE)" :assets="overview.assetRows" class="mt-3"
                                       :data-v-step="getTourStepIndex(PortfolioBlockType.AGGREGATE_TABLE)"></aggregate-asset-table>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.STOCK_PORTFOLIO)" :value="$uistate.stocksTablePanel"
                                :withMenu="true" name="stock" :state="$uistate.STOCKS" @click="onStockTablePanelClick" class="mt-3 selectable"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.STOCK_TABLE)">
                    <template #header>
                        <span>Акции</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="stockTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ stockRowsCountLabel }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template #list>
                        <v-list-tile-title @click="openTableHeadersDialog(TABLES_NAME.STOCK)">Настроить колонки</v-list-tile-title>
                        <v-list-tile-title v-if="exportable" @click="exportTable(ExportType.STOCKS)">Экспорт в xlsx</v-list-tile-title>
                    </template>
                    <portfolio-rows-table-filter :filter.sync="stockFilter" :store-key="StoreKeys.STOCKS_TABLE_FILTER_KEY"></portfolio-rows-table-filter>
                    <stock-table :rows="stockRows" :headers="getHeaders(TABLES_NAME.STOCK)" :search="stockFilter.search" :filter="stockFilter"
                                 :portfolio-id="portfolioId" :view-currency="viewCurrency" :share-notes="shareNotes" :ids="ids"></stock-table>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.BOND_PORTFOLIO)" :value="$uistate.bondsTablePanel"
                                :withMenu="true" name="bond" :state="$uistate.BONDS" @click="onBondTablePanelClick" class="mt-3 selectable"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.BOND_TABLE)">
                    <template #header>
                        <span>Облигации</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="bondTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ bondRowsCountLabel }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template #list>
                        <v-list-tile-title @click="openTableHeadersDialog('bondTable')">Настроить колонки</v-list-tile-title>
                        <v-list-tile-title v-if="exportable" @click="exportTable(ExportType.BONDS)">Экспорт в xlsx</v-list-tile-title>
                    </template>
                    <portfolio-rows-table-filter :filter.sync="bondFilter" :store-key="StoreKeys.BONDS_TABLE_FILTER_KEY"></portfolio-rows-table-filter>
                    <bond-table :rows="bondRows" :headers="getHeaders(TABLES_NAME.BOND)" :search="bondFilter.search" :filter="bondFilter"
                                :portfolio-id="portfolioId" :view-currency="viewCurrency" :share-notes="shareNotes" :ids="ids"></bond-table>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.ASSETS)" :value="$uistate.assetsTablePanel"
                                :withMenu="true" name="asset" :state="$uistate.ASSET_TABLE" @click="onAssetTablePanelClick" class="mt-3 selectable"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.ASSET_TABLE)">
                    <template #header>
                        <span>Прочие активы</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="assetTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ assetRowsCountLabel }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template #list>
                        <!-- todo assets настрока колонок и экспорт таблицы -->
                        <v-list-tile-title @click="openTableHeadersDialog(TABLES_NAME.ASSET)">Настроить колонки</v-list-tile-title>
                        <v-list-tile-title v-if="exportable" @click="exportTable(ExportType.ASSETS)">Экспорт в xlsx</v-list-tile-title>
                    </template>
                    <portfolio-rows-table-filter :filter.sync="assetFilter" :store-key="StoreKeys.ASSETS_TABLE_FILTER_KEY"></portfolio-rows-table-filter>
                    <asset-table :rows="assetRows" :headers="getHeaders(TABLES_NAME.ASSET)" :search="assetFilter.search" :filter="assetFilter"
                                 :portfolio-id="portfolioId" :view-currency="viewCurrency" :share-notes="shareNotes" :ids="ids"></asset-table>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.HISTORY_PANEL)" :value="$uistate.historyPanel"
                                :state="$uistate.HISTORY_PANEL" @click="onPortfolioLineChartPanelStateChanges" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.HISTORY_CHART)">
                    <template #header>Стоимость портфеля</template>
                    <template #customMenu>
                        <chart-export-menu v-if="lineChartData && lineChartEvents" @print="print(ChartType.PORTFOLIO_LINE_CHART)"
                                           @exportTo="exportTo(ChartType.PORTFOLIO_LINE_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>

                    <v-card-text class="px-1">
                        <portfolio-line-chart v-if="lineChartData && lineChartEvents" :ref="ChartType.PORTFOLIO_LINE_CHART" :data="lineChartData"
                                              :moex-index-data="indexLineChartData" :state-key-prefix="stateKeyPrefix"
                                              :events-chart-data="lineChartEvents" :balloon-title="portfolioName"></portfolio-line-chart>
                        <v-container v-else grid-list-md text-xs-center>
                            <v-layout row wrap>
                                <v-flex xs12>
                                    <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                                </v-flex>
                            </v-layout>
                        </v-container>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.AGGREGATE)" :value="$uistate.aggregateGraph" :state="$uistate.AGGREGATE_CHART_PANEL" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.AGGREGATE_CHART)">
                    <template #header>Состав портфеля по категориям</template>
                    <template #customMenu>
                        <chart-export-menu @print="print(ChartType.AGGREGATE_CHART)" @exportTo="exportTo(ChartType.AGGREGATE_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <!-- Валюта тут не нужна так как валюта будет браться из каждого актива в отдельности -->
                        <pie-chart :ref="ChartType.AGGREGATE_CHART" :data="aggregatePieChartData" :balloon-title="portfolioName"
                                   tooltip-format="ASSETS" v-tariff-expired-hint></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.STOCK_PIE)" :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.STOCK_CHART)">
                    <template #header>Состав портфеля акций</template>
                    <template #customMenu>
                        <chart-export-menu @print="print(ChartType.STOCK_CHART)" @exportTo="exportTo(ChartType.STOCK_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart :ref="ChartType.STOCK_CHART" :data="stockPieChartData" :view-currency="viewCurrency" v-tariff-expired-hint></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.BOND_PIE)" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.BOND_CHART)">
                    <template #header>Состав портфеля облигаций</template>
                    <template #customMenu>
                        <chart-export-menu @print="print(ChartType.BOND_CHART)" @exportTo="exportTo(ChartType.BOND_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart :ref="ChartType.BOND_CHART" :data="bondPieChartData" :view-currency="viewCurrency" v-tariff-expired-hint></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.ASSETS)" :value="$uistate.assetGraph" :state="$uistate.ASSET_CHART_PANEL" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.ASSETS_CHART)">
                    <template #header>Состав портфеля активов</template>
                    <template #customMenu>
                        <chart-export-menu @print="print(ChartType.ASSETS_CHART)" @exportTo="exportTo(ChartType.ASSETS_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart :ref="ChartType.ASSETS_CHART" :data="assetsPieChartData" :balloon-title="portfolioName" v-tariff-expired-hint></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.SECTORS_PIE)" :value="$uistate.sectorsGraph" :state="$uistate.SECTORS_PANEL" customMenu class="mt-3"
                                :data-v-step="getTourStepIndex(PortfolioBlockType.SECTORS_CHART)">
                    <template #header>Состав портфеля по секторам</template>
                    <template #customMenu>
                        <chart-export-menu @print="print(ChartType.SECTORS_CHART)" @exportTo="exportTo(ChartType.SECTORS_CHART, $event)"
                                           class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart v-if="sectorsChartData" :ref="ChartType.SECTORS_CHART" v-tariff-expired-hint
                                   :data="sectorsChartData.data" :balloon-title="portfolioName" :view-currency="viewCurrency"></pie-chart>
                    </v-card-text>
                </expanded-panel>
            </v-layout>
        </v-container>
    `,
    components: {AggregateAssetTable, StockTable, BondTable, AssetTable, PortfolioLineChart, PortfolioRowsTableFilter, NegativeBalanceNotification}
})
export class BasePortfolioPage extends UI {

    $refs: {
        portfolioLineChart: PortfolioLineChart,
        assetsPieChart: PieChart,
        stockPieChart: PieChart,
        bondPieChart: PieChart,
        sectorsChart: PieChart
    };
    @Inject
    private tablesService: TablesService;
    @Inject
    private storageService: Storage;
    @Inject
    private overviewService: OverviewService;
    /** Данные по портфелю */
    @Prop({default: null, required: true})
    private overview: Overview;
    /** Айди портфелей для комбинирования */
    @Prop({default: (): number[] => [], required: false})
    private ids: number[];
    /** Название портфеля */
    @Prop({default: "", type: String, required: false})
    private portfolioName: string;
    /** Идентификатор портфеля */
    @Prop({default: "", type: String, required: false})
    private portfolioId: string;
    /** Заметки по бумагам портфеля */
    @Prop({default: null, type: Object, required: false})
    private shareNotes: { [key: string]: string };
    /** Данные по графику стоимости портфеля */
    @Prop({required: false})
    private lineChartData: any[];
    /** Данные по графику индекса */
    @Prop({required: false})
    private indexLineChartData: any[];
    /** Данные по событиям графика стоимости портфеля */
    @Prop({required: false})
    private lineChartEvents: HighStockEventsGroup[];
    /** Признак доступности экспорта таблиц */
    @Prop({type: Boolean, required: false})
    private exportable: boolean;
    /** Валюта просмотра информации */
    @Prop({required: true, type: String})
    private viewCurrency: string;
    /** Префикс ключа под которым будет хранится состояние */
    @Prop({type: String, required: true})
    private stateKeyPrefix: string;
    /** Признак открытой боковой панели */
    @Prop({required: true, type: Boolean, default: true})
    private sideBarOpened: boolean;
    /** Признак проф. режима */
    @Prop({type: Boolean, default: null})
    private professionalMode: boolean;
    /** Текущий остаток денег в портфеле */
    @Prop({type: String, default: null})
    private currentMoneyRemainder: string;
    /** Список заголовков таблиц */
    private headers: TableHeaders = this.tablesService.headers;
    /** Названия таблиц с заголовками */
    private TABLES_NAME = TABLES_NAME;
    /** Типы экспорта */
    private ExportType = ExportType;
    /** Ключи для сохранения информации */
    private StoreKeys = StoreKeys;
    /** Признак закрытой панели Акции */
    private stockTablePanelClosed = true;
    /** Признак закрытой панели Активы */
    private assetTablePanelClosed = true;
    /** Признак закрытой панели Облигации */
    private bondTablePanelClosed = true;
    /** Данные для графика таблицы Агрегированная информация */
    private aggregatePieChartData: DataPoint[] = [];
    /** Данные для графика таблицы Активы */
    private assetsPieChartData: DataPoint[] = [];
    /** Данные для графика таблицы Акции */
    private stockPieChartData: DataPoint[] = [];
    /** Данные для графика таблицы Облигации */
    private bondPieChartData: DataPoint[] = [];
    /** Данные для графика секторов */
    private sectorsChartData: SectorChartData = null;
    /** Фильтр таблицы Акции */
    private stockFilter: PortfolioRowFilter = {};
    /** Фильтр таблицы Облигации */
    private bondFilter: PortfolioRowFilter = {};
    /** Фильтр таблицы Активы */
    private assetFilter: PortfolioRowFilter = {};
    /** Типы возможных пустых блоков */
    private emptyBlockType = BlockType;
    /** Типы возможных пустых блоков */
    private PortfolioBlockType = PortfolioBlockType;
    /** Индексы блоков */
    private blockIndexes: { [key: string]: number } = {};
    /** Типы круговых диаграмм */
    private ChartType = ChartType;

    /**
     * Инициализация данных компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.stockTablePanelClosed = UiStateHelper.stocksTablePanel[0] === 0;
        this.bondTablePanelClosed = UiStateHelper.bondsTablePanel[0] === 0;
        this.assetTablePanelClosed = UiStateHelper.assetsTablePanel[0] === 0;
        this.aggregatePieChartData = this.doAggregatePieChartData();
        this.assetsPieChartData = this.doAssetsPieChartData();
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = this.doSectorsChartData();
        this.stockFilter = this.storageService.get(StoreKeys.STOCKS_TABLE_FILTER_KEY, {});
        this.bondFilter = this.storageService.get(StoreKeys.BONDS_TABLE_FILTER_KEY, {});
        this.assetFilter = this.storageService.get(StoreKeys.ASSETS_TABLE_FILTER_KEY, {});
        this.blockIndexes = PortfolioUtils.getShowedBlocks(this.overview);
    }

    @Watch("overview")
    private async onPortfolioChange(): Promise<void> {
        this.aggregatePieChartData = this.doAggregatePieChartData();
        this.assetsPieChartData = this.doAssetsPieChartData();
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = this.doSectorsChartData();
        this.blockIndexes = PortfolioUtils.getShowedBlocks(this.overview);
    }

    private blockNotEmpty(type: BlockType): boolean {
        switch (type) {
            case BlockType.HISTORY_PANEL:
                return this.overview.bondPortfolio.rows.length !== 0 || this.overview.stockPortfolio.rows.length !== 0 || this.overview.assetPortfolio.rows.length !== 0;
            case BlockType.BOND_PORTFOLIO:
                return this.overview.bondPortfolio.rows.length > 0;
            case BlockType.STOCK_PORTFOLIO:
                return this.overview.stockPortfolio.rows.length > 0;
            case BlockType.STOCK_PIE:
            case BlockType.SECTORS_PIE:
                return this.overview.stockPortfolio.rows.some(row => row.quantity !== 0);
            case BlockType.BOND_PIE:
                return this.overview.bondPortfolio.rows.some(row => row.quantity !== 0);
            case BlockType.AGGREGATE:
                return this.overview.totalTradesCount > 0;
            case BlockType.ASSETS:
                return this.overview.assetPortfolio.rows.length > 0;
            case BlockType.EMPTY:
                return this.overview.totalTradesCount === 0;
        }
    }

    private doStockPieChartData(): DataPoint[] {
        return ChartUtils.doStockPieChartData(this.overview);
    }

    private doBondPieChartData(): DataPoint[] {
        return ChartUtils.doBondPieChartData(this.overview);
    }

    private doAggregatePieChartData(): DataPoint[] {
        return ChartUtils.doAggregatePieChartData(this.overview);
    }

    private doAssetsPieChartData(): DataPoint[] {
        return ChartUtils.doAssetsPieChartData(this.overview);
    }

    private doSectorsChartData(): SectorChartData {
        return ChartUtils.doSectorsChartData(this.overview);
    }

    private getHeaders(name: string): TableHeader[] {
        return this.tablesService.getFilterHeaders(name);
    }

    private onStockTablePanelClick(): void {
        this.stockTablePanelClosed = UiStateHelper.stocksTablePanel[0] === 0;
    }

    private onAssetTablePanelClick(): void {
        this.assetTablePanelClosed = UiStateHelper.assetsTablePanel[0] === 0;
    }

    private onBondTablePanelClick(): void {
        this.bondTablePanelClosed = UiStateHelper.bondsTablePanel[0] === 0;
    }

    private async onPortfolioLineChartPanelStateChanges(): Promise<void> {
        this.$emit(EventType.reloadLineChart);
    }

    private async openTableHeadersDialog(tableName: string): Promise<void> {
        await new TableSettingsDialog().show({
            tableName: tableName,
            headers: this.headers[tableName]
        });
    }

    private async exportTable(exportType: ExportType): Promise<void> {
        this.$emit(EventType.exportTable, exportType);
    }

    private async print(chart: ChartType): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.print();
    }

    private async exportTo(chart: ChartType, type: string): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.exportChart({type: ChartUtils.EXPORT_TYPES[type], filename: `${chart}_${this.portfolioId || "combined"}`});
    }

    private getTourStepIndex(portfolioBlockType: PortfolioBlockType): number {
        return this.blockIndexes[portfolioBlockType];
    }

    private get stockRows(): StockPortfolioRow[] {
        return [...this.overview.stockPortfolio.rows, this.overview.stockPortfolio.sumRow as StockPortfolioRow];
    }

    private get assetRows(): AssetPortfolioRow[] {
        return [...this.overview.assetPortfolio.rows, this.overview.assetPortfolio.sumRow as AssetPortfolioRow];
    }

    private get bondRows(): BondPortfolioRow[] {
        return [...this.overview.bondPortfolio.rows, this.overview.bondPortfolio.sumRow as BondPortfolioRow];
    }

    private get showNegativeBalance(): boolean {
        return Number(this.currentMoneyRemainder) < 0 && !this.professionalMode;
    }

    private get stockRowsCountLabel(): string {
        const count = this.overview.stockPortfolio.rows.filter(row => row.quantity !== 0).length;
        return `${count} ${Filters.declension(count, "акция", "акции", "акций")}`;
    }

    private get assetRowsCountLabel(): string {
        const count = this.overview.assetPortfolio.rows.filter(row => row.quantity !== 0).length;
        return `${count} ${Filters.declension(count, "актив", "актива", "активов")}`;
    }

    private get bondRowsCountLabel(): string {
        const count = this.overview.bondPortfolio.rows.filter(row => row.quantity !== 0).length;
        return `${count} ${Filters.declension(count, "облигация", "облигации", "облигаций")}`;
    }
}
