import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {DealImportError} from "../../services/importService";
import {TableHeader} from "../../types/types";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" persistent>
            <v-card class="dialog-wrap import-dialog-wrapper">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="import-dialog-wrapper__title">
                    <span class="import-dialog-wrapper__title-text">Результаты импорта</span>
                </v-card-title>
                <v-card-text class="import-dialog-wrapper__description">
                    <div class="import-dialog-wrapper__description-text import-default-text">
                        При импортировании отчета возникли ошибки, портфель небыл импортирован полностью. Чтобы завершить формирование пожалуйста внесите остатки вручную.
                    </div>
                    <div class="import-dialog-wrapper__description-text import-default-text">
                        Успешно {{ data.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                        {{ data.validatedTradesCount | declension("сделка", "сделки", "сделок") }} {{ data.validatedTradesCount }}</div>
                </v-card-text>
                <v-card-text class="import-dialog-wrapper__content">
                    <v-data-table :headers="headers" :items="data.errors" hide-actions>
                        <template #items="props">
                            <tr class="selectable">
                                <td class="text-xs-center"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                                <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                                <td class="text-xs-right error-message">{{ props.item.message }}</td>
                            </tr>
                        </template>
                    </v-data-table>
                </v-card-text>
                <v-card-actions class="import-dialog-wrapper__actions">
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="goToBalances" dark>
                        Указать текущие остатки
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ImportErrorsDialog extends CustomDialog<importErrorsDialogData, void> {

    private headers: TableHeader[] = [
        {text: "Дата", align: "center", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "center", value: "message", sortable: false}
    ];

    private goToBalances(): void {
        this.data.router.push("trades");
        this.close();
    }

}

export type importErrorsDialogData = {
    errors: DealImportError[],
    validatedTradesCount: number,
    router: VueRouter
};
