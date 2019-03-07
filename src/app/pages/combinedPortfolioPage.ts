import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../app/ui";
import {CombinedPortfoliosTable} from "../components/combinedPortfoliosTable";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {HighStockEventsGroup} from "../types/charts/types";
import {CombinedData} from "../types/eventObjects";
import {Overview} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";
import {BasePortfolioPage} from "./basePortfolioPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <base-portfolio-page v-if="overview" :overview="overview" :line-chart-data="lineChartData" :line-chart-events="lineChartEvents"
                             @reloadLineChart="loadPortfolioLineChart">
            <template #afterDashboard>
                <expanded-panel :value="$uistate.combinedPanel" :state="$uistate.COMBINED_CONTROL_PANEL">
                    <template #header>Управление комбинированным портфелем</template>

                    <v-card-text>
                        <combined-portfolios-table :portfolios="clientInfo.user.portfolios" @change="onSetCombined"></combined-portfolios-table>
                    </v-card-text>

                    <v-container slot="underCard" grid-list-md text-xs-center>
                        <v-layout row wrap>
                            <v-flex xs6>
                                <v-btn color="info" @click.stop="doCombinedPortfolio">Сформировать</v-btn>
                            </v-flex>
                            <v-flex xs6>
                                <v-select :items="['RUB', 'USD', 'EUR']" v-model="viewCurrency" label="Валюта представления" @change="doCombinedPortfolio"
                                          single-line></v-select>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </expanded-panel>
            </template>
        </base-portfolio-page>
    `,
    components: {BasePortfolioPage, CombinedPortfoliosTable}
})
export class CombinedPortfolioPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @Inject
    private overviewService: OverviewService;
    private overview: Overview = null;
    private viewCurrency = "RUB";
    private lineChartData: any[] = null;
    private lineChartEvents: HighStockEventsGroup[] = null;

    async created(): Promise<void> {
        await this.doCombinedPortfolio();
    }

    @CatchErrors
    @ShowProgress
    private async doCombinedPortfolio(): Promise<void> {
        const ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        this.overview = await this.overviewService.getPortfolioOverviewCombined({ids: ids, viewCurrency: this.viewCurrency});
        await this.loadPortfolioLineChart();
    }

    @CatchErrors
    @ShowProgress
    private async onSetCombined(data: CombinedData): Promise<void> {
        await this.overviewService.setCombinedFlag(data.id, data.combined);
    }

    private async onPortfolioLineChartPanelStateChanges(): Promise<void> {
        await this.loadPortfolioLineChart();
    }

    private async loadPortfolioLineChart(): Promise<void> {
        const ids = this.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        if (UiStateHelper.historyPanel[0] === 1) {
            this.lineChartData = await this.overviewService.getCostChartCombined({ids: ids, viewCurrency: this.viewCurrency});
            this.lineChartEvents = await this.overviewService.getEventsChartDataCombined({ids: ids, viewCurrency: this.viewCurrency});
        }
    }
}
