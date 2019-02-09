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
import {Storage} from "../../platform/services/storage";
import {StoreKeys} from "../../types/storeKeys";
import {BtnReturn, CustomDialog} from "./customDialog";

/**
 * Диалог для демо - режима
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="500px" closable>
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="headline">Вы находитесь в демо-режиме</v-card-title>
                <v-card-text>
                    <div>Чтобы воспользоваться всеми возможностями сервиса, Вам нужно всего лишь зарегистрироваться - это займет не больше пары минут.</div>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="primary" @click.native="register">
                        Зарегистрироваться
                        <v-icon right dark small>fas fa-user-plus</v-icon>
                    </v-btn>

                    <v-btn @click.native="close('NO')">Закрыть</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ForbiddenDialog extends CustomDialog<null, BtnReturn> {

    @Inject
    private localStorage: Storage;

    private register(): void {
        this.localStorage.delete(StoreKeys.TOKEN_KEY);
        window.location.replace("https://intelinvest.ru/?registration=true");
    }
}
