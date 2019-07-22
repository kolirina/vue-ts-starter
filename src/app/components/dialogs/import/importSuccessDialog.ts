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
import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {BtnReturn, CustomDialog} from "../../../platform/dialogs/customDialog";
import {ImportResponse} from "../../../services/importService";
import {OverviewService} from "../../../services/overviewService";
import {Portfolio} from "../../../types/types";
import {CommonUtils} from "../../../utils/commonUtils";
import {MainStore} from "../../../vuex/mainStore";

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
                    <v-card-text @click.stop>
                        <span v-if="step === 0">
                            <div class="balance-text">
                                Пожалуйста внесите остаток денежных средств на данный момент
                            </div>

                            <div class="number-field-balance">
                                <ii-number-field v-if="portfolio" @keydown.enter="goToNextStep" :decimals="2"
                                                 suffix="RUB" label="Текущий остаток" v-model="currentMoneyRemainder" name="currentMoney" class="required">
                                </ii-number-field>
                            </div>
                        </span>

                        <span v-if="step === 1">
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
                    <v-card-actions>
                        <v-btn v-if="step === 0" :disabled="disabledFirstStepButton" color="primary" @click.native="goToNextStep" dark>
                            Продолжить
                        </v-btn>
                        <v-btn v-if="step === 1" color="primary" @click.native="close('YES')" dark>
                            Перейти к портфелю
                        </v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class ImportSuccessDialog extends CustomDialog<ImportSuccessDialogData, BtnReturn> {

    @Inject
    private overviewService: OverviewService;
    /** Текущий шаг */
    private step = 0;
    /** Текущий остаток денег на счете */
    private currentMoneyRemainder: string = null;
    /** Текущий выбранный портфель */
    private portfolio: Portfolio = null;

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.portfolio = (this.data.store as any).currentPortfolio;
        this.currentMoneyRemainder = this.data.currentMoneyRemainder;
    }

    @ShowProgress
    private async goToNextStep(): Promise<void> {
        await this.overviewService.saveOrUpdateCurrentMoney(this.portfolio.id, {currentMoney: this.currentMoneyRemainder, afterImport: true});
        this.step++;
    }

    private get disabledFirstStepButton(): boolean {
        return CommonUtils.isBlank(this.currentMoneyRemainder);
    }
}

export type ImportSuccessDialogData = {
    store: MainStore,
    router: VueRouter,
    importResult: ImportResponse,
    currentMoneyRemainder: string
};
