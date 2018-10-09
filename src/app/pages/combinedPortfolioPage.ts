import {Decimal} from 'decimal.js';
import {DataPoint} from 'highcharts';
import {Inject} from 'typescript-ioc';
import Component from 'vue-class-component';
import {namespace} from 'vuex-class/lib/bindings';
import {ui} from '../app/ui';
import {AssetTable} from '../components/assetTable';
import {BondTable} from '../components/bondTable';
import {BarChart} from '../components/charts/barChart';
import {BondPieChart} from '../components/charts/bondPieChart';
import {PortfolioLineChart} from '../components/charts/portfolioLineChart';
import {SectorsChart} from '../components/charts/sectorsChart';
import {StockPieChart} from '../components/charts/stockPieChart';
import {CombinedPortfoliosTable} from '../components/combinedPortfoliosTable';
import {StockTable} from '../components/stockTable';
import {PortfolioService} from '../services/portfolioService';
import {BigMoney} from '../types/bigMoney';
import {HighStockEventsGroup, SectorChartData} from '../types/charts/types';
import {CombinedData} from '../types/eventObjects';
import {ClientInfo, Overview} from '../types/types';
import {ChartUtils} from '../utils/chartUtils';
import {StoreType} from '../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <dashboard v-if="overview" :data="overview.dashboardData"></dashboard>
            <div style="height: 20px"></div>

            <v-expansion-panel expand :value="$uistate.combinedPanel">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.COMBINED_CONTROL_PANEL">
                    <div slot="header">Управление комбинированным портфелем</div>
                    <v-card>
                        <v-card-text>
                            <combined-portfolios-table :portfolios="clientInfo.user.portfolios" @change="onSetCombined"></combined-portfolios-table>
                        </v-card-text>
                    </v-card>
                    <v-container grid-list-md text-xs-center>
                        <v-layout row wrap>
                            <v-flex xs6>
                                <v-btn color="info" @click.stop="doCombinedPortfolio">Сформировать</v-btn>
                            </v-flex>
                            <v-flex xs6>
                                <v-select :items="['RUB', 'USD']" v-model="viewCurrency" label="Валюта представления" @change="doCombinedPortfolio"
                                          single-line></v-select>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 20px"></div>

            <template v-if="overview">
                <asset-table :assets="overview.assetRows"></asset-table>

                <div style="height: 50px"></div>

                <v-expansion-panel focusable expand :value="$uistate.stocksTablePanel">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.STOCKS">
                        <div slot="header">Акции</div>
                        <v-card>
                            <stock-table :rows="overview.stockPortfolio.rows"></stock-table>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <div style="height: 50px"></div>

                <v-expansion-panel focusable expand :value="$uistate.bondsTablePanel">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.BONDS">
                        <div slot="header">Облигации</div>
                        <v-card>
                            <bond-table :rows="overview.bondPortfolio.rows"></bond-table>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <div style="height: 50px"></div>

                <v-expansion-panel expand :value="$uistate.historyPanel">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.HISTORY_PANEL">
                        <div slot="header">Стоимость портфеля</div>
                        <v-card style="overflow: auto;">
                            <v-card-text>
                                <line-chart :data="lineChartData" :events-chart-data="eventsChartData" balloon-title="Портфель"></line-chart>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <div style="height: 50px"></div>

                <v-expansion-panel expand :value="$uistate.stockGraph">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.STOCK_CHART_PANEL">
                        <div slot="header">Состав портфеля акций</div>
                        <v-card style="overflow: auto;">
                            <v-card-text>
                                <pie-chart :data="stockPieChartData"></pie-chart>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <div style="height: 50px" v-if="overview.bondPortfolio.rows.length > 0"></div>

                <v-expansion-panel v-if="overview.bondPortfolio.rows.length > 0" expand :value="$uistate.bondGraph">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.BOND_CHART_PANEL">
                        <div slot="header">Состав портфеля облигаций</div>
                        <v-card style="overflow: auto;">
                            <v-card-text>
                                <pie-chart :data="bondPieChartData"></pie-chart>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>

                <div style="height: 50px"></div>

                <v-expansion-panel v-if="sectorsChartData" expand :value="$uistate.sectorsGraph">
                    <v-expansion-panel-content :lazy="true" v-state="$uistate.SECTORS_PANEL">
                        <div slot="header">Отрасли</div>
                        <v-card style="overflow: auto;">
                            <v-card-text>
                                <bar-chart :data="sectorsChartData.data" :category-names="sectorsChartData.category" series-name="Отрасли"></bar-chart>
                            </v-card-text>
                        </v-card>
                    </v-expansion-panel-content>
                </v-expansion-panel>
            </template>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, BarChart, StockPieChart, BondPieChart, PortfolioLineChart, SectorsChart, CombinedPortfoliosTable}
})
export class CombinedPortfolioPage extends ui {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @Inject
    private portfolioService: PortfolioService;

    private overview: Overview = null;
    private viewCurrency = 'RUB';

    private lineChartData: any[] = [];
    private eventsChartData: HighStockEventsGroup[] = [];
    private stockPieChartData: DataPoint[] = [];
    private bondPieChartData: DataPoint[] = [];
    private sectorsChartData: SectorChartData = null;

    private async created(): Promise<void> {
        await this.doCombinedPortfolio();
    }

    private async doCombinedPortfolio(): Promise<void> {
        const ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        this.overview = await this.portfolioService.getPortfolioOverviewCombined({ids: ids, viewCurrency: this.viewCurrency});
        this.lineChartData = await this.portfolioService.getCostChartCombined({ids: ids, viewCurrency: this.viewCurrency});
        this.eventsChartData = await this.portfolioService.getEventsChartDataCombined({ids: ids, viewCurrency: this.viewCurrency});
        this.stockPieChartData = this.doStockPieChartData();
        this.bondPieChartData = this.doBondPieChartData();
        this.sectorsChartData = ChartUtils.doSectorsChartData(this.overview);
    }

    private async onSetCombined(data: CombinedData): Promise<void> {
        await this.portfolioService.setCombinedFlag(data.id, data.combined);
    }

    private doStockPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.overview.stockPortfolio.rows.filter(value => value.currCost != '0').forEach(row => {
            data.push({
                name: row.stock.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }

    private doBondPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.overview.bondPortfolio.rows.filter(value => value.currCost != '0').forEach(row => {
            data.push({
                name: row.bond.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }
}
