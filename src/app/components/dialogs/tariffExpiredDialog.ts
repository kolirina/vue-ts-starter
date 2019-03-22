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
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог блокировки экрана при истекшем тарифе
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon v-if="allowClose" class="closeDialog" @click.native="closeDialog">close</v-icon>
                <span v-else class="closeDialog">{{ count }}</span>

                <v-card-title class="headline">Закончилась подписка на тарифный план</v-card-title>
                <v-card-text>
                    <div>Срок действия вашего тарифного плана истек, рекомендуем обновить подписку.</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" light @click="tariffs">
                        Обновить подписку
                        <v-icon right dark small>fas fa-rocket</v-icon>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class TariffExpiredDialog extends CustomDialog<VueRouter, BtnReturn> {

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
        this.data.push("tariffs");
        this.close();
    }
}
