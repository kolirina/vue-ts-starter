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
import {StockTable} from "../components/stockTable";
import {Portfolio} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";

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
                    <v-card style="overflow: auto;">
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
                    <v-card style="overflow: auto;">
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
                    <v-card style="overflow: auto;">
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
                    <v-card style="overflow: auto;">
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

    mounted(): void {
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
        }, 4000);
    }
}
