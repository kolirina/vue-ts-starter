import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {SignInData} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {StoreType} from "../vuex/storeType";
import {FooterContent} from "./footerContent";
import {UpdateServiceInfo} from "./updateServiceInfo";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="sing-in-wrap h100pc pa-0">
            <v-layout align-center class="h100pc">
                <v-layout align-center justify-center column>
                    <v-layout class="paired-section" wrap justify-center>
                        <v-layout class="paired-section__left-section" column align-center>
                            <div class="logo-wrap w100pc">
                                <span class="logo-sign-in auto-cursor"></span>
                                <span class="fs18">
                                    Intelinvest
                                </span>
                            </div>
                            <div>
                                <div class="fs36 alignC">
                                    Здравствуйте!
                                </div>
                                <div class="mt-4 maxW275">
                                    <v-text-field
                                        v-model.trim="signInData.username"
                                        type="text"
                                        :placeholder="'Логин'">
                                    </v-text-field>
                                </div>
                                <div class="margT30 maxW275">
                                    <v-text-field
                                        v-model.trim="signInData.password"
                                        type="password"
                                        :placeholder="'Пароль'">
                                    </v-text-field>
                                </div>
                                <div class="margT30 maxW275">
                                    <v-btn :disabled="loginBtnDisabled" class="btn sign-in-btn" @click="signIn">Войти</v-btn>
                                </div>
                                <div class="margT30 mb-4">
                                    <v-checkbox v-model="signInData.rememberMe"
                                                hide-details
                                                label="Запомнить меня"></v-checkbox>
                                </div>
                            </div>
                        </v-layout>
                        <v-layout class="paired-section__right-section" column>
                            <div class="logo-wrap">
                                <a href="https://intelinvest.ru/prices" target="_blank" class="fs14 decorationNone bold mr-5">Тарифы</a>
                                <a href="https://blog.intelinvest.ru/" target="_blank" class="fs14 decorationNone bold mr-5">Блог</a>
                                <a href="https://telegram.me/intelinvestSupportBot" target="_blank" class="fs14 decorationNone bold mr-5">Поддержка</a>
                            </div>
                            <div class="bold fs16">Обновления сервиса</div>
                            <update-service-info></update-service-info>
                        </v-layout>
                    </v-layout>
                    <v-layout wrap justify-space-between align-center class="pre-footer">
                        <div class="fs14 maxW778">
                            OOO "Интелинвест" использует файлы «cookie», с целью улучшения качества продукта. «Cookie» это небольшие файлы,
                            содержащие информацию о предыдущих посещениях веб-сайта. Если вы не хотите использовать файлы «cookie», измените настройки браузера.
                        </div>
                        <div>
                            <a href="https://itunes.apple.com/ru/app/intelinvest-%D1%83%D1%87%D0%B5%D1%82-%D0%B8%D0%BD%D0%B2%D0%B5%D1%81%D1%82%D0%B8%D1%86%D0%B8%D0%B9
                                /id1422478197?mt=8" title="Загрузите приложение в App Store" target="_blank" class="mr-1">
                                <img src="./img/help/app-store-badge2.svg" alt="pic">
                            </a>
                            <a href="https://play.google.com/store/apps/details?id=ru.intelinvest.portfolio" title="Загрузите приложение в Google Play"
                                target="_blank" class="ml-2">
                                <img src="./img/help/google-play-badge2.svg" alt="pic">
                            </a>
                        </div>
                    </v-layout>
                    <v-layout class="footer">
                        <footer-content></footer-content>
                    </v-layout>
                </v-layout>
            </v-layout>
        </v-container>
    `,
    components: {FooterContent, UpdateServiceInfo}
})
export class SignIn extends UI {

    private signInData: SignInData = {
        username: "",
        password: "",
        rememberMe: true
    };

    async signIn(): Promise<void> {
        this.$emit("login", this.signInData);
    }

    private get loginBtnDisabled(): boolean {
        return CommonUtils.isBlank(this.signInData.username) || CommonUtils.isBlank(this.signInData.password);
    }
}
