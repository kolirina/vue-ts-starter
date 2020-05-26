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
import {StoreType} from "../../../vuex/storeType";
import {ClientInfo, ClientService} from "../../../services/clientService";
import {MutationType} from "../../../vuex/mutationType";
import {ConfirmDialog} from "../../../components/dialogs/confirmDialog";
import {BtnReturn} from "../../../platform/dialogs/customDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Подписки</div>
                </v-card-title>
            </v-card>
            <v-layout class="profile" column>
                <v-layout wrap align-center>
                    <v-card flat>
                        <span class="profile__subtitle">
                            Информационная рассылка
                        </span>
                        <v-layout wrap>
                            <div v-if="clientInfo.user.unsubscribed" class="fs13 maxW778 mr-4 mt-3">
                                Вы не подписаны на нашу рассылку. Вы не будете получать сообщения о новых возможностях, акциях и других важных новостях сервиса.
                            </div>
                            <div v-else class="fs13 maxW778 mr-4 mt-3">
                                Вы подписаны на нашу рассылку. Вы будете получать сообщения о новых возможностях, акциях и других важных новостях сервиса.
                            </div>
                            <v-btn @click.stop="changeMailSubscription" class="mt-3" color="#EBEFF7">
                                {{ clientInfo.user.unsubscribed ? 'Подписаться' : 'Отписаться'}}
                            </v-btn>
                        </v-layout>
                    </v-card>
                </v-layout>
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
}
