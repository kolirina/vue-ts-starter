import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {ImportResponse} from "../../services/importService";
import {OverviewService} from "../../services/overviewService";
import {Portfolio} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {MainStore} from "../../vuex/mainStore";

/**
 * Диалог ввода остатка денежных средств
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" persistent>
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title>
                    <span class="headline">Завершение импорта</span>
                </v-card-title>
                <v-card-text @click.stop>
                        <span v-if="step === 0">
                            <h4>Остался последний шаг и ваш портфель будет готов.</h4>
                            <h4>Пожалуйста, укажите остаток денежных средств в портфеле на данный момент:
                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                        Мы просим вас указать текущий остаток чтобы сверить результаты и убедиться в точности импорта.
                                        Остаток денежных средств вы можете узнать из:
                                        <ul>
                                            <li>загружаемого отчета</li>
                                            <li>терминала брокера</li>
                                            <li>в личном кабинете брокера</li>
                                        </ul>
                                    </span>
                                </v-tooltip>
                            </h4>

                            <span style="display: block; margin: auto; max-width: 305px; margin-top: 15px">
                                <v-text-field v-if="portfolio" label="Текущий остаток денежных средств на счете" v-model="currentMoneyRemainder">
                                    <span slot="append-outer">
                                        <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()"></span>
                                    </span>
                                </v-text-field>
                            </span>
                        </span>

                    <span v-if="step === 1">
                        <h4>Поздравляем! Теперь ваш портфель сформирован и готов к работе.</h4>
                        <h4>Успешно {{ data.importResult.validatedTradesCount | declension("добавлена", "добавлено", "добавлено") }}
                        {{ data.importResult.validatedTradesCount }} {{ data.importResult.validatedTradesCount | declension("сделка", "сделки", "сделок") }}.</h4>
                    </span>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn v-if="step === 0" :disabled="disabledFirstStepButton" color="primary" @click.native="goToNextStep" dark>
                        Продолжить
                    </v-btn>
                    <v-btn v-if="step === 1" color="primary" @click.native="close('YES')" dark>
                        Перейти к портфелю
                    </v-btn>
                </v-card-actions>
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
        await this.overviewService.saveOrUpdateCurrentMoney(this.portfolio.id, this.currentMoneyRemainder);
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