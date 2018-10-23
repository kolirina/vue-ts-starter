import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ChangePasswordDialog} from "../../components/dialogs/changePasswordDialog";
import {ClientService} from "../../services/clientService";
import {ClientInfo} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card>
                <v-card-text>
                    <h4 class="display-1">Профиль</h4>
                    <v-btn dark color="primary" @click.native="changePassword">
                        Сменить пароль
                        <v-icon>fas fa-key fa-sm</v-icon>
                    </v-btn>
                    <div style="height: 50px"></div>
                    <span> Сменить email</span>
                    <inplace-input :value="email" @input="onEmailChange"></inplace-input>
                    <div style="height: 50px"></div>
                    <span>Сменить имя пользователя</span>
                    <inplace-input :value="username" @input="onUserNameChange"></inplace-input>
                </v-card-text>
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
    private onEmailChange(email: string): void {
        this.email = CommonUtils.isBlank(email) ? this.clientInfo.user.email : email;
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
