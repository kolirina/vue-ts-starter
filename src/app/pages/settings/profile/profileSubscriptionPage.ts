/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject} from "typescript-ioc";
import {Component, namespace, UI} from "../../../app/ui";
import {ConfirmDialog} from "../../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {MutationType} from "../../../vuex/mutationType";
import {StoreType} from "../../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Профиль</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <div class="profile__header">
                    <div class="profile__header-title">
                        <img src="./img/profile/subscriptions.svg" alt="">
                        <div>
                            <span>Подписки</span>
                            <div @click="goBack" class="profile__back-btn">Назад</div>
                        </div>
                    </div>
                </div>
                <v-card flat>
                    <span class="profile__subtitle">
                        Информационная рассылка
                    </span>
                    <v-layout class="profile__subscriptions" wrap>
                        <div v-if="clientInfo.user.unsubscribed">
                            Вы не подписаны на нашу информационную рассылку.
                            Вы не будете получать сообщения о новых возможностях, акциях и других важных новостях сервиса.
                        </div>
                        <div v-else>
                            Вы подписаны на нашу информационную рассылку.
                            Вы будете получать сообщения о новых возможностях, акциях и других важных новостях сервиса.
                        </div>
                        <v-btn @click.stop="changeMailSubscription" color="#EBEFF7">
                            {{ clientInfo.user.unsubscribed ? 'Подписаться' : 'Отписаться'}}
                        </v-btn>
                    </v-layout>
                </v-card>
            </v-layout>
        </v-container>
    `
})
export class ProfileSubscriptionPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_CLIENT_INFO)
    private reloadUser: () => Promise<void>;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;

    private async changeMailSubscription(): Promise<void> {
        if (this.clientInfo.user.unsubscribed) {
            await this.clientService.subscribeMailSubscription();
            this.$snotify.info("Вы успешно подписались на рассылки");
        } else {
            const result = await new ConfirmDialog().show(
                "Вы действительно хотите отписаться от всех рассылок?" +
                " В этом случае Вы перестанете получать важные сообщения о новых возможностях сервиса, акциях и других важных новостях." +
                " Письма согласно вашим настройкам уведомлений продолжат приходить вам в штатном режиме. Их можно будет отключить в меню Настройки - Уведомления.");
            if (result !== BtnReturn.YES) {
                return;
            }
            await this.clientService.unsubscribeMailSubscription();
            this.$snotify.info("Вы успешно отписались от рассылок");
        }
        this.clientService.resetClientInfo();
        await this.reloadUser();
    }

    private goBack(): void {
        this.$router.push({name: "profile"});
    }
}
