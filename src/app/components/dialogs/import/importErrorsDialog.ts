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

import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {CustomDialog} from "../../../platform/dialogs/customDialog";
import {DealImportError} from "../../../services/importService";
import {TableHeader} from "../../../types/types";

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" content-class="import-errors-dialog-scroll">
            <v-card class="dialog-wrap import-dialog-wrapper">
                <v-layout column justify-space-between class="min-height-wrapper">
                    <div>
                        <v-icon class="closeDialog" @click.native="close">close</v-icon>
                        <v-card-title class="import-dialog-wrapper__title">
                            <span class="import-dialog-wrapper__title-text">Результаты импорта</span>
                        </v-card-title>
                        <v-card-text class="import-dialog-wrapper__description selectable">
                            <div class="import-dialog-wrapper__description-text import-default-text">
                                При импортировании отчета возникли ошибки, портфель не был импортирован полностью. Чтобы завершить формирование пожалуйста внесите остатки вручную.
                            </div>
                            <video-link class="margB20 fs13">
                                <template #foreword>
                                    <span>Также для понимания причин возникновения ошибок, ознакомьтесь с </span>
                                </template>
                                <a>видео-инструкцией</a>
                            </video-link>
                            <div class="import-dialog-wrapper__description-text import-default-text">
                                Успешно {{ data.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                                {{ data.validatedTradesCount | declension("сделка", "сделки", "сделок") }}<span class="amount-deals">{{ data.validatedTradesCount }}</span></div>
                        </v-card-text>
                        <v-card-text class="import-dialog-wrapper__content import-dialog-wrapper__error-table selectable">
                            <v-data-table :headers="headers" :items="data.errors" hide-actions must-sort>
                                <template #items="props">
                                    <tr class="selectable">
                                        <td class="text-xs-center"><span v-if="props.item.dealDate">{{ props.item.dealDate | date }}</span></td>
                                        <td class="text-xs-left">{{ props.item.dealTicker }}</td>
                                        <td class="text-xs-left error-message">{{ props.item.message }}</td>
                                    </tr>
                                </template>
                            </v-data-table>
                        </v-card-text>
                    </div>
                    <v-card-actions class="import-dialog-wrapper__actions">
                        <v-spacer></v-spacer>
                        <v-btn color="primary" @click.native="goToBalances" dark>
                            Указать текущие остатки
                        </v-btn>
                    </v-card-actions>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class ImportErrorsDialog extends CustomDialog<ImportErrorsDialogData, void> {

    private headers: TableHeader[] = [
        {text: "Дата", align: "center", value: "dealDate", sortable: false},
        {text: "Тикер", align: "left", value: "dealTicker", sortable: false},
        {text: "Ошибка", align: "center", value: "message", sortable: false}
    ];

    private goToBalances(): void {
        this.data.router.push({name: "balances"});
        this.close();
    }
}

export type ImportErrorsDialogData = {
    errors: DealImportError[],
    validatedTradesCount: number,
    router: VueRouter
};
