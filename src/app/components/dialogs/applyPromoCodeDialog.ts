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
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {TariffService} from "../../services/tariffService";
import {CommonUtils} from "../../utils/commonUtils";
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог ввода промокода
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="300px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="headline">Введите промокод</v-card-title>
                <v-card-text>
                    <v-text-field v-model.trim="promoCode" maxlength="10" size="10" @keypress.enter="applyPromoCode"
                                  label="Введите промокод" clearable></v-text-field>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" :disabled="!promoCode" @click.native="applyPromoCode">Применить</v-btn>
                    <v-btn @click.native="close('NO')">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ApplyPromoCodeDialog extends CustomDialog<void, BtnReturn> {

    @Inject
    private tariffService: TariffService;
    /** Введенный промокод */
    private promoCode = "";

    @ShowProgress
    @CatchErrors
    private async applyPromoCode(): Promise<void> {
        if (CommonUtils.isBlank(this.promoCode)) {
            this.$snotify.warning("Пожалуйста введите промокод");
            return;
        }
        await this.tariffService.applyPromoCode(this.promoCode);
        this.$snotify.info("Промокод успешно применен");
        this.close(BtnReturn.YES);
    }
}