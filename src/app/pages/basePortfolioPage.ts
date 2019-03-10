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
import {namespace} from "vuex-class/lib/bindings";
import {Component, Prop, UI, Watch} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {BondTable} from "../components/bondTable";
import {AssetChart} from "../components/charts/assetChart";
import {PortfolioLineChart} from "../components/charts/portfolioLineChart";
import {SectorsChart} from "../components/charts/sectorsChart";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {PortfolioRowFilter, PortfolioRowsTableFilter} from "../components/portfolioRowsTableFilter";
import {StockTable} from "../components/stockTable";
import {Storage} from "../platform/services/storage";
import {ExportType} from "../services/exportService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {HighStockEventsGroup, SectorChartData} from "../types/charts/types";
import {StoreKeys} from "../types/storeKeys";
import {Overview, TableHeader} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="overview" fluid class="paddT0">
            <dashboard :data="overview.dashboardData"></dashboard>

            <div style="height: 30px"></div>

            <slot name="afterDashboard"></slot>

            <div style="height: 30px"></div>

            <asset-table :assets="overview.assetRows"></asset-table>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.stocksTablePanel" :withMenu="true" name="stock" :state="$uistate.STOCKS" @click="onStockTablePanelClick">
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
                <stock-table :rows="overview.stockPortfolio.rows" :headers="getHeaders(TABLES_NAME.STOCK)" :search="stockSearch" :filter="stockFilter"></stock-table>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.bondsTablePanel" :withMenu="true" name="bond" :state="$uistate.BONDS" @click="onBondTablePanelClick">
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
                <bond-table :rows="overview.bondPortfolio.rows" :headers="getHeaders(TABLES_NAME.BOND)" :search="bondSearch" :filter="bondFilter"></bond-table>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.historyPanel" :state="$uistate.HISTORY_PANEL" @click="onPortfolioLineChartPanelStateChanges">
                <template #header>Стоимость портфеля</template>
                <v-card-text>
                    <portfolio-line-chart v-if="lineChartData && lineChartEvents" :data="lineChartData"
                                          :state-key="StoreKeys.PORTFOLIO_CHART_RANGE"
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

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.assetGraph" :state="$uistate.ASSET_CHART_PANEL">
                <template #header>Состав портфеля по активам</template>
                <v-card-text>
                    <pie-chart :data="assetsPieChartData" :balloon-title="portfolioName" :view-currency="viewCurrency"></pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL">
                <template #header>Состав портфеля акций</template>
                <v-card-text>
                    <pie-chart :data="stockPieChartData" :view-currency="viewCurrency"></pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px" v-if="overview.bondPortfolio.rows.length > 0"></div>

            <expanded-panel v-if="overview.bondPortfolio.rows.length > 0" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL">
                <template #header>Состав портфеля облигаций</template>
                <v-card-text>
                    <pie-chart :data="bondPieChartData" :view-currency="viewCurrency"></pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.sectorsGraph" :state="$uistate.SECTORS_PANEL">
                <template #header>Состав портфеля по секторам</template>
                <v-card-text>
                    <pie-chart :data="sectorsChartData.data" :balloon-title="portfolioName" :view-currency="viewCurrency"></pie-chart>
                </v-card-text>
            </expanded-panel>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, PortfolioLineChart, SectorsChart, PortfolioRowsTableFilter}
})
export class BasePortfolioPage extends UI {

    /** Данные по портфелю */
    @Prop({default: null, required: true})
    private overview: Overview;
    /** Данные по портфелю */
    @Prop({default: "", type: String, required: false})
    private portfolioName: string;
    /** Данные по графику стоимости портфеля */
    @Prop({required: false})
    private lineChartData: any[];
    /** Данные по событиям графика стоимости портфеля */
    @Prop({required: false})
    private lineChartEvents: HighStockEventsGroup[];
    /** Признак доступности экспорта таблиц */
    @Prop({type: Boolean, required: false})
    private exportable: boolean;
    @Prop({required: true, type: String})
    private viewCurrency: string;
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
}

export enum EventType {
    reloadLineChart = "reloadLineChart",
    exportTable = "exportTable",
}
