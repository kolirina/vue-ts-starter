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
import {AssetTable} from "../components/assetTable";
import {BondTable} from "../components/bondTable";
import {PieChart} from "../components/charts/pieChart";
import {PortfolioLineChart} from "../components/charts/portfolioLineChart";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {PortfolioRowFilter, PortfolioRowsTableFilter} from "../components/portfolioRowsTableFilter";
import {StockTable} from "../components/stockTable";
import {Storage} from "../platform/services/storage";
import {ExportType} from "../services/exportService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {HighStockEventsGroup, SectorChartData} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {BondPortfolioRow, Overview, StockPortfolioRow, TableHeader} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {UiStateHelper} from "../utils/uiStateHelper";

@Component({
    // language=Vue
    template: `
        <v-container v-if="overview" fluid class="paddT0">
            <v-layout column>
                <dashboard :data="overview.dashboardData" :view-currency="viewCurrency" :side-bar-opened="sideBarOpened"></dashboard>

                <slot name="afterDashboard"></slot>

                <asset-table :assets="overview.assetRows" v-if="blockNotEmpty(emptyBlockType.DEFAULT)" class="mt-3"></asset-table>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.STOCK_PORTFOLIO)" :value="$uistate.stocksTablePanel"
                                :withMenu="true" name="stock" :state="$uistate.STOCKS" @click="onStockTablePanelClick" class="mt-3">
                    <template #header>
                        <span>Акции</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="stockTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ overview.stockPortfolio.rows.length }} {{ overview.stockPortfolio.rows.length | declension("акция", "акции", "акций") }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template #list>
                        <v-list-tile-title @click="openTableHeadersDialog(TABLES_NAME.STOCK)">Настроить колонки</v-list-tile-title>
                        <v-list-tile-title v-if="exportable" @click="exportTable(ExportType.STOCKS)">Экспорт в xlsx</v-list-tile-title>
                    </template>
                    <portfolio-rows-table-filter :search.sync="stockSearch" :filter.sync="stockFilter" :store-key="StoreKeys.STOCKS_TABLE_FILTER_KEY"></portfolio-rows-table-filter>
                    <stock-table :rows="stockRows" :headers="getHeaders(TABLES_NAME.STOCK)" :search="stockSearch" :filter="stockFilter"
                                :portfolio-id="portfolioId" :view-currency="viewCurrency" :share-notes="shareNotes"></stock-table>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.BOND_PORTFOLIO)" :value="$uistate.bondsTablePanel"
                                :withMenu="true" name="bond" :state="$uistate.BONDS" @click="onBondTablePanelClick" class="mt-3">
                    <template #header>
                        <span>Облигации</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="bondTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ overview.bondPortfolio.rows.length }}
                                {{ overview.bondPortfolio.rows.length | declension("облигация", "облигации", "облигаций") }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template #list>
                        <v-list-tile-title @click="openTableHeadersDialog('bondTable')">Настроить колонки</v-list-tile-title>
                        <v-list-tile-title v-if="exportable" @click="exportTable(ExportType.BONDS)">Экспорт в xlsx</v-list-tile-title>
                    </template>
                    <portfolio-rows-table-filter :search.sync="bondSearch" :filter.sync="bondFilter" :store-key="StoreKeys.BONDS_TABLE_FILTER_KEY"></portfolio-rows-table-filter>
                    <bond-table :rows="bondRows" :headers="getHeaders(TABLES_NAME.BOND)" :search="bondSearch" :filter="bondFilter"
                                :portfolio-id="portfolioId" :view-currency="viewCurrency" :share-notes="shareNotes"></bond-table>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.DEFAULT)" :value="$uistate.historyPanel"
                                :state="$uistate.HISTORY_PANEL" @click="onPortfolioLineChartPanelStateChanges" customMenu class="mt-3">
                    <template #header>Стоимость портфеля</template>
                    <template #customMenu>
                        <chart-export-menu v-if="lineChartData && lineChartEvents" @print="print('portfolioLineChart')" @exportTo="exportTo('portfolioLineChart', $event)"
                                        class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <portfolio-line-chart v-if="lineChartData && lineChartEvents" ref="portfolioLineChart" :data="lineChartData"
                                            :state-key-prefix="stateKeyPrefix"
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

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.DEFAULT)" :value="$uistate.assetGraph" :state="$uistate.ASSET_CHART_PANEL" customMenu class="mt-3">
                    <template #header>Состав портфеля по активам</template>
                    <template #customMenu>
                        <chart-export-menu @print="print('assetsPieChart')" @exportTo="exportTo('assetsPieChart', $event)" class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <!-- Валюта тут не нужна так как валюта будет браться из каждого актива в отдельности -->
                        <pie-chart ref="assetsPieChart" :data="assetsPieChartData" :balloon-title="portfolioName" tooltip-format="ASSETS"></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.STOCK_PORTFOLIO)" :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL" customMenu class="mt-3">
                    <template #header>Состав портфеля акций</template>
                    <template #customMenu>
                        <chart-export-menu @print="print('stockPieChart')" @exportTo="exportTo('stockPieChart', $event)" class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart ref="stockPieChart" :data="stockPieChartData" :view-currency="viewCurrency"></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.BOND_PORTFOLIO)" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL" customMenu class="mt-3">
                    <template #header>Состав портфеля облигаций</template>
                    <template #customMenu>
                        <chart-export-menu @print="print('bondPieChart')" @exportTo="exportTo('bondPieChart', $event)" class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart ref="bondPieChart" :data="bondPieChartData" :view-currency="viewCurrency"></pie-chart>
                    </v-card-text>
                </expanded-panel>

                <expanded-panel v-if="blockNotEmpty(emptyBlockType.STOCK_PORTFOLIO)" :value="$uistate.sectorsGraph" :state="$uistate.SECTORS_PANEL" customMenu class="mt-3">
                    <template #header>Состав портфеля по секторам</template>
                    <template #customMenu>
                        <chart-export-menu @print="print('sectorsChart')" @exportTo="exportTo('sectorsChart', $event)" class="exp-panel-menu"></chart-export-menu>
                    </template>
                    <v-card-text>
                        <pie-chart ref="sectorsChart" :data="sectorsChartData.data" :balloon-title="portfolioName" :view-currency="viewCurrency"></pie-chart>
                    </v-card-text>
                </expanded-panel>
            </v-layout>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, PortfolioLineChart, PortfolioRowsTableFilter}
})
export class BasePortfolioPage extends UI {

    $refs: {
        portfolioLineChart: PortfolioLineChart,
        assetsPieChart: PieChart,
        stockPieChart: PieChart,
        bondPieChart: PieChart,
        sectorsChart: PieChart
    };

    /** Данные по портфелю */
    @Prop({default: null, required: true})
    private overview: Overview;
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
    /** Признак публичной зоны */
    @Prop({type: Boolean, default: false, required: false})
    private publicZone: boolean;
    /** Признак открытой боковой панели */
    @Prop({required: true, type: Boolean, default: true})
    private sideBarOpened: boolean;
    @Inject
    private tablesService: TablesService;
    @Inject
    private storageService: Storage;
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
    /** Признак закрытой панели Облигации */
    private bondTablePanelClosed = true;
    /** Данные для графика таблицы Активы */
    private assetsPieChartData: DataPoint[] = [];
    /** Данные для графика таблицы Акции */
    private stockPieChartData: DataPoint[] = [];
    /** Данные для графика таблицы Облигации */
    private bondPieChartData: DataPoint[] = [];
    /** Данные для графика секторов */
    private sectorsChartData: SectorChartData = null;
    /** Поисковый запрос по табилце Акции */
    private stockSearch = "";
    /** Фильтр таблицы Акции */
    private stockFilter: PortfolioRowFilter = {};
    /** Поисковый запрос по табилце Облигации */
    private bondSearch = "";
    /** Фильтр таблицы Облигации */
    private bondFilter: PortfolioRowFilter = {};
    /** Типы возможных пустых блоков */
    private emptyBlockType = EmptyBlockType;

    /**
     * Инициализация данных компонента
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.stockTablePanelClosed = UiStateHelper.stocksTablePanel[0] === 0;
        this.bondTablePanelClosed = UiStateHelper.bondsTablePanel[0] === 0;
        this.assetsPieChartData = this.doAssetsPieChartData();
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = this.doSectorsChartData();
        this.stockFilter = this.storageService.get(StoreKeys.STOCKS_TABLE_FILTER_KEY, {});
        this.bondFilter = this.storageService.get(StoreKeys.BONDS_TABLE_FILTER_KEY, {});
    }

    @Watch("overview")
    private async onPortfolioChange(): Promise<void> {
        this.assetsPieChartData = this.doAssetsPieChartData();
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = this.doSectorsChartData();
    }

    private blockNotEmpty(type: EmptyBlockType): boolean {
        switch (type) {
            case EmptyBlockType.DEFAULT:
                return this.overview.bondPortfolio.rows.length !== 0 || this.overview.stockPortfolio.rows.length !== 0;
            case EmptyBlockType.BOND_PORTFOLIO:
                return this.overview.bondPortfolio.rows.length > 0;
            case EmptyBlockType.STOCK_PORTFOLIO:
                return this.overview.stockPortfolio.rows.length > 0;
        }
    }

    private doStockPieChartData(): DataPoint[] {
        return ChartUtils.doStockPieChartData(this.overview);
    }

    private doBondPieChartData(): DataPoint[] {
        return ChartUtils.doBondPieChartData(this.overview);
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

    private async print(chart: string): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.print();
    }

    private async exportTo(chart: string, type: string): Promise<void> {
        ((this.$refs as any)[chart] as PieChart).chart.exportChart({type: ChartUtils.EXPORT_TYPES[type], filename: `${chart}_${this.portfolioId || "combined"}`});
    }

    private get stockRows(): StockPortfolioRow[] {
        return [...this.overview.stockPortfolio.rows, this.overview.stockPortfolio.sumRow as StockPortfolioRow];
    }

    private get bondRows(): BondPortfolioRow[] {
        return [...this.overview.bondPortfolio.rows, this.overview.bondPortfolio.sumRow as BondPortfolioRow];
    }

}

export enum EventType {
    reloadLineChart = "reloadLineChart",
    exportTable = "exportTable",
}

export enum EmptyBlockType {
    DEFAULT = "default",
    STOCK_PORTFOLIO = "stockPortfolio",
    BOND_PORTFOLIO = "bondPortfolio"
}
