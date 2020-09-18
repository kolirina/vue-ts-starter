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

import {Component} from "../../app/ui";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";

/**
 * Диалог правил Партнерской программы
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="550px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="dialog-header-text">Присоединение к партнерской программе</v-card-title>
                <v-card-text>
                    <div class="import-default-text">
                        Вы собираетесь стать участником Партнерской программы.<br/><br/>
                        За каждого приглашенного пользователя мы будем начислять 30% от его оплат в течение 2 лет.<br/>
                        Вывод осуществляется на расчетный счет от 5000 рублей.<br/>
                        В разделе Статистика вы увидите количество приглашенных пользователей и накопленное вознаграждение.<br/>
                        Все интересующие вопросы (интеграции, вывода средств и т.д.) вы сможете задать персональному менеджеру.
                        <br/><br/>
                        Вернуться обратно к режиму вознаграждения <b>"Подписка"</b> будет невозможно.
                    </div>
                    <v-checkbox slot="activator" v-model="agree" class="mt-4" hide-details>
                        <template #label>
                            <span class="fs12">
                                Я ознакомился с <a :href="partnershipUrl">Партнерским договором Реферальной Программы</a>
                            </span>
                        </template>
                    </v-checkbox>
                </v-card-text>
                <v-card-actions>
                    <v-btn :disabled="!agree" color="primary" @click.native="close('YES')">Начать</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class PartnerProgramJoiningDialog extends CustomDialog<void, BtnReturn> {

    /** Признак согласия с условиями программы */
    private agree: boolean = false;

    private get partnershipUrl(): string {
        return `${window.location.protocol}//${window.location.host}/partnership-agreement`;
    }
}
