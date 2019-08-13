import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {PortfolioParams} from "../../services/portfolioService";
import {TableHeader} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap composite-dialog">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="pb-3">
                    <span class="dialog-header-text pl-3">{{ data.titleDialog }}</span>
                </v-card-title>
                <div>
                    <v-data-table class="data-table" :headers="headers" :items="data.portfolios" item-key="id" hide-actions>
                        <template #items="props">
                            <tr v-if="props.item.id !== data.currentPortfolioId">
                                <td>
                                    <v-checkbox :disabled="idSelectedPortfolio && idSelectedPortfolio !== props.item.id" @change="setPortfolioId(props.item)" hide-details>
                                    </v-checkbox>
                                </td>
                                <td class="text-xs-left table-text-word-break">{{ props.item.name }}</td>
                                <td class="text-xs-center">{{ props.item.viewCurrency }}</td>
                                <td class="text-xs-left">{{ props.item.type }}</td>
                                <td class="text-xs-right">{{ props.item.openDate }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </div>
                <v-layout class="action-btn">
                    <v-spacer></v-spacer>
                    <v-btn @click.stop="acceptСopy()" color="primary" class="btn">
                        {{ data.buttonTitle }}
                    </v-btn>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class ChoosePortfolioDialog extends CustomDialog<ChoosePortfolioData, number> {

    private idSelectedPortfolio: number = null;

    private headers: TableHeader[] = [
        {text: "", align: "center", value: "combined", width: "50", sortable: false},
        {text: "Название", align: "left", value: "name"},
        {text: "Валюта", align: "center", value: "viewCurrency", width: "80"},
        {text: "Тип счета", align: "left", value: "type", width: "100"},
        {text: "Дата открытия", align: "right", value: "openDate", width: "100"}
    ];

    private setPortfolioId(portfolio: PortfolioParams): void {
        this.idSelectedPortfolio !== portfolio.id ? this.idSelectedPortfolio = portfolio.id : this.idSelectedPortfolio = null;
    }

    private acceptСopy(): void {
        this.close(this.idSelectedPortfolio);
    }

}
type ChoosePortfolioData = {
    portfolios: PortfolioParams[],
    currentPortfolioId: number,
    titleDialog: string,
    buttonTitle: string
};