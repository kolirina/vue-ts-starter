import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {OverviewService} from "../../services/overviewService";
import {PortfolioParams} from "../../services/portfolioService";
import {CombinedData} from "../../types/eventObjects";
import {CombinedPortfoliosTable} from "../combinedPortfoliosTable";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div>
                    Формирование составного портфеля
                </div>
                <div class="">
                    <combined-portfolios-table :portfolios="data.portfolio" @change="onSetCombined"></combined-portfolios-table>
                </div>
                <v-select :items="['RUB', 'USD', 'EUR']" v-model="viewCurrency" label="Валюта представления"single-line></v-select>
                <v-layout>
                    <v-spacer></v-spacer>
                    <v-btn @click="save" color="primary" class="btn">
                        Сформировать
                    </v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
    `,
    components: {CombinedPortfoliosTable}
})
export class CompositePortfolioManagement extends CustomDialog<compositePortfolioManagement, string> {
    /** Валюта просмотра портфеля */
    private viewCurrency: string = "RUB";

    @Inject
    private overviewService: OverviewService;

    mounted(): void {
        this.viewCurrency = this.data.viewCurrency;
    }

    private save(): void {
        this.close(this.viewCurrency);
    }

    private async onSetCombined(data: CombinedData): Promise<void> {
        await this.overviewService.setCombinedFlag(data.id, data.combined);
    }
}

type compositePortfolioManagement = {
    portfolio: PortfolioParams[],
    viewCurrency: string
};