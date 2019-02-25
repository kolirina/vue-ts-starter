import {Decimal} from "decimal.js";
import {DataPoint} from "highcharts";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {BondTable} from "../components/bondTable";
import {BarChart} from "../components/charts/barChart";
import {BondPieChart} from "../components/charts/bondPieChart";
import {PortfolioLineChart} from "../components/charts/portfolioLineChart";
import {SectorsChart} from "../components/charts/sectorsChart";
import {StockPieChart} from "../components/charts/stockPieChart";
import {CombinedPortfoliosTable} from "../components/combinedPortfoliosTable";
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {ExpandedPanel} from "../components/expandedPanel";
import {StockTable} from "../components/stockTable";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {BigMoney} from "../types/bigMoney";
import {HighStockEventsGroup, SectorChartData} from "../types/charts/types";
import {CombinedData} from "../types/eventObjects";
import {StoreKeys} from "../types/storeKeys";
import {Overview, TableHeader} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="paddT0">
            <dashboard v-if="overview" :data="overview.dashboardData"></dashboard>
            <div style="height: 20px"></div>

            <expanded-panel :value="$uistate.combinedPanel" :state="$uistate.COMBINED_CONTROL_PANEL">
                <template slot="header">Управление комбинированным портфелем</template>

                <v-card-text>
                    <combined-portfolios-table :portfolios="clientInfo.user.portfolios" @change="onSetCombined"></combined-portfolios-table>
                </v-card-text>

                <v-container slot="underCard" grid-list-md text-xs-center>
                    <v-layout row wrap>
                        <v-flex xs6>
                            <v-btn color="info" @click.stop="doCombinedPortfolio">Сформировать</v-btn>
                        </v-flex>
                        <v-flex xs6>
                            <v-select :items="['RUB', 'USD', 'EUR']" v-model="viewCurrency" label="Валюта представления" @change="doCombinedPortfolio"
                                      single-line></v-select>
                        </v-flex>
                    </v-layout>
                </v-container>
            </expanded-panel>

            <div style="height: 30px"></div>

            <template v-if="overview">
                <asset-table :assets="overview.assetRows"></asset-table>

                <div style="height: 30px"></div>

                <expanded-panel :value="$uistate.stocksTablePanel" :withMenu="true" name="stock" :state="$uistate.STOCKS" @click="onStockTablePanelClick">
                    <template slot="header">
                        <span>Акции</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="stockTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ overview.stockPortfolio.rows.length }} {{ overview.stockPortfolio.rows.length | declension("акция", "акции", "акций") }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template slot="list">
                        <v-list-tile-title @click="openTableHeadersDialog(TABLES_NAME.STOCK)">Настроить колонки</v-list-tile-title>
                    </template>
                    <stock-table :rows="overview.stockPortfolio.rows" :headers="getHeaders(TABLES_NAME.STOCK)"></stock-table>
                </expanded-panel>

                <div style="height: 30px"></div>

                <expanded-panel :value="$uistate.bondsTablePanel" :withMenu="true" name="bond" :state="$uistate.BONDS" @click="onBondTablePanelClick">
                    <template slot="header">
                        <span>Облигации</span>
                        <v-fade-transition mode="out-in">
                            <span v-if="bondTablePanelClosed" class="v-expansion-panel__header-info">
                                {{ overview.bondPortfolio.rows.length }} {{ overview.bondPortfolio.rows.length | declension("облигация", "облигации", "облигаций") }}
                            </span>
                        </v-fade-transition>
                    </template>
                    <template slot="list">
                        <v-list-tile-title @click="openTableHeadersDialog('bondTable')">Настроить колонки</v-list-tile-title>
                    </template>
                    <bond-table :rows="overview.bondPortfolio.rows" :headers="getHeaders(TABLES_NAME.BOND)"></bond-table>
                </expanded-panel>

                <div style="height: 30px"></div>

                <expanded-panel :value="$uistate.historyPanel" :state="$uistate.HISTORY_PANEL" @click="onPortfolioLineChartPanelStateChanges">
                    <template slot="header">Стоимость портфеля</template>
                    <v-card-text>
                        <portfolio-line-chart v-if="lineChartData && eventsChartData"
                                              :data="lineChartData" :events-chart-data="eventsChartData" :state-key="StoreKeys.PORTFOLIO_COMBINED_CHART_RANGE"
                                              balloon-title="Портфель"></portfolio-line-chart>
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

                <expanded-panel :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL">
                    <template slot="header">Состав портфеля акций</template>
                    <v-card-text>
                        <v-card-text>
                            <pie-chart :data="stockPieChartData"></pie-chart>
                        </v-card-text>
                    </v-card-text>
                </expanded-panel>

                <div style="height: 30px" v-if="overview.bondPortfolio.rows.length > 0"></div>

                <expanded-panel v-if="overview.bondPortfolio.rows.length > 0" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL">
                    <template slot="header">Состав портфеля облигаций</template>
                    <v-card-text>
                        <v-card-text>
                            <pie-chart :data="bondPieChartData"></pie-chart>
                        </v-card-text>
                    </v-card-text>
                </expanded-panel>

                <div style="height: 30px"></div>

                <expanded-panel v-if="sectorsChartData" :value="$uistate.sectorsGraph" :state="$uistate.SECTORS_PANEL">
                    <template slot="header">Состав портфеля по секторам</template>
                    <v-card-text>
                        <v-card-text>
                            <pie-chart :data="sectorsChartData.data" balloon-title=""></pie-chart>
                        </v-card-text>
                    </v-card-text>
                </expanded-panel>
            </template>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, ExpandedPanel, BarChart, StockPieChart, BondPieChart, PortfolioLineChart, SectorsChart, CombinedPortfoliosTable}
})
export class CombinedPortfolioPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @Inject
    private overviewService: OverviewService;
    @Inject
    private tablesService: TablesService;
    private overview: Overview = null;
    private viewCurrency = "RUB";

    private lineChartData: any[] = null;
    private eventsChartData: HighStockEventsGroup[] = null;
    private stockPieChartData: DataPoint[] = [];
    private bondPieChartData: DataPoint[] = [];
    private sectorsChartData: SectorChartData = null;
    private headers: TableHeaders = this.tablesService.headers;
    private TABLES_NAME = TABLES_NAME;
    private StoreKeys = StoreKeys;
    private stockTablePanelClosed = true;
    private bondTablePanelClosed = true;

    async created(): Promise<void> {
        await this.doCombinedPortfolio();
        this.stockTablePanelClosed = UiStateHelper.stocksTablePanel[0] === 0;
        this.bondTablePanelClosed = UiStateHelper.bondsTablePanel[0] === 0;
    }

    @CatchErrors
    @ShowProgress
    private async doCombinedPortfolio(): Promise<void> {
        const ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        this.overview = await this.overviewService.getPortfolioOverviewCombined({ids: ids, viewCurrency: this.viewCurrency});
        await this.loadPortfolioLineChart();
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = ChartUtils.doSectorsChartData(this.overview);
    }

    @CatchErrors
    @ShowProgress
    private async onSetCombined(data: CombinedData): Promise<void> {
        await this.overviewService.setCombinedFlag(data.id, data.combined);
    }

    private async onPortfolioLineChartPanelStateChanges(): Promise<void> {
        await this.loadPortfolioLineChart();
    }

    private onStockTablePanelClick(): void {
        this.stockTablePanelClosed = UiStateHelper.stocksTablePanel[0] === 0;
    }

    private onBondTablePanelClick(): void {
        this.bondTablePanelClosed = UiStateHelper.bondsTablePanel[0] === 0;
    }

    private async loadPortfolioLineChart(): Promise<void> {
        const ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        if (UiStateHelper.historyPanel[0] === 1) {
            this.lineChartData = await this.overviewService.getCostChartCombined({ids: ids, viewCurrency: this.viewCurrency});
            this.eventsChartData = await this.overviewService.getEventsChartDataCombined({ids: ids, viewCurrency: this.viewCurrency});
        }
    }

    private doStockPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.overview.stockPortfolio.rows.filter(value => value.currCost !== "0").forEach(row => {
            data.push({
                name: row.stock.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }

    private doBondPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.overview.bondPortfolio.rows.filter(value => value.currCost !== "0").forEach(row => {
            data.push({
                name: row.bond.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }

    private getHeaders(name: string): TableHeader[] {
        return this.tablesService.getFilterHeaders(name);
    }

    private async openTableHeadersDialog(tableName: string): Promise<void> {
        await new TableSettingsDialog().show({
            tableName: tableName,
            headers: this.headers[tableName]
        });
    }
}
