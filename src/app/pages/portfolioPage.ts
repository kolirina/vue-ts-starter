import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {BondTable} from "../components/bondTable";
import {AssetChart} from "../components/charts/assetChart";
import {BarChart} from "../components/charts/barChart";
import {BondPieChart} from "../components/charts/bondPieChart";
import {PortfolioLineChart} from "../components/charts/portfolioLineChart";
import {SectorsChart} from "../components/charts/sectorsChart";
import {StockPieChart} from "../components/charts/stockPieChart";
import {ExpandedPanel} from "../components/expandedPanel";
import {StockTable} from "../components/stockTable";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <asset-table :assets="portfolio.overview.assetRows"></asset-table>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.stocksTablePanel" :state="$uistate.STOCKS">
                <template slot="header">Акции</template>
                <stock-table :rows="portfolio.overview.stockPortfolio.rows"></stock-table>
            </expanded-panel>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.bondsTablePanel" :state="$uistate.BONDS">
                <template slot="header">Облигации</template>
                <bond-table :rows="portfolio.overview.bondPortfolio.rows"></bond-table>
            </expanded-panel>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.historyPanel" :state="$uistate.HISTORY_PANEL">
                <template slot="header">Стоимость портфеля</template>
                <v-card-text>
                    <portfolio-line-chart></portfolio-line-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.assetGraph" :state="$uistate.ASSET_CHART_PANEL">
                <template slot="header">Состав портфеля по активам</template>
                <v-card-text>
                    <asset-chart/>
                </v-card-text>
            </expanded-panel>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL">
                <template slot="header">Состав портфеля акций</template>
                <v-card-text>
                    <stock-pie-chart></stock-pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 50px" v-if="portfolio.overview.bondPortfolio.rows.length > 0"></div>

            <expanded-panel v-if="portfolio.overview.bondPortfolio.rows.length > 0" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL">
                <template slot="header">Состав портфеля облигаций</template>
                <v-card-text>
                    <bond-pie-chart></bond-pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 50px"></div>

            <expanded-panel :value="$uistate.sectorsGraph" :state="$uistate.SECTORS_PANEL">
                <template slot="header">Состав портфеля по секторам</template>
                <v-card-text>
                    <sectors-chart></sectors-chart>
                </v-card-text>
            </expanded-panel>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, AssetChart, BarChart, StockPieChart, BondPieChart, PortfolioLineChart, SectorsChart, ExpandedPanel}
})
export class PortfolioPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
}