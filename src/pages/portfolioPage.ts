import Component from 'vue-class-component';
import {UI} from '../app/UI';
import {AssetTable} from '../components/assetTable';
import {Portfolio} from '../types/types';
import {StockTable} from '../components/stockTable';
import {StoreType} from '../vuex/storeType';
import {PieChart} from '../components/charts/pieChart';
import {namespace} from "vuex-class/lib/bindings";

const mainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <asset-table :assets="portfolio.overview.assetRows"></asset-table>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content>
                    <div slot="header">Акции</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.stockPortfolio.rows" :loading="loading"></stock-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content>
                    <div slot="header">Облигации</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.bondPortfolio.rows"></stock-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content>
                    <div slot="header">Стоимость портфеля</div>
                    <v-card>
                        <v-card-text class="grey lighten-3">
                            <pie-chart :data="data"></pie-chart>
                        </v-card-text>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-container>
    `,
    components: {AssetTable, StockTable, PieChart},
    name: 'PortfolioPage'
})
export class PortfolioPage extends UI {

    //@mainStore.Getter
    portfolio: Portfolio = null;

    private loading = false;

    private data: number[] = [];

    private mounted(): void {
        this.loading = true;

        setTimeout(() => {
            this.loading = false;
        }, 4000);
        this.data = [5, 9, 7, 8, 5, 3, 5, 4];
    }

    private activated(): void {
        console.log("PORTFOLIO PAGE", this.$store);
        this.portfolio = this.$store.state[StoreType.MAIN].currentPortfolio;
    }
}
