import Component from "vue-class-component";
import {ContentLoader} from "vue-content-loader";
import {UI} from "./ui";
import {ErrorHandler} from "../components/errorHandler";

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <!-- Обработчик ошибок -->
            <error-handler></error-handler>

            <template v-if="!loading && !loggedIn">
                <sign-in @login="login" @registration="checkAuthorized"></sign-in>
            </template>

            <template v-if="!loading && loggedIn">
                <v-navigation-drawer disable-resize-watcher fixed stateless app class="sidebar" v-model="drawer" :mini-variant="sideBarOpened" width="320" mini-variant-width="64">
                    <menu-header :side-bar-opened="sideBarOpened" :portfolio="portfolio" :clientInfo="clientInfo" @togglePanel="togglePanel"></menu-header>
                    <div v-if="!sideBarOpened" :class="['wrap-toogle-menu-btn', 'small-screen-hide-toogle-menu-btn']">
                        <v-btn @click="togglePanel" fab dark small depressed color="#F0F3F8" class="toogle-menu-btn">
                            <v-icon dark>keyboard_arrow_left</v-icon>
                        </v-btn>
                    </div>
                    <navigation-list :mainSection="mainSection" :side-bar-opened="sideBarOpened"
                                     @openDialog="openDialog"></navigation-list>
                </v-navigation-drawer>
                <v-content>
                    <v-container fluid :class="['paddT0', 'fb-0', sideBarOpened ? '' : 'hide-main-content']">
                        <v-slide-y-transition mode="out-in">
                            <!--<keep-alive :include="cachedPages">-->
                            <router-view></router-view>
                            <!--</keep-alive>-->
                        </v-slide-y-transition>
                    </v-container>
                    <v-footer color="#f7f9fb" :class="['footer-app', sideBarOpened ? '' : 'hide-main-content']">
                        <footer-content :clientInfo="clientInfo"></footer-content>
                    </v-footer>
                </v-content>
            </template>

            <template v-if="loading">
                <v-content>
                    <div class="mobile-wrapper-menu"></div>
                    <v-container fluid :class="['paddT0', 'fb-0', sideBarOpened ? '' : 'hide-main-content']">
                        <content-loader class="content-loader" :height="800" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                            <rect x="0" y="20" rx="5" ry="5" width="801.11" height="80"/>
                            <rect x="0" y="120" rx="5" ry="5" width="801.11" height="30"/>
                            <rect x="0" y="170" rx="5" ry="5" width="801.11" height="180"/>
                            <rect x="0" y="370" rx="5" ry="5" width="801.11" height="180"/>
                            <rect x="0" y="570" rx="5" ry="5" width="801.11" height="180"/>
                        </content-loader>
                    </v-container>
                    <v-footer color="#f7f9fb" :class="['footer-app', sideBarOpened ? '' : 'hide-main-content']"></v-footer>
                </v-content>
            </template>
        </v-app>`,
    components: {ContentLoader, ErrorHandler}
})
export class AppFrame extends UI {
    /** Признак залогиненного пользователя */
    private loggedIn = false;
    private loading = true;

    async created(): Promise<void> {
        await this.checkAuthorized();
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.loggedIn = true;
        }
    }

    private async checkAuthorized(): Promise<void> {
        const authorized = !!this.localStorage.get(StoreKeys.TOKEN_KEY, null);
        // если есть токен юзера в локал стор и стор пуст и это не публичная зона то пробуем загрузить инфу о клиенте
        if (authorized && !CommonUtils.exists(this.$store.state[StoreType.MAIN].clientInfo)) {
            await this.startup();
        }
    }

    private async startup(): Promise<void> {
        this.loading = true;
        try {
            // загружаем клиента
            // заполняем стор
            // осуществляем навигацию (при необходимости)
            this.loggedIn = true;
        } finally {
            this.loading = false;
        }
    }

    private async login(signInData: SignInData): Promise<void> {
        if (!signInData.username || !signInData.password) {
            this.$snotify.warning("Введите логин и пароль");
            return;
        }
        this.loading = true;
        try {
            this.localStorage.set(StoreKeys.REMEMBER_ME_KEY, signInData.rememberMe);
            const clientInfo = await this.clientService.login({username: signInData.username, password: signInData.password});
            this.localStorage.set(StoreKeys.REFRESH_TOKEN, clientInfo.refreshToken);
            await this.loadUser(clientInfo);
            await this.loadSystemProperties();
            await this.loadCurrentPortfolio();
            await this.loadOnBoardingTours();
            await this.initLearnTour();
            this.navigateUser();
            this.loggedIn = true;
            this.$snotify.clear();
        } finally {
            this.loading = false;
        }
    }
}
