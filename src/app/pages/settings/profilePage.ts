import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ChangePasswordDialog} from "../../components/dialogs/changePasswordDialog";
import {ClientInfo, ClientService} from "../../services/clientService";
import {CommonUtils} from "../../utils/commonUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-card>
            <v-card class="profile">
                <h1 class="profile-title">
                    Профиль
                    <img src="img/profile/profile-user.png" />
                </h1>

                <v-layout row wrap class="profile-line">
                    <v-flex xs2>Email:</v-flex>
                    <v-flex xs5>
                        <inplace-input :value="email" @input="onEmailChange">
                            <v-icon v-if="!clientInfo.user.emailConfirmed" slot="afterText" class="profile-not-confirmed-email">fas fa-exclamation-triangle</v-icon>
                        </inplace-input>
                    </v-flex>
                </v-layout>

                <v-layout row wrap class="profile-line">
                    <v-flex xs2>Имя пользователя:</v-flex>
                    <v-flex xs5>
                        <inplace-input :value="username" @input="onUserNameChange"></inplace-input>
                    </v-flex>
                </v-layout>

                <v-btn @click.native="changePassword" class="btn-profile">
                    Сменить пароль
                </v-btn>
            </v-card>
        </v-card>
    `
})
export class ProfilePage extends UI {

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
    private async onEmailChange(email: string): Promise<void> {
        this.email = CommonUtils.isBlank(email) ? this.clientInfo.user.email : email;
        // отправляем запрос только если действительно поменяли
        if (this.email !== this.clientInfo.user.email) {
            await this.clientService.changeEmail({id: this.clientInfo.user.id, email: this.email});
            this.clientInfo.user.email = this.email;
            this.$snotify.success("Вам отправлено письмо с подтверждением на новый адрес эл. почты");
        }
    }

    /**
     * Обрабатывает смену имени пользователя
     * @param username
     */
    private async onUserNameChange(username: string): Promise<void> {
        this.username = CommonUtils.isBlank(username) ? this.clientInfo.user.username : username;
        // отправляем запрос только если действительно поменяли
        if (this.username !== this.clientInfo.user.username) {
            await this.clientService.changeUsername({id: this.clientInfo.user.id, username: this.username});
            this.clientInfo.user.username = this.username;
            this.$snotify.success("Новое имя пользователя успешно сохранено");
        }
    }
}
