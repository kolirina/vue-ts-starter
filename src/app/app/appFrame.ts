import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {BtnReturn} from "../components/dialogs/customDialog";
import {FeedbackDialog} from "../components/dialogs/feedbackDialog";
import {NotificationUpdateDialog} from "../components/dialogs/notificationUpdateDialog";
import {ErrorHandler} from "../components/errorHandler";
import {PortfolioSwitcher} from "../components/portfolioSwitcher";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {Storage} from "../platform/services/storage";
import {ClientInfo, ClientService} from "../services/clientService";
import {StoreKeys} from "../types/storeKeys";
import {Portfolio} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {UI} from "./ui";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <vue-snotify></vue-snotify>
            <error-handler></error-handler>
            <template v-if="!loading && !loggedIn && !externalAuth">
                <v-content>
                    <v-container fluid fill-height>
                        <v-layout align-center justify-center>
                            <v-flex xs12 sm8 md4>
                                <v-card class="elevation-12">
                                    <v-toolbar color="primary">
                                        <v-toolbar-title>Вход</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                    </v-toolbar>
                                    <v-card-text>
                                        <v-form>
                                            <v-text-field prepend-icon="person" name="login" label="Имя пользователя" type="text" required
                                                          v-model="username"></v-text-field>
                                            <v-text-field id="password" prepend-icon="lock" name="password" label="Пароль" required type="password"
                                                          v-model="password" @keydown.enter="login"></v-text-field>
                                        </v-form>
                                    </v-card-text>
                                    <v-card-actions>
                                        <v-spacer></v-spacer>
                                        <v-btn color="primary" @click="login">Вход</v-btn>
                                    </v-card-actions>
                                </v-card>
                            </v-flex>
                        </v-layout>
                    </v-container>
                </v-content>
            </template>

            <template v-if="!loading && (loggedIn || externalAuth)">
                <v-navigation-drawer disable-resize-watcher fixed stateless class="sidebar" v-model="drawer" :mini-variant.sync="mini" app>
                    <v-list dense class="sidebar-list">
                        <v-list-tile class="sidebar-list-item">
                            <v-list-tile-action class="sidebar-item-action">
                                <img src="img/sidebar/hamb.svg" class="hamburger" @click="mini = !mini" alt="">
                            </v-list-tile-action>
                        </v-list-tile>

                        <portfolio-switcher v-if="portfolio"></portfolio-switcher>

                        <hr/>

                        <template v-if="!mini" v-for="item in mainSection">
                            <v-list-group class="sidebar-list-item" v-if="item.subMenu" v-model="item.active" :key="item.title" no-action>
                                <v-list-tile slot="activator">
                                    <v-list-tile-content class="pl-3">
                                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile active-class="sidebar-list-item-active" v-for="subItem in item.subMenu" :key="subItem.action"
                                             :to="{name: subItem.action, params: item.params}">
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list-group>

                            <v-list-tile v-else active-class="sidebar-list-item-active" class="sidebar-list-item" :key="item.action"
                                         :to="{path: item.path, name: item.action, params: item.params}">
                                <v-list-tile-content class="pl-3">
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>

                        <hr v-if="!mini"/>

                        <template v-if="!mini" v-for="item in secondSection">
                            <v-list-group class="sidebar-list-item" v-if="item.subMenu" v-model="item.active" :key="item.title" no-action>
                                <v-list-tile slot="activator">
                                    <v-list-tile-content class="pl-3">
                                        <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                                <v-list-tile active-class="sidebar-list-item-active" v-for="subItem in item.subMenu" :key="subItem.action"
                                             :to="{name: subItem.action, params: item.params}">
                                    <v-list-tile-content>
                                        <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                                    </v-list-tile-content>
                                </v-list-tile>
                            </v-list-group>

                            <v-list-tile active-class="sidebar-list-item-active" class="sidebar-list-item" v-else :key="item.action"
                                         :to="{name: item.action, params: item.params}">
                                <v-list-tile-content class="pl-3">
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>

                        <v-list-tile class="sidebar-list-item sidebar-logo">
                            <v-list-tile-action class="sidebar-item-action sidebar-logo-img">
                                <img src="img/sidebar/logo_grey.svg" @click="mini = !mini" alt="">
                            </v-list-tile-action>

                            <v-list-tile-content class="sidebar-logo-content">
                                © 2018 Intelinvest
                            </v-list-tile-content>
                        </v-list-tile>

                    </v-list>
                </v-navigation-drawer>
                <div class="sidebar-dialog" :class="{open: !mini}" @click.stop="openDialog">
                    <v-icon>add</v-icon>
                </div>

                <v-content>
                    <v-container fluid>
                        <v-fade-transition mode="out-in">
                            <!--<keep-alive :include="cachedPages">-->
                            <router-view></router-view>
                            <!--</keep-alive>-->
                        </v-fade-transition>
                    </v-container>
                </v-content>
                <v-footer color="indigo" inset>
                    <span class="white--text" style="margin-left: 15px;">&copy; 2018</span>
                    <v-spacer></v-spacer>
                    <v-tooltip top>
                        <a slot="activator" class="white--text margR16 decorationNone" href="https://telegram.me/intelinvestSupportBot">
                            Telegram <i class="fab fa-telegram"></i>
                        </a>
                        <span>Оперативная связь с нами</span>
                    </v-tooltip>

                    <v-tooltip top>
                        <a slot="activator" class="white--text margR16" @click="openFeedBackDialog">Обратная связь <i class="fas fa-envelope"></i></a>
                        <span>Напишите нам по email</span>
                    </v-tooltip>
                </v-footer>
            </template>
        </v-app>`,
    components: {PortfolioSwitcher, ErrorHandler, FeedbackDialog}
})
export class AppFrame extends UI {

    @Inject
    private localStorage: Storage;
    @Inject
    private clientService: ClientService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;

    @MainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;

    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    private username: string = null;

    private password: string = null;

    /**
     * Переменная используется только для удобства локальной разработки при тестировании с отдельным приложением лэндинга
     * Ддля PRODUCTION режима используется внешняя аутентификация с лэндинга
     */
    private externalAuth = true;
    private loggedIn = false;

    /* Пользователь уведомлен об обновлениях */
    private isNotifyAccepted = false;

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ["PortfolioPage"];

    private drawer = true;

    private mini = true;
    private loading = false;

    private mainSection: NavBarItem[] = [
        {title: "Портфель", action: "portfolio", icon: "fas fa-briefcase"},
        {title: "Сделки", action: "trades", icon: "fas fa-list-alt"},
        {title: "События", action: "events", icon: "far fa-calendar-check"},
        {title: "Дивиденды", action: "dividends", icon: "far fa-calendar-plus"},
        {title: "Комбинированный портфель", action: "combined-portfolio", icon: "fas fa-object-group"},
        {title: "Котировки", action: "quotes", icon: "fas fa-chart-area"},
        {title: "Информация", path: "/share-info", icon: "fas fa-info"}
    ];

    private secondSection: NavBarItem[] = [
        {
            title: "Настройки", icon: "fas fa-cog", subMenu: [
                {title: "Управление портфелями", action: "portfolio-settings", icon: "fas fa-suitcase"},
                {title: "Импорт сделок", action: "import", icon: "fas fa-download"},
                {title: "Экспорт сделок", action: "export", icon: "fas fa-upload"},
                {title: "Тарифы", action: "tariffs", icon: "fas fa-credit-card"},
                {title: "Промо-коды", action: "promo-codes", icon: "fas fa-heart"},
                {title: "Уведомления", action: "notifications", icon: "fas fa-bell"}
            ]
        },
        {title: "Профиль", action: "profile", icon: "fas fa-user"},
        {title: "Справка", action: "help", icon: "far fa-question-circle"},
        {title: "Выход", action: "logout", icon: "exit_to_app"}
    ];

    async created(): Promise<void> {
        if (this.localStorage.get(StoreKeys.TOKEN_KEY, null)) {
            await this.startup();
        }
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isNotifyAccepted = UiStateHelper.lastUpdateNotification === NotificationUpdateDialog.DATE;
            this.loggedIn = true;
        }
    }

    @ShowProgress
    @CatchErrors
    private async startup(): Promise<void> {
        this.loading = true;
        try {
            const client = await this.clientService.getClientInfo();
            await this.loadUser({token: this.localStorage.get(StoreKeys.TOKEN_KEY, null), user: client});
            await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
        } catch (e) {
            this.$snotify.error("При авторизации пользователя", "Ошибка", {timeout: 0});
            throw e;
        } finally {
            this.loading = false;
        }
    }

    private async login(): Promise<void> {
        if (!this.username || !this.password) {
            this.$snotify.warning("Заполните поля");
            return;
        }
        try {
            const clientInfo = await this.clientService.login({username: this.username, password: this.password});
            await this.loadUser(clientInfo);
        } catch (e) {
            console.error("Ошибка при входе", e);
            this.$snotify.error("Ошибка при входе");
            return;
        }
        await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
        this.loggedIn = true;
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async openNotificationUpdateDialog(): Promise<void> {
        const dlgReturn = await new NotificationUpdateDialog().show();
        if (dlgReturn === BtnReturn.YES) {
            UiStateHelper.lastUpdateNotification = NotificationUpdateDialog.DATE;
            this.isNotifyAccepted = true;
        } else if (dlgReturn === BtnReturn.SHOW_FEEDBACK) {
            await new FeedbackDialog().show(this.clientInfo);
        }
    }

    private async openFeedBackDialog(): Promise<void> {
        await new FeedbackDialog().show(this.clientInfo);
    }
}

export type NavBarItem = {
    title: string,
    /** routing, для корневых элементов может не заполнен */
    action?: string,
    path?: string,
    icon: string,
    active?: boolean,
    subMenu?: NavBarItem[],
    params?: { [key: string]: string }
};
