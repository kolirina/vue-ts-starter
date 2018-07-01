import Component from 'vue-class-component';
import {UI} from '../app/UI';
import {AssetTable} from '../components/assetTable';
import {Portfolio} from '../types/types';
import {StockTable} from '../components/stockTable';
import {StoreType} from '../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {BondTable} from '../components/bondTable';
import {BarChart} from '../components/charts/barChart';
import {StockPieChart} from '../components/charts/stockPieChart';
import {BondPieChart} from '../components/charts/bondPieChart';
import {PortfolioLineChart} from '../components/charts/portfolioLineChart';
import {SectorsChart} from "../components/charts/sectorsChart";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <asset-table :assets="portfolio.overview.assetRows"></asset-table>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable expand :value="$uistate.stocksTablePanel">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.STOCKS">
                    <div slot="header">Акции</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.stockPortfolio.rows" :loading="loading"></stock-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable expand :value="$uistate.bondsTablePanel">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.BONDS">
                    <div slot="header">Облигации</div>
                    <v-card>
                        <bond-table :rows="portfolio.overview.bondPortfolio.rows"></bond-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable expand :value="$uistate.historyPanel">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.HISTORY_PANEL">
                    <div slot="header">Стоимость портфеля</div>
                    <v-card>
                        <v-card-text>
                            <portfolio-line-chart></portfolio-line-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable expand :value="$uistate.stockGraph">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.STOCK_CHART_PANEL">
                    <div slot="header">Состав портфеля акций</div>
                    <v-card>
                        <v-card-text>
                            <stock-pie-chart></stock-pie-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px" v-if="portfolio.overview.bondPortfolio.rows.length > 0"></div>

            <v-expansion-panel v-if="portfolio.overview.bondPortfolio.rows.length > 0" focusable expand :value="$uistate.bondGraph">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.BOND_CHART_PANEL">
                    <div slot="header">Состав портфеля облигаций</div>
                    <v-card>
                        <v-card-text>
                            <bond-pie-chart></bond-pie-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable expand :value="$uistate.sectorsGraph">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.SECTORS_PANEL">
                    <div slot="header">Отрасли</div>
                    <v-card>
                        <v-card-text>
                            <sectors-chart></sectors-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, BarChart, StockPieChart, BondPieChart, PortfolioLineChart, SectorsChart}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private loading = false;

    private mounted(): void {
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
        }, 4000);
        console.log("PORTFOLIO PAGE", this.$uistate.stocksTablePanel);
    }
}
