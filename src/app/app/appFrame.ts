import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {BtnReturn} from "../components/dialogs/customDialog";
import {FeedbackDialog} from "../components/dialogs/feedbackDialog";
import {NotificationUpdateDialog} from "../components/dialogs/notificationUpdateDialog";
import {ErrorHandler} from "../components/errorHandler";
import {PortfolioSwitcher} from "../components/portfolioSwitcher";
import {ClientInfo, ClientService} from "../services/clientService";
import {Portfolio} from "../types/types";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {UI} from "./ui";
import { min } from "moment";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <vue-snotify></vue-snotify>
            <error-handler></error-handler>
            <template v-if="!isInitialized">
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

                <v-snackbar :timeout="5000" :top="true" :right="true" v-model="showMessage" :color="severity">
                    {{ message }}
                    <v-btn flat color="white" @click.native="closeMessage">X</v-btn>
                </v-snackbar>
            </template>

            <template v-else>
                <v-navigation-drawer disable-resize-watcher fixed stateless class="sidebar" v-model="drawer" :mini-variant.sync="mini" app>
                    <v-divider></v-divider>
                    <v-list dense class="sidebar-list">
                        <v-list-tile class="sidebar-list-item">
                            <v-list-tile-action class="sidebar-item-action">
                                <img src="img/sidebar/hamb.svg" class="hamburger" @click="mini = !mini" alt="">
                            </v-list-tile-action>
                        </v-list-tile>

                        <portfolio-switcher></portfolio-switcher>

                        <hr />

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

                            <v-list-tile active-class="sidebar-list-item-active" class="sidebar-list-item" v-else :key="item.action" :to="{name: item.action, params: item.params}">
                                <v-list-tile-content class="pl-3">
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </template>

                        <hr v-if="!mini" />

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

                            <v-list-tile active-class="sidebar-list-item-active" class="sidebar-list-item" v-else :key="item.action" :to="{name: item.action, params: item.params}">
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

                        <div class="sidebar-dialog" :class="{open: !mini}" @click="openDialog">
                            <v-icon>add</v-icon>
                        </div>
                    </v-list>
                </v-navigation-drawer>

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
    private clientService: ClientService;

    @MainStore.Getter
    private clientInfo: ClientInfo;

    @MainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;

    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    private username: string = null;

    private password: string = null;

    private showMessage = false;

    private message = "";

    private severity = "info";

    private isInitialized = false;

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

    private mainSection: NavBarItem[] = [
        {title: "Портфель", action: "portfolio", icon: "fas fa-briefcase"},
        {title: "Сделки", action: "trades", icon: "fas fa-list-alt"},
        {title: "События", action: "events", icon: "far fa-calendar-check"},
        {title: "Дивиденды", action: "dividends", icon: "far fa-calendar-plus"},
        {title: "Комбинированный портфель", action: "combined-portfolio", icon: "fas fa-object-group"},
        {title: "Котировки", action: "quotes", icon: "fas fa-chart-area"},
        {title: "Информация", action: "share-info", params: {ticker: "GAZP"}, icon: "fas fa-info"}
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
        {title: "Профиль", action: "profile", icon: "fas fa-user"}
    ];

    async created(): Promise<void> {
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isInitialized = true;
            this.isNotifyAccepted = UiStateHelper.lastUpdateNotification === NotificationUpdateDialog.DATE;
        }
    }

    private async login(): Promise<void> {
        if (!this.username || !this.password) {
            this.showMessage = true;
            this.message = "Заполните поля";
            this.severity = "error";
            return;
        }
        console.log("LOGIN");
        try {
            const clientInfo = await this.clientService.getClientInfo({username: this.username, password: this.password});
            await this.loadUser(clientInfo);
        } catch (e) {
            console.log("Ошибка при входе", e);
            this.showMessage = true;
            this.message = "Ошибка при входе";
            this.severity = "error";
            return;
        }
        await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
        this.isInitialized = true;
    }

    private logout(): void {
        this.$router.push({name: "logout"});
    }

    private closeMessage(): void {
        this.showMessage = false;
        this.message = "";
        this.severity = "info";
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
        if (result) {
            await this.reloadPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
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
    icon: string,
    active?: boolean,
    subMenu?: NavBarItem[],
    params?: { [key: string]: string }
};
