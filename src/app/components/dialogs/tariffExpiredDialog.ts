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

/**
 * Диалог блокировки экрана при истекшем тарифе
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="600px" :closable="false">
            <v-card class="dialog-wrap">
                <v-icon v-if="allowClose" class="closeDialog" @click.native="closeDialog">close</v-icon>
                <span v-else class="closeDialog">{{ count }}</span>

                <v-card-title class="bold fs16 margB64">Оформите подписку на тарифный план</v-card-title>
                <v-card-text class="paddB128">
                    <v-layout align-center column>
                        <v-img src="./img/tariffs/update_tariff.svg" width="100%" height="100%" max-width="346" max-height="131"></v-img>
                        <div v-if="data.isFreeTariff || data.isExpiredTrial" class="fs14 mw320 alignC mt-2">
                            Подключите любой платный тарифный план (Профессионал или Стандарт) для получения доступа ко всем возможностям сервиса.
                            Подробнее узнать о тарифных планах Intelinvest, вы можете по ссылке ниже:
                        </div>
                        <div v-else-if="data.isExpiredStandart" class="fs14 mw320 alignC mt-2">
                            Продлите вашу подписку на тарифный план Стандарт или подключите тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                            Подробнее узнать о тарифных планах Intelinvest, вы можете по ссылке ниже:
                        </div>
                        <div v-else class="fs14 mw320 alignC mt-2">
                            Продлите вашу подписку на тарифный план Профессионал для получения доступа ко всем возможностям сервиса.
                            Подробнее узнать о тарифных планах Intelinvest, вы можете по ссылке ниже:
                        </div>
                        <div class="margT24">
                            <v-btn @click="tariffs" color="primary">
                                Обновить подписку
                            </v-btn>
                        </div>
                    </v-layout>
                </v-card-text>
            </v-card>
        </v-dialog>
    `
})
export class TariffExpiredDialog extends CustomDialog<ExpiredTariffDialogData, BtnReturn> {

    /** Признак возможности закрыть диалог */
    private allowClose = false;
    /** Счетчик до возможности закрытия */
    private count = 10;
    /** Текущий интервал */
    private intervalId: number = null;

    /**
     * Инициализирует таймер
     * @inheritDoc
     */
    mounted(): void {
        this.intervalId = setInterval(() => {
            this.count--;
            if (this.count === 0) {
                this.allowClose = true;
                clearInterval(this.intervalId);
            }
        }, 1000);
    }

    /**
     * Удаляет таймер если он есть
     * @inheritDoc
     */
    destroyed(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }
    }

    private closeDialog(): void {
        if (this.allowClose) {
            this.close();
        }
    }

    private tariffs(): void {
        this.data.router.push({path: "/settings/tariffs"});
        this.close();
    }
}

export type ExpiredTariffDialogData = {
    isFreeTariff: boolean,
    isExpiredTrial: boolean,
    isExpiredStandart: boolean,
    isExpiredPro: boolean,
    router: VueRouter
};