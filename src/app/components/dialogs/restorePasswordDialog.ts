import {Inject} from "typescript-ioc";
import {Component} from "../../app/ui";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientService} from "../../services/clientService";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout justify-center class="wrap-registration-form">
                    <v-layout class="maxW275" column>
                        <div class="fs18 bold alignC mb-5">Восстановление пароля</div>
                        <div>
                            <v-text-field v-model.trim="email" @keydown.enter="restorePassword" :placeholder="'Введите Email'"></v-text-field>
                        </div>
                        <div class="alignC mt-3">
                            <v-btn @click="restorePassword" color="primary sign-btn maxW275">Восстановить</v-btn>
                        </div>
                    </v-layout>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class RestorePasswordDialog extends CustomDialog<string, void> {

    @Inject
    private clientService: ClientService;
    /** Почта */
    private email: string = "";

    private async restorePassword(): Promise<void> {
        if (!(await this.isEmailValid())) {
            return;
        }
        await this.clientService.restorePassword(this.email);
        this.$snotify.info("Письмо с новым паролем успешно отправлено на эл.почту", {
            timeout: 0
        });
        this.close();
    }

    private async isEmailValid(): Promise<boolean> {
        this.$validator.attach({name: "value", rules: "required|email"});
        const result = await this.$validator.validate("value", this.email);
        if (!result) {
            this.$snotify.warning("Неверное значение e-mail");
        }
        return result;
    }
}
