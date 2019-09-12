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

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap import-dialog-wrapper import-general-error-wrapper" data-v-step="3">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <div class="import-general-error-wrapper__element-centering">
                    <v-card-title>
                        <span class="import-dialog-wrapper__title-text">Ошибка импорта</span>
                    </v-card-title>
                    <v-card-text>
                        <div>
                            <p class="import-dialog-wrapper__description-text import-default-text selectable">
                                Произошла ошибка импорта: {{ data.generalError }}
                            </p>

                            <div class="import-dialog-wrapper__description-text import-default-text">
                                Попробуйте указать балансы для быстрого старта
                            </div>
                        </div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click="goToBalances" dark>
                            Указать текущие остатки
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ImportGeneralErrorDialog extends CustomDialog<ImportGeneralErrorDialogData, void> {

    mounted(): void {
        if (this.$tours["intro"] && this.$tours["intro"].isRunning) {
            this.$tours["intro"].currentStep = 3;
        }
    }

    private goToBalances(): void {
        this.data.router.push({name: "balances"});
        this.close();
    }
}

export type ImportGeneralErrorDialogData = {
    generalError: string,
    router: VueRouter
};
