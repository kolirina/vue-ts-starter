import Component from "vue-class-component";
import {UI} from "../app/UI";
import {AssetTable} from "../components/assetTable";
import {Portfolio} from "../types/types";
import {StockTable} from "../components/stockTable";
import {StoreType} from "../vuex/storeType";
import {Getter, namespace} from "vuex-class/lib/bindings";
import {PieChart} from "../components/charts/pieChart";

const mainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboard"></dashboard>
            <asset-table :assets="portfolio.overview.assets"></asset-table>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content>
                    <div slot="header">Акции</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.stockRows" :loading="loading"></stock-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <div style="height: 50px"></div>

            <v-expansion-panel focusable>
                <v-expansion-panel-content>
                    <div slot="header">Облигации</div>
                    <v-card>
                        <stock-table :rows="portfolio.overview.bondRows"></stock-table>
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
    name: "PortfolioPage"
})
export class PortfolioPage extends UI {

    @mainStore.Getter portfolio: Portfolio;

    private loading = false;

    private data: number[] = [];

    private mounted(): void {
        this.loading = true;
        setTimeout(() => {
            this.loading = false;
        }, 4000);
        this.data = [5, 9, 7, 8, 5, 3, 5, 4];
    }
}
