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
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {ForbiddenCode} from "../../types/types";

/**
 * Диалог блокировки по тарифу
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px" ref="dialog" persistent :closable="false">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="bold fs16 margB64">Обратите внимание на ваш тариф</v-card-title>
                <v-card-text class="paddB128">
                    <v-layout align-center column>
                        <v-img src="./img/tariffs/update_tariff.svg" width="100%" height="100%" max-width="346" max-height="131"></v-img>
                        <div class="fs14 alignC mt-2">{{ data.description }}</div>
                        <div class="margT24">
                            <v-btn v-if="data.code !== 'SUBSCRIPTION_EXPIRED'" color="primary" @click="tariffs">
                                Обновить тарифный план
                            </v-btn>
                            <v-btn v-if="data.code === 'SUBSCRIPTION_EXPIRED'" color="primary" @click="tariffs">
                                Продлить подписку
                            </v-btn>
                        </div>
                    </v-layout>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn @click.native="close('NO')">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class BlockByTariffDialog extends CustomDialog<ForbiddenCode, BtnReturn> {

    private tariffs(): void {
        window.location.replace("/#/settings/tariffs");
        this.close();
    }
}
