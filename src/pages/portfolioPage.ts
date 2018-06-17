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

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <asset-table :assets="portfolio.overview.assetRows"></asset-table>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Акции</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.stockPortfolio.rows" :loading="loading"></stock-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Облигации</div>
                    <v-card>
                        <bond-table :rows="portfolio.overview.bondPortfolio.rows"></bond-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Стоимость портфеля</div>
                    <v-card>
                        <v-card-text class="grey lighten-3">
                            <portfolio-line-chart></portfolio-line-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>
            
            <v-expansion-panel focusable>
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Состав портфеля акций</div>
                    <v-card>
                        <v-card-text class="grey lighten-3">
                            <stock-pie-chart></stock-pie-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
            
            <div style="height: 50px"></div>
            
            <v-expansion-panel focusable v-if="portfolio.overview.bondPortfolio.rows.length > 0">
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Состав портфеля облигаций</div>
                    <v-card>
                        <v-card-text class="grey lighten-3">
                            <bond-pie-chart></bond-pie-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content :expand="true" :lazy="true">
                    <div slot="header">Отрасли</div>
                    <v-card>
                        <v-card-text class="grey lighten-3">
                            <bar-chart :balloon-title="portfolio.portfolioParams.name"></bar-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-container>
    `,
    components: {AssetTable, StockTable, BondTable, BarChart, StockPieChart, BondPieChart, PortfolioLineChart}
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
        console.log("PORTFOLIO PAGE", this.$store);
    }
}
