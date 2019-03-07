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
import {ExportService, ExportType} from "../services/exportService";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="dividendInfo" fluid class="paddT0">
            <dividend-dashboard-component :data="dividendInfo.dividendDashboard"></dividend-dashboard-component>

            <expanded-panel :value="$uistate.sumYearDivsTablePanel" :withMenu="true" :name="ExportType.DIVIDENDS_BY_YEAR" :state="$uistate.SUM_YEAR_DIVIDENDS">
                <template #header>Сумма дивидендов по годам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_YEAR)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-year-table :rows="dividendInfo.summaryDividendsByYear"></dividends-by-year-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.sumDivsTablePanel" :withMenu="true" :name="ExportType.DIVIDENDS_BY_TICKER" :state="$uistate.SUM_DIVS" class="margT20">
                <template #header>Дивиденды по тикерам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_TICKER)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-ticker-table :rows="dividendInfo.summaryDividendsByTicker"></dividends-by-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.yearDivsTablePanel" :withMenu="true" :name="ExportType.DIVIDENDS_BY_YEAR_AND_TICKER" :state="$uistate.YEAR_DIV_LIST" class="margT20">
                <template #header>Дивиденды по годам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_YEAR_AND_TICKER)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-year-and-ticker-table :rows="dividendInfo.summaryDividendsByYearAndTicker"></dividends-by-year-and-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.divTradesTablePanel" :withMenu="true" :name="ExportType.DIVIDENDS" :state="$uistate.DIV_LIST" class="margT20">
                <template #header>Сделки по дивидендам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS)">Экспорт в xlsx</v-list-tile-title>
                </template>
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
    @Inject
    private exportService: ExportService;
    private ExportType = ExportType;

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

    @CatchErrors
    @ShowProgress
    private async exportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }
}
