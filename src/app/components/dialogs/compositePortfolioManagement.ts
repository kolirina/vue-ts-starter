import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {OverviewService} from "../../services/overviewService";
import {PortfolioParams} from "../../services/portfolioService";
import {ALLOWED_CURRENCIES, Currency} from "../../types/currency";
import {CombinedData} from "../../types/eventObjects";
import {CombinedPortfoliosTable} from "../combinedPortfoliosTable";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap composite-dialog">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="pb-3">
                    <span class="dialog-header-text pl-3">Формирование составного портфеля</span>
                </v-card-title>
                <div>
                    <combined-portfolios-table :portfolios="data.portfolio" @change="onSetCombined"></combined-portfolios-table>
                </div>
                <div class="choose-currency">
                    <div class="choose-currency__description mb-1">
                        Выберите валюту просмотра
                    </div>
                    <v-flex class="select-section">
                        <v-select :items="currencyList" v-model="viewCurrency" label="Валюта представления" single-line></v-select>
                    </v-flex>
                </div>
                <v-layout class="action-btn">
                    <v-spacer></v-spacer>
                    <v-btn @click="applyConfig" color="primary" class="btn">
                        Сформировать
                    </v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
    `,
    components: {CombinedPortfoliosTable}
})
export class CompositePortfolioManagement extends CustomDialog<PortfolioManagementParams, string> {
    /** Валюта просмотра портфеля */
    private viewCurrency: string = Currency.RUB;
    /** Список валют */
    private currencyList = ALLOWED_CURRENCIES;
    @Inject
    private overviewService: OverviewService;

    mounted(): void {
        this.viewCurrency = this.data.viewCurrency;
    }

    private applyConfig(): void {
        this.close(this.viewCurrency);
    }

    @ShowProgress
    private async onSetCombined(data: CombinedData): Promise<void> {
        await this.overviewService.setCombinedFlag(data.id, data.combined);
    }
}

type PortfolioManagementParams = {
    portfolio: PortfolioParams[],
    viewCurrency: string
};