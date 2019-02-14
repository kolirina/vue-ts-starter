import {Inject} from "typescript-ioc";
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
import {TableSettingsDialog} from "../components/dialogs/tableSettingsDialog";
import {ExpandedPanel} from "../components/expandedPanel";
import {StockTable} from "../components/stockTable";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ExportService, ExportType} from "../services/exportService";
import {TableHeaders, TABLES_NAME, TablesService} from "../services/tablesService";
import {Portfolio, TableHeader} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <asset-table :assets="portfolio.overview.assetRows"></asset-table>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.stocksTablePanel" :withMenu="true" name="stock" :state="$uistate.STOCKS">
                <template slot="header">Акции</template>
                <template slot="list">
                    <v-list-tile-title @click="openTableHeadersDialog(TABLES_NAME.STOCK)">Настроить колонки</v-list-tile-title>
                    <v-list-tile-title @click="exportTable(ExportType.STOCKS)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <stock-table :rows="portfolio.overview.stockPortfolio.rows"
                             :headers="getHeaders(TABLES_NAME.STOCK)"></stock-table>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.bondsTablePanel" :withMenu="true" name="bond" :state="$uistate.BONDS">
                <template slot="header">Облигации</template>
                <template slot="list">
                    <v-list-tile-title @click="openTableHeadersDialog('bondTable')">Настроить колонки</v-list-tile-title>
                    <v-list-tile-title @click="exportTable(ExportType.BONDS)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <bond-table :rows="portfolio.overview.bondPortfolio.rows" :headers="getHeaders(TABLES_NAME.BOND)"></bond-table>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.historyPanel" :state="$uistate.HISTORY_PANEL">
                <template slot="header">Стоимость портфеля</template>
                <v-card-text>
                    <portfolio-line-chart></portfolio-line-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.assetGraph" :state="$uistate.ASSET_CHART_PANEL">
                <template slot="header">Состав портфеля по активам</template>
                <v-card-text>
                    <asset-chart/>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px"></div>

            <expanded-panel :value="$uistate.stockGraph" :state="$uistate.STOCK_CHART_PANEL">
                <template slot="header">Состав портфеля акций</template>
                <v-card-text>
                    <stock-pie-chart></stock-pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px" v-if="portfolio.overview.bondPortfolio.rows.length > 0"></div>

            <expanded-panel v-if="portfolio.overview.bondPortfolio.rows.length > 0" :value="$uistate.bondGraph" :state="$uistate.BOND_CHART_PANEL">
                <template slot="header">Состав портфеля облигаций</template>
                <v-card-text>
                    <bond-pie-chart></bond-pie-chart>
                </v-card-text>
            </expanded-panel>

            <div style="height: 30px"></div>

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

    @Inject
    private tablesService: TablesService;
    @Inject
    private exportService: ExportService;

    private headers: TableHeaders = this.tablesService.headers;

    private TABLES_NAME = TABLES_NAME;
    private ExportType = ExportType;

    getHeaders(name: string): TableHeader[] {
        return this.tablesService.getFilterHeaders(name);
    }

    private async openTableHeadersDialog(tableName: string): Promise<void> {
        await new TableSettingsDialog().show({
            tableName: tableName,
            headers: this.headers[tableName]
        });
    }

    @CatchErrors
    @ShowProgress
    private async exportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }
}
