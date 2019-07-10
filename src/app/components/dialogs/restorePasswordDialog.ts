import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientService} from "../../services/clientService";

@Component({
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout justify-center class="wrap-registration-form">
                    <v-layout class="maxW275" column>
                        <div class="fs18 bold alignC mb-5">Востановление пароля</div>
                        <div>
                            <v-text-field
                                v-model.trim="email"
                                type="email"
                                @keydown.enter="restorePassword"
                                :placeholder="'Введите Email'">
                            </v-text-field>
                        </div>
                        <div class="alignC mt-3">
                            <v-btn @click="restorePassword" color="primary sign-btn maxW275">Востановить</v-btn>
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
    private email: string = "";
    // tslint:disable-next-line
    private emailRule = new RegExp(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/);

    private async restorePassword(): Promise<void> {
        if (!this.isEmailValid) {
            return;
        }
        await this.clientService.restorePassword(this.email);
        this.$snotify.info("Письмо с новым паролем успешно отправлено на эл.почту", {
            timeout: 0
        });
        this.close();
    }

    private get isEmailValid(): boolean {
        const isEmailValid = this.email.length > 0 && this.emailRule.test(this.email);
        if (isEmailValid) {
            return true;
        } else {
            this.$snotify.error("Неверный формат Email");
            return false;
        }
    }
}
