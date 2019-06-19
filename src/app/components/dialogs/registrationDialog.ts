import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {BtnReturn, CustomDialog} from "../../platform/dialogs/customDialog";
import {ClientService} from "../../services/clientService";
import {StoreKeys} from "../../types/storeKeys";

@Component({
    template: `
        <v-dialog v-model="showed" max-width="420px">
            <v-card class="dialog-wrap pa-5">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>
                <div class="fs18 bold alignC mb-4">Регистрация</div>
                <div v-if="errorMsg" class="mb-4 alignC fs16 error-text">{{ errorMsg }}</div>
                <v-text-field
                    v-model.trim="email"
                    type="email"
                    @keydown.enter="submit"
                    :placeholder="'Эл.почта'">
                </v-text-field>
                <div class="alignC mt-4">
                    <v-btn @click="registration" color="primary" large>Зарегистрироваться</v-btn>
                </div>
                <div class="fs14 alignC mt-4">
                    Нажимая кнопку Зарегистрироваться, вы принимаете условия <a href="https://intelinvest.ru/terms-of-use" target="_blank" class="decorationNone">соглашения</a>
                </div>
            </v-card>
        </v-dialog>
    `
})
export class RegistrationDialog extends CustomDialog<string, BtnReturn> {
    @Inject
    private clientService: ClientService;
    private email: string = "";
    private errorMsg: string = null;

    private async registration(): Promise<void> {
        this.errorMsg = null;
        if (!this.isEmailValid) {
            return;
        }
        try {
            const referrerId = this.$cookies.get("referrer_id");
            const googleId = this.getGaId();
            const userInfo = await this.clientService.signUp({email: this.email, referrerId, googleId});
            localStorage.setItem(StoreKeys.TOKEN_KEY, JSON.stringify(userInfo.token));
            localStorage.setItem(StoreKeys.REMEMBER_ME_KEY, "true");
            this.close(BtnReturn.YES);
        } catch (e) {
            this.errorMsg = e.message;
            return;
        }
    }

    private get isEmailValid(): boolean {
        return this.email.length > 0;
    }

    private getGaId(): string {
        try {
            const ga: string = this.$cookies.get("_ga");
            const array = ga.split(".");
            return array[array.length - 1];
        } catch (e) {
            return null;
        }
    }
}