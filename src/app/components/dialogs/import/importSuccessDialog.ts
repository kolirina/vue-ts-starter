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
import {BtnReturn, CustomDialog} from "../../../platform/dialogs/customDialog";
import {ImportResponse} from "../../../services/importService";
import {Portfolio} from "../../../types/types";
import {MainStore} from "../../../vuex/mainStore";
import {CurrencyBalances} from "../../currencyBalances";

/**
 * Диалог ввода остатка денежных средств
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" persistent ref="dialog">
            <v-card class="dialog-wrap import-dialog-wrapper">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div class="import-general-error-wrapper__element-centering">
                    <v-card-title>
                        <span class="import-dialog-wrapper__title-text">Завершение импорта</span>
                    </v-card-title>

                    <v-window v-model="step">
                        <v-window-item :value="1">
                            <v-card-text @click.stop>
                                <span>
                                    <div class="balance-text">
                                        Пожалуйста внесите остаток денежных средств на данный момент
                                    </div>
                                    <video-link class="balance-text">
                                        <template #foreword>
                                            <span>Подробные пояснения - зачем указывать текущие остатки, вы найдете в данной </span>
                                        </template>
                                        <a>видео-инструкции по импорту сделок</a>
                                    </video-link>
                                    <currency-balances v-if="portfolio" :portfolio-id="portfolio.id" @specifyResidues="portfolioFormed"
                                                       class="currency-balances"></currency-balances>
                                </span>
                            </v-card-text>
                        </v-window-item>

                        <v-window-item :value="2">
                            <v-card-text @click.stop>
                                <span>
                                    <div class="import-default-text">
                                        Поздравляем! Теперь ваш портфель сформирован и готов к работе.
                                    </div>
                                    <div class="import-default-text">
                                        Успешно {{ data.importResult.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                                        {{ data.importResult.validatedTradesCount | declension("сделка", "сделки", "сделок") }}
                                        <span class="amount-deals">{{ data.importResult.validatedTradesCount }}</span>
                                    </div>
                                </span>
                            </v-card-text>
                        </v-window-item>
                    </v-window>

                    <v-card-actions>
                        <v-btn v-if="step === 2" color="big_btn" @click.native="step = 1">
                            Назад
                        </v-btn>
                        <v-spacer></v-spacer>
                        <v-btn v-if="step === 2" color="big_btn primary" @click.native="close('YES')" dark>
                            Перейти к портфелю
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `,
    components: {CurrencyBalances}
})
export class ImportSuccessDialog extends CustomDialog<ImportSuccessDialogData, BtnReturn> {

    /** Индекс шага */
    private step: number = 1;
    /** Текущий выбранный портфель */
    private portfolio: Portfolio = null;

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.portfolio = (this.data.store as any).currentPortfolio;
        if (this.$tours["intro"] && this.$tours["intro"].isRunning) {
            this.$tours["intro"].currentStep = 5;
        }
    }

    private portfolioFormed(): void {
        this.step = 2;
        this.$tours["intro"].nextStep();
    }
}

export type ImportSuccessDialogData = {
    store: MainStore,
    router: VueRouter,
    importResult: ImportResponse
};
