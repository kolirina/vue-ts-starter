import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ChangePasswordDialog} from "../../components/dialogs/changePasswordDialog";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../services/clientService";
import {CommonUtils} from "../../utils/commonUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <div class="section-title">Профиль</div>
            <v-card class="profile">
                <v-layout row wrap class="profile-line">
                    <v-flex xs2>Email:</v-flex>
                    <v-flex xs5>
                        <inplace-input name="email" @update:editMode="onModeChange('email', $event)" :editMode="editMode.email" :value="email" @input="onEmailChange">
                            <v-tooltip content-class="custom-tooltip-wrap" max-width="250px" slot="afterText" top>
                                <v-icon slot="activator" v-if="!clientInfo.user.emailConfirmed" class="profile-not-confirmed-email">fas fa-exclamation-triangle</v-icon>
                                <span>Адрес не подтвержден. Пожалуйста подтвердите Ваш адрес эл.почты что воспользоваться всеми функциями сервиса.</span>
                            </v-tooltip>
                        </inplace-input>
                    </v-flex>
                </v-layout>

                <v-layout row wrap class="profile-line">
                    <v-flex xs2>Имя пользователя:</v-flex>
                    <v-flex xs5>
                        <inplace-input name="username"
                                       @update:editMode="onModeChange('username', $event)"
                                       :editMode="editMode.username" :value="username" @input="onUserNameChange"></inplace-input>
                    </v-flex>
                </v-layout>

                <v-btn @click.native="changePassword" color="primary" class="big_btn" dark>
                    Сменить пароль
                </v-btn>
            </v-card>
        </v-container>
    `
})
export class ProfilePage extends UI {

    private editMode: { [key: string]: boolean } = {
        email: false,
        username: false,
    };

    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Сервис для работы с данными клиента */
    @Inject
    private clientService: ClientService;
    /** Имя пользователя */
    private username = "";
    /** email пользователя */
    private email = "";

    /**
     * Инициализирует данные компонента
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        this.username = this.clientInfo.user.username;
        this.email = this.clientInfo.user.email;
    }

    private onModeChange(field: string, newVal: boolean): void {
        if (this.editMode[field] !== undefined) {
            Object.keys(this.editMode).forEach(key => {
                this.editMode[key] = false;
            });
            this.editMode[field] = newVal;
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
    @CatchErrors
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
    @CatchErrors
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
}
