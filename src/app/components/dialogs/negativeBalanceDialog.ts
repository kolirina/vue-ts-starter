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
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {OverviewService} from "../../services/overviewService";
import {Portfolio} from "../../types/types";
import {MainStore} from "../../vuex/mainStore";

/**
 * Диалог ввода остатка денежных средств
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" persistent ref="dialog">
            <v-card>
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout align-center column class="py-5">
                    <v-card-text @click.stop class="pb-0">
                        <v-layout align-center column>
                            <div class="fs18 alignC">
                                Введите сумму остатка денежных средств на брокерском счету
                            </div>
                            <div class="maxW275 my-4">
                                <ii-number-field v-if="portfolio" @keydown.enter="specifyResidues" :decimals="2" :suffix="data.currency" label="Текущий остаток"
                                                 v-model="currentMoneyRemainder" class="required" persistent-hint autofocus :hint="hint">
                                </ii-number-field>
                            </div>
                        </v-layout>
                    </v-card-text>
                    <v-card-actions class="pt-0">
                        <v-btn color="primary" @click.native="specifyResidues" :disabled="!currentMoneyRemainder" dark>
                            Указать
                        </v-btn>
                    </v-card-actions>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class NegativeBalanceDialog extends CustomDialog<CurrentPortfolioInfo, BtnReturn> {

    @Inject
    private overviewService: OverviewService;
    /** Текущий остаток денег на счете */
    private currentMoneyRemainder: string = null;
    /** Текущий выбранный портфель */
    private portfolio: Portfolio = null;
    /** Подсказка  */
    private hint = "";

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.portfolio = (this.data.store as any).currentPortfolio;
        this.hint = `Ваш текущий остаток на сервисе ${this.data.currentMoneyRemainder}`;
    }

    @ShowProgress
    private async specifyResidues(): Promise<void> {
        if (!this.currentMoneyRemainder) {
            return;
        }
        await this.overviewService.saveOrUpdateCurrentMoney(this.portfolio.id, {currentMoney: this.currentMoneyRemainder});
        this.close(BtnReturn.YES);
    }
}

export type CurrentPortfolioInfo = {
    store: MainStore,
    router: VueRouter,
    currentMoneyRemainder: string,
    currency: string
};
