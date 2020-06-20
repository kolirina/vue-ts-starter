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
import {ChangePasswordDialog} from "../../../components/dialogs/changePasswordDialog";
import {ConfirmDeleteProfileDialog} from "../../../components/dialogs/confirmDeleteProfileDialog";
import {DeleteProfileReasonDialog} from "../../../components/dialogs/deleteProfileReasonDialog";
import {ShowProgress} from "../../../platform/decorators/showProgress";
import {BtnReturn} from "../../../platform/dialogs/customDialog";
import {ClientInfo, ClientService, DeleteProfileRequest} from "../../../services/clientService";
import {TariffService} from "../../../services/tariffService";
import {CommonUtils} from "../../../utils/commonUtils";
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
                <div class="card__header">
                    <div class="card__header-title">
                        <img src="./img/profile/main-settings.svg" alt="">
                        <div>
                            <span>Основные настройки</span>
                            <div @click="goBack" class="back-btn">Назад</div>
                        </div>
                    </div>
                    <v-btn @click.stop="changePassword" color="#EBEFF7">
                        Сменить пароль
                    </v-btn>
                </div>
                <v-card flat>
                    <div class="profile__subtitle margB8 margT0">Email</div>
                    <v-layout align-center justify-start row fill-height wrap>
                        <inplace-input name="email" :value="email" :max-length="120" @input="onEmailChange" class="mr-3 mb-2">
                            <v-tooltip v-if="!clientInfo.user.emailConfirmed" content-class="custom-tooltip-wrap" max-width="250px" slot="afterText" top>
                                <v-icon slot="activator" class="profile-not-confirmed-email">fas fa-exclamation-triangle</v-icon>
                                <span>Адрес не подтвержден. Пожалуйста, подтвердите Ваш адрес эл.почты что бы воспользоваться всеми функциями сервиса.</span>
                            </v-tooltip>
                        </inplace-input>
                        <v-btn v-if="!clientInfo.user.emailConfirmed" @click="verifyEmail" color="#EBEFF7">
                            Подтвердить почту
                        </v-btn>
                    </v-layout>

                    <div class="profile__subtitle margB8 margT12">Имя пользователя</div>
                    <inplace-input name="username" :value="username" :max-length="120" @input="onUserNameChange"></inplace-input>
                </v-card>
                <expanded-panel :value="[0]" class="promo-codes__statistics mt-3">
                    <template #header>Удаление аккаунта</template>
                    <v-card flat>
                        <v-layout wrap align-center>
                            <div class="fs13 maxW778 mr-4 mt-2">
                                Внимание! После удаления аккаунта, вы больше не сможете войти в личный кабинет.
                            </div>
                            <v-btn @click.stop="deleteProfileAndUnsubscribe" class="mt-2" color="#EBEFF7">
                                Удалить аккаунт
                            </v-btn>
                        </v-layout>
                    </v-card>
                </expanded-panel>
            </v-layout>
        </v-container>
    `
})
export class ProfileMainPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Сервис для работы с тарифами */
    @Inject
    private tariffService: TariffService;
    /** Имя пользователя */
    private username = "";
    /** email пользователя */
    private email = "";

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.username = this.clientInfo.user.username;
        this.email = this.clientInfo.user.email;
    }

    /**
     * Открывает диалог для смены пароля
     */
    private async changePassword(): Promise<void> {
        await new ChangePasswordDialog().show(this.clientInfo);
    }

    /**
     * Обабатывает смену email пользователя
     * @param email
     */
    @ShowProgress
    private async onEmailChange(email: string): Promise<void> {
        this.email = CommonUtils.isBlank(email) ? this.clientInfo.user.email : email;
        if (!(await this.validate())) {
            this.email = this.clientInfo.user.email;
            return;
        }
        // отправляем запрос только если действительно поменяли
        if (this.email !== this.clientInfo.user.email) {
            await this.clientService.changeEmail({id: this.clientInfo.user.id, email: this.email});
            this.clientInfo.user.email = this.email;
            this.$snotify.info("Вам отправлено письмо с подтверждением на новый адрес эл. почты");
        }
    }

    /**
     * Проверяет введенное значение, если валидация не пройдена, выкидывает ошибку.
     */
    private async validate(): Promise<boolean> {
        this.$validator.attach({name: "value", rules: "email"});
        const result = await this.$validator.validate("value", this.email);
        if (!result) {
            this.$snotify.warning(`Неверное значение e-mail "${this.email}"`);
        }
        return result;
    }

    /**
     * Обрабатывает смену имени пользователя
     * @param username
     */
    @ShowProgress
    private async onUserNameChange(username: string): Promise<void> {
        this.username = CommonUtils.isBlank(username) ? this.clientInfo.user.username : username;
        // отправляем запрос только если действительно поменяли
        if (this.username !== this.clientInfo.user.username) {
            await this.clientService.changeUsername({id: this.clientInfo.user.id, username: this.username});
            this.clientInfo.user.username = this.username;
            this.$snotify.info("Новое имя пользователя успешно сохранено");
        }
    }

    /**
     * Отправляет запрос на подтверждение E-mail
     * @returns {Promise<void>}
     */
    @ShowProgress
    private async verifyEmail(): Promise<void> {
        await this.clientService.verifyEmail();
        this.$snotify.info("Письмо с подтверждением отправлено на почту");
    }

    /**
     * Удаляет профиль
     */
    private async deleteProfileAndUnsubscribe(): Promise<void> {
        const result = await new ConfirmDeleteProfileDialog().show(this.$router);
        if (result !== BtnReturn.YES) {
            return;
        }
        const request = await new DeleteProfileReasonDialog().show();
        if (request) {
            await this.deleteProfileAndUnsubscribeConfirmed(request);
            this.$router.push("logout");
        }
    }

    @ShowProgress
    private async deleteProfileAndUnsubscribeConfirmed(deleteProfileRequest: DeleteProfileRequest): Promise<void> {
        await this.clientService.deleteProfileAndUnsubscribe(deleteProfileRequest);
    }

    private goBack(): void {
        this.$router.push({name: "profile"});
    }
}
