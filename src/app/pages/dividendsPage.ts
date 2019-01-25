import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DividendDashboardComponent} from "../components/dividendDashboardComponent";
import {DividendsByTickerTable} from "../components/dividendsByTickerTable";
import {DividendsByYearAndTickerTable} from "../components/dividendsByYearAndTickerTable";
import {DividendsByYearTable} from "../components/dividendsByYearTable";
import {DividendTradesTable} from "../components/dividendTradesTable";
import {ExpandedPanel} from "../components/expandedPanel";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="dividendInfo" fluid>
            <dividend-dashboard-component :data="dividendInfo.dividendDashboard"></dividend-dashboard-component>

            <expanded-panel :value="$uistate.sumYearDivsTablePanel" :state="$uistate.SUM_YEAR_DIVIDENDS">
                <template slot="header">Сумма дивидендов по годам</template>
                <dividends-by-year-table :rows="dividendInfo.summaryDividendsByYear"></dividends-by-year-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.sumDivsTablePanel" :state="$uistate.SUM_DIVS" class="margT20">
                <template slot="header">Дивиденды по тикерам</template>
                <dividends-by-ticker-table :rows="dividendInfo.summaryDividendsByTicker"></dividends-by-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.yearDivsTablePanel" :state="$uistate.YEAR_DIV_LIST" class="margT20">
                <template slot="header">Дивиденды по годам</template>
                <dividends-by-year-and-ticker-table :rows="dividendInfo.summaryDividendsByYearAndTicker"></dividends-by-year-and-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.divTradesTablePanel" :state="$uistate.DIV_LIST" class="margT20">
                <template slot="header">Дивиденды по годам</template>
                <dividend-trades-table :rows="dividendInfo.dividendTrades"></dividend-trades-table>
            </expanded-panel>
        </v-container>
    `,
    components: {ExpandedPanel, DividendDashboardComponent, DividendsByYearTable, DividendsByTickerTable, DividendsByYearAndTickerTable, DividendTradesTable}
})
export class DividendsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    @Inject
    private dividendService: DividendService;

    private dividendInfo: DividendAggregateInfo = null;

    async created(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    @CatchErrors
    @ShowProgress
    private async loadDividendAggregateInfo(): Promise<void> {
        this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
    }
}
