import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Vue} from "vue/types/vue";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {ClientInfo, ClientService} from "../../services/clientService";
import {CustomDialog} from "./customDialog";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="380px">
            <v-card class="change-password-d dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-card-title class="headline change-password-d-title">
                    Смена пароля
                    <img src="img/profile/lock.png">
                </v-card-title>
                <v-card-text class="change-password-d-text">
                    <v-form ref="form" v-model="valid" lazy-validation>
                        <v-text-field
                            class="change-password-d-input"
                            id="currentPassword"
                            v-model="password"
                            :append-icon="showPassword ? 'visibility_off' : 'visibility'"
                            v-validate="'required|max:50|min:6'"
                            :error-messages="errors.collect('password')"
                            data-vv-name="password"
                            label="Текущий пароль"
                            required
                            autofocus
                            :type="showPassword ? 'text' : 'password'"
                            autocomplete="off"
                            @click:append="showPassword = !showPassword">
                        </v-text-field>

                        <v-text-field
                            class="change-password-d-input"
                            id="newPassword"
                            v-model="newPassword"
                            :append-icon="showNewPassword ? 'visibility_off' : 'visibility'"
                            v-validate="'required|max:50|min:6'"
                            :counter="50"
                            :error-messages="errors.collect('newPassword')"
                            data-vv-name="newPassword"
                            label="Новый пароль"
                            required
                            :persistent-hint="true"
                            ref="newPassword"
                            :type="showNewPassword ? 'text' : 'password'"
                            autocomplete="off"
                            hint="Пароль может содержать строчные и прописные латинские буквы, цифры, спецсимволы. Минимум 6 символов"
                            @click:append="showNewPassword = !showNewPassword">
                        </v-text-field>
                    </v-form>
                </v-card-text>
                <v-card-actions class="margT20">
                    <v-btn :disabled="!valid" @click.native="validateAndChangePassword" class="btn-dialog btn-hover-black">Сменить пароль</v-btn>
                    <v-btn class="btn-cancel" @click.native="close">Отмена</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `
})
export class ChangePasswordDialog extends CustomDialog<ClientInfo, string> {

    $refs: {
        form: Vue;
    };

    /** Сервис для работы с пользователем */
    @Inject
    private clientService: ClientService;

    private valid = false;
    private showPassword = false;
    private showNewPassword = false;
    private password = "";
    private newPassword = "";

    /**
     * Отправляет запрос на смену пароля пользователя
     */
    @CatchErrors
    @ShowProgress
    private async validateAndChangePassword(): Promise<void> {
        const result = await this.$validator.validateAll();
        if (result) {
            await this.clientService.changePassword({
                email: this.data.user.email,
                password: this.password,
                newPassword: this.newPassword,
                confirmPassword: this.newPassword
            });
            this.$snotify.info("Пароль успешно изменен");
            this.close();
        }
    }
}
