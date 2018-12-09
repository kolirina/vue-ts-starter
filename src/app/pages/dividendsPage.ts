import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DividendDashboardComponent} from "../components/dividendDashboardComponent";
import {DividendsByTickerTable} from "../components/dividendsByTickerTable";
import {DividendsByYearTable} from "../components/dividendsByYearTable";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";
import {DividendsByYearAndTickerTable} from "../components/dividendsByYearAndTickerTable";
import {DividendTradesTable} from "../components/dividendTradesTable";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="dividendInfo" fluid>
            <dividend-dashboard-component :data="dividendInfo.dividendDashboard"></dividend-dashboard-component>

            <v-expansion-panel focusable expand :value="$uistate.sumYearDivsTablePanel">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.SUM_YEAR_DIVIDENDS">
                    <div slot="header">Сумма дивидендов по годам</div>
                    <v-card>
                        <dividends-by-year-table :rows="dividendInfo.summaryDividendsByYear"></dividends-by-year-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel focusable expand :value="$uistate.sumDivsTablePanel" class="margT20">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.SUM_DIVS">
                    <div slot="header">Дивиденды по тикерам</div>
                    <v-card>
                        <dividends-by-ticker-table :rows="dividendInfo.summaryDividendsByTicker"></dividends-by-ticker-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel focusable expand :value="$uistate.yearDivsTablePanel" class="margT20">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.YEAR_DIV_LIST">
                    <div slot="header">Дивиденды по годам</div>
                    <v-card>
                        <dividends-by-year-and-ticker-table :rows="dividendInfo.summaryDividendsByYearAndTicker"></dividends-by-year-and-ticker-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>

            <v-expansion-panel focusable expand :value="$uistate.divTradesTablePanel" class="margT20">
                <v-expansion-panel-content :lazy="true" v-state="$uistate.DIV_LIST">
                    <div slot="header">Сделки по дивидендам</div>
                    <v-card>
                        <dividend-trades-table :rows="dividendInfo.dividendTrades"></dividend-trades-table>
                    </v-card>
                </v-expansion-panel-content>
            </v-expansion-panel>
        </v-container>
    `,
    components: {DividendDashboardComponent, DividendsByYearTable, DividendsByTickerTable, DividendsByYearAndTickerTable, DividendTradesTable}
})
export class DividendsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    @Inject
    private dividendService: DividendService;

    private loading = false;

    private dividendInfo: DividendAggregateInfo = null;

    async created(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    private async loadDividendAggregateInfo(): Promise<void> {
        this.loading = true;
        this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
        this.loading = false;
    }
}
