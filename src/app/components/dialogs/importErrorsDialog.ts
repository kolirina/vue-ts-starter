import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {DealImportError} from "../../services/importService";
import {TableHeader} from "../../types/types";
import {CustomDialog} from "./customDialog";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="750px">
            <v-card>
                <v-toolbar dark color="primary">
                    <v-toolbar-title><b>Результаты импорта</b></v-toolbar-title>
                    <v-spacer></v-spacer>
                    <v-toolbar-items>
                        <v-btn icon dark @click.native="close">
                            <v-icon>close</v-icon>
                        </v-btn>
                    </v-toolbar-items>
                </v-toolbar>
                <v-card-text>
                    <h4>Успешно {{ data.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                        {{ data.validatedTradesCount }} {{ data.validatedTradesCount | declension("сделка", "сделки", "сделок") }}.</h4>
                    <h4>Не получилось импортировать отчет?</h4>
                    <div>
                        <span>Попробуйте указать </span><a @click="goToBalances">начальные балансы </a><i class="fa fa-balance-scale"/>
                        <span>для быстрого старта</span>
                        <v-tooltip bottom>
                            <i slot="activator" class="fa fa-question-circle"/>
                            <span>Если у Вас нет полной истории ваших сделок. Вы можете добавить дополнительные сделки позже.</span>
                        </v-tooltip>
                    </div>

                    <h4>Возникли следующие ошибки:</h4>
                    <v-data-table :headers="headers" :items="data.errors" hide-actions>
                        <template slot="items" slot-scope="props">
                            <tr>
                                <td class="text-xs-left"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                                <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                                <td class="text-xs-left">{{ props.item.message }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="goToPortfolio" dark small>
                        Перейти к портфелю
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ImportErrorsDialog extends CustomDialog<importErrorsDialogData, void> {

    private headers: TableHeader[] = [
        {text: "Дата", align: "left", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "left", value: "message", sortable: false}
    ];

    private goToBalances(): void {
        this.data.router.push("trades");
        this.close();
    }

    private goToPortfolio(): void {
        this.data.router.push("portfolio");
        this.close();
    }
}

export type importErrorsDialogData = {
    errors: DealImportError[],
    validatedTradesCount: number,
    router: VueRouter
};
