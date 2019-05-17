import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ChangePasswordDialog} from "../../components/dialogs/changePasswordDialog";
import {ConfirmDialog} from "../../components/dialogs/confirmDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {BtnReturn} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
import {TariffService, UserPaymentInfo} from "../../services/tariffService";
import {Tariff} from "../../types/tariff";
import {CommonUtils} from "../../utils/commonUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Профиль</div>
                    <v-spacer></v-spacer>
                    <v-btn @click.stop="changePassword" class="primary">
                        Сменить пароль
                    </v-btn>
                </v-card-title>
            </v-card>
            <v-card flat class="profile">
                <div class="fs16 mb-2">
                    Детали профиля
                </div>
                <div class="profile__subtitle margT0">Email</div>
                <inplace-input name="email" :value="email" @input="onEmailChange">
                    <v-tooltip content-class="custom-tooltip-wrap" max-width="250px" slot="afterText" top>
                        <v-icon slot="activator" v-if="!clientInfo.user.emailConfirmed" class="profile-not-confirmed-email">fas fa-exclamation-triangle</v-icon>
                        <span>Адрес не подтвержден. Пожалуйста подтвердите Ваш адрес эл.почты что воспользоваться всеми функциями сервиса.</span>
                    </v-tooltip>
                </inplace-input>
                <div class="profile__subtitle">Имя пользователя</div>
                <inplace-input name="username" :value="username" @input="onUserNameChange"></inplace-input>
            </v-card>
            <v-card v-if="hasPaymentInfo" flat>
                Способ оплаты
                <!-- TODO верстка -->
                <v-tooltip content-class="custom-tooltip-wrap" max-width="280px" bottom>
                    <div slot="activator">
                        <div>{{ paymentInfo.pan }}</div>
                        <div>{{ paymentInfo.expDate }}</div>
                    </div>
                    <span>У вас активировано автоматическое продление подписки, вы можете отменить ее с помощью кнопки "Отвязать карту".</span>
                </v-tooltip>

                <v-btn @click.stop="cancelOrderSchedule" class="primary">
                    Отвязать карту
                </v-btn>
            </v-card>
        </v-container>
    `
})
export class ProfilePage extends UI {

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
    /** Платежная информация пользователя */
    private paymentInfo: UserPaymentInfo = null;

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.username = this.clientInfo.user.username;
        this.email = this.clientInfo.user.email;
        if (![Tariff.FREE, Tariff.TRIAL].includes(this.clientInfo.user.tariff)) {
            this.paymentInfo = await this.tariffService.getPaymentInfo();
        }
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
     * Отменяет автоматическую подписку
     */
    private async cancelOrderSchedule(): Promise<void> {
        const result = await new ConfirmDialog().show("Вы уверены, что хотите отменить подписку? Автоматическое продление будет отключено. " +
            "После окончания подписки некоторые услуги могут стать недоступны.");
        if (result === BtnReturn.YES) {
            await this.cancelOrderScheduleConfirmed();
            this.$snotify.info("Автоматическое продление подписки успешно отключено");
        }
    }

    @ShowProgress
    private async cancelOrderScheduleConfirmed(): Promise<void> {
        await this.tariffService.cancelOrderSchedule();
    }

    /**
     * Возвращает признак наличия информации о периодической подписке
     */
    private get hasPaymentInfo(): boolean {
        return this.paymentInfo && CommonUtils.exists(this.paymentInfo.pan) && CommonUtils.exists(this.paymentInfo.expDate);
    }
}
