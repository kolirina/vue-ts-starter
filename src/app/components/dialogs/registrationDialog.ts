import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientService} from "../../services/clientService";
import {StoreKeys} from "../../types/storeKeys";

@Component({
    template: `
        <v-dialog v-model="showed" max-width="600px">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <v-layout justify-center class="wrap-registration-form">
                    <v-layout class="maxW275" column>
                        <div class="fs18 bold alignC mb-5">Регистрация</div>
                        <div>
                            <v-text-field
                                v-model.trim="email"
                                type="email"
                                @keydown.enter="registration"
                                :placeholder="'Введите Email'">
                            </v-text-field>
                        </div>
                        <div class="fs14 mt-3">
                            Нажимая кнопку Зарегистрироваться, вы принимаете условия
                            <a href="https://intelinvest.ru/terms-of-use" target="_blank" class="decorationNone">соглашения</a>
                        </div>
                        <div class="alignC mt-3">
                            <v-btn @click="registration" color="primary sign-btn maxW275">Зарегистрироваться</v-btn>
                        </div>
                    </v-layout>
                </v-layout>
            </v-card>
        </v-dialog>
    `
})
export class RegistrationDialog extends CustomDialog<string, BtnReturn> {
    @Inject
    private clientService: ClientService;
    private email: string = "";
    // tslint:disable-next-line
    private emailRule = new RegExp(/^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)+$/);

    private async registration(): Promise<void> {
        if (!this.isEmailValid) {
            return;
        }
        const referrerId = this.getCookie("referrer_id");
        const googleId = this.getGaId();
        const userInfo = await this.clientService.signUp({email: this.email, referrerId, googleId});
        localStorage.setItem(StoreKeys.TOKEN_KEY, JSON.stringify(userInfo.token));
        localStorage.setItem(StoreKeys.REMEMBER_ME_KEY, "true");
        // сообщение не пропадет пока пользователь на него не кликнет
        this.$snotify.info("Поздавляем! Вы успешно зарегистрированы. Письмо с паролем отправлено вам на почту", {
            timeout: 0
        });
        this.close(BtnReturn.YES);
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

    private getGaId(): string {
        try {
            const ga: string = this.getCookie("_ga");
            const array = ga.split(".");
            return array[array.length - 1];
        } catch (e) {
            return null;
        }
    }

    private getCookie(name: string): string {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([\.$?*|{}\(\)\[\]\\\/\+^])/g, "\\$1") + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    }
}
