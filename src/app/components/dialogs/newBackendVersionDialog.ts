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
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {LogoutService} from "../../services/logoutService";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div class="import-general-error-wrapper__element-centering">
                    <v-card-title class="dialog-header-text">Требуется подтверждение</v-card-title>
                    <v-card-text>
                        <div class="import-default-text">Ваша версия приложения устарела.</div>
                        <div class="import-default-text">Вам необходимо заново войти в приложение.</div>
                        <div class="import-default-text">Вы будете перенаправлены на страницу входа.</div>
                        <div class="import-default-text-margin-t import-default-text">Продолжить?</div>
                    </v-card-text>
                    <v-card-actions>
                        <v-btn color="primary" @click.native="logout">Да</v-btn>
                        <v-btn @click.native="close('NO')">Нет</v-btn>
                    </v-card-actions>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class NewBackendVersionDialog extends CustomDialog<void, void> {

    @Inject
    private logoutService: LogoutService;

    private async logout(): Promise<void> {
        await this.logoutService.logout();
    }
}
