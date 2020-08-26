/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../app/ui";
import {DividendDashboardComponent} from "../components/dividends/dividendDashboardComponent";
import {DividendsByTickerTable} from "../components/dividends/dividendsByTickerTable";
import {DividendsByYearAndTickerTable} from "../components/dividends/dividendsByYearAndTickerTable";
import {DividendsByYearTable} from "../components/dividends/dividendsByYearTable";
import {DividendTradesTable} from "../components/dividends/dividendTradesTable";
import {ShowProgress} from "../platform/decorators/showProgress";
import {DividendAggregateInfo} from "../services/dividendService";
import {ExportService, ExportType} from "../services/exportService";
import {Portfolio} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-container v-if="dividendInfo" fluid class="paddT0">
            <dividend-dashboard-component :data="dividendInfo.dividendDashboard" :side-bar-opened="sideBarOpened"
                                          :view-currency="portfolio.portfolioParams.viewCurrency"></dividend-dashboard-component>

            <expanded-panel :value="$uistate.sumYearDivsTablePanel" :withMenu="allowExport" :name="ExportType.DIVIDENDS_BY_YEAR" :state="$uistate.SUM_YEAR_DIVIDENDS">
                <template #header>Сумма дивидендов по годам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_YEAR)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-year-table :rows="dividendInfo.summaryDividendsByYear"></dividends-by-year-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.sumDivsTablePanel" :withMenu="allowExport" :name="ExportType.DIVIDENDS_BY_TICKER" :state="$uistate.SUM_DIVS" class="margT20">
                <template #header>Дивиденды по тикерам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_TICKER)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-ticker-table :rows="dividendInfo.summaryDividendsByTicker"></dividends-by-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.yearDivsTablePanel" :withMenu="allowExport" :name="ExportType.DIVIDENDS_BY_YEAR_AND_TICKER" :state="$uistate.YEAR_DIV_LIST" class="margT20">
                <template #header>Дивиденды по годам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS_BY_YEAR_AND_TICKER)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividends-by-year-and-ticker-table :rows="dividendInfo.summaryDividendsByYearAndTicker"></dividends-by-year-and-ticker-table>
            </expanded-panel>

            <expanded-panel :value="$uistate.divTradesTablePanel" :withMenu="allowExport" :name="ExportType.DIVIDENDS" :state="$uistate.DIV_LIST" class="margT20">
                <template #header>Сделки по дивидендам</template>
                <template #list>
                    <v-list-tile-title @click="exportTable(ExportType.DIVIDENDS)">Экспорт в xlsx</v-list-tile-title>
                </template>
                <dividend-trades-table :rows="dividendInfo.dividendTrades"></dividend-trades-table>
            </expanded-panel>
        </v-container>
    `,
    components: {DividendDashboardComponent, DividendsByYearTable, DividendsByTickerTable, DividendsByYearAndTickerTable, DividendTradesTable}
})
export class BaseDividendsPage extends UI {

    /** Данные по портфелю */
    @Prop({default: null, required: true})
    private portfolio: Portfolio;
    /** Данные по портфелю */
    @Prop({default: null, required: true})
    private dividendInfo: DividendAggregateInfo;
    /** Признак открытой боковой панели */
    @Prop({required: true, type: Boolean, default: true})
    private sideBarOpened: boolean;
    @Inject
    private exportService: ExportService;
    private ExportType = ExportType;

    @ShowProgress
    private async exportTable(exportType: ExportType): Promise<void> {
        await this.exportService.exportReport(this.portfolio.id, exportType);
    }

    private get allowExport(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }
}
