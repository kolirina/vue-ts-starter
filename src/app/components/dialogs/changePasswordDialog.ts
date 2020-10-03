import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Vue} from "vue/types/vue";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientInfo, ClientService} from "../../services/clientService";

/**
 * Диалог подтверждения
 */
@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="change-password-d dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div class="change-password-d__content">
                    <div class="change-password-d__title">Смена пароля</div>
                    <div class="change-password-d-text">
                        <v-form ref="form" v-model="valid" lazy-validation>
                            <v-text-field
                                    class="change-password-d-input"
                                    :class="showPassword ? 'show-password' : 'hide-password'"
                                    id="currentPassword"
                                    v-model="password"
                                    append-icon="visibility"
                                    v-validate="'required|max:50|min:6'"
                                    :error-messages="errors.collect('password')"
                                    data-vv-name="password"
                                    ref="Пароль"
                                    label="Текущий пароль"
                                    required
                                    autofocus
                                    :type="showPassword ? 'text' : 'password'"
                                    autocomplete="off"
                                    browser-autocomplete="off"
                                    @click:append="showPassword = !showPassword">
                            </v-text-field>

                            <v-text-field
                                    class="change-password-d-input"
                                    :class="showNewPassword ? 'show-password' : 'hide-password'"
                                    id="newPassword"
                                    v-model="newPassword"
                                    append-icon="visibility"
                                    v-validate="'required|max:50|min:6|confirmed:Пароль'"
                                    :error-messages="errors.collect('newPassword')"
                                    data-vv-name="newPassword"
                                    label="Новый пароль"
                                    required
                                    :persistent-hint="true"
                                    ref="newPassword"
                                    :type="showNewPassword ? 'text' : 'password'"
                                    autocomplete="off"
                                    browser-autocomplete="off"
                                    hint="Пароль может содержать строчные и прописные латинские буквы, цифры, спецсимволы. Минимум 6 символов"
                                    @click:append="showNewPassword = !showNewPassword">
                                    placeholder="Введите пароль"
                            </v-text-field>
                        </v-form>
                    </div>
                    <v-card-actions class="margT30 px-0 py-0">
                        <v-btn :disabled="!valid" @click.native="validateAndChangePassword" color="primary">Применить</v-btn>
                    </v-card-actions>
                </div>
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
    @ShowProgress
    @DisableConcurrentExecution
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
