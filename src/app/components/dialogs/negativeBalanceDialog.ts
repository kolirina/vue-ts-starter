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
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {Portfolio} from "../../types/types";
import {MainStore} from "../../vuex/mainStore";
import {CurrencyBalances} from "../currencyBalances";

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
                        <v-layout align-center column class="negative-balance-content">
                            <div class="fs18 alignC">
                                Введите сумму остатка денежных средств на брокерском счету
                            </div>
                            <currency-balances v-if="portfolio" :portfolio-id="portfolio.id" @specifyResidues="specifyResidues"></currency-balances>
                        </v-layout>
                    </v-card-text>
                </v-layout>
            </v-card>
        </v-dialog>
    `,
    components: {CurrencyBalances}
})
export class NegativeBalanceDialog extends CustomDialog<CurrentPortfolioInfo, BtnReturn> {

    /** Текущий выбранный портфель */
    private portfolio: Portfolio = null;

    /**
     * Инициализация данных диалога
     * @inheritDoc
     */
    mounted(): void {
        this.portfolio = (this.data.store as any).currentPortfolio;
    }

    private async specifyResidues(): Promise<void> {
        this.close(BtnReturn.YES);
    }
}

export type CurrentPortfolioInfo = {
    store: MainStore
};
