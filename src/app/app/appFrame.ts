import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {ContentLoader} from "vue-content-loader";
import {SnotifyToast} from "vue-snotify";
import {namespace} from "vuex-class/lib/bindings";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {FeedbackDialog} from "../components/dialogs/feedbackDialog";
import {NotificationUpdateDialog} from "../components/dialogs/notificationUpdateDialog";
import {ErrorHandler} from "../components/errorHandler";
import {FooterContent} from "../components/footerContent";
import {MenuBottomNavigation} from "../components/menu/menuBottomNavigation";
import {MenuHeader} from "../components/menu/menuHeader";
import {NavigationList} from "../components/menu/navigationList";
import {SignIn} from "../components/signIn";
import {TariffExpiredHint} from "../components/tariffExpiredHint";
import {Tours, TourStep} from "../components/tours/tours";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {Storage} from "../platform/services/storage";
import {ClientInfo, ClientService} from "../services/clientService";
import {StoreKeys} from "../types/storeKeys";
import {NavBarItem, Portfolio, SignInData} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {DateUtils} from "../utils/dateUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {UI} from "./ui";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <tariff-expired-hint></tariff-expired-hint>
            <vue-snotify></vue-snotify>
            <error-handler></error-handler>
            <template v-if="!loading && !loggedIn">
                <sign-in @login="login" @registration="checkAuthorized"></sign-in>
            </template>

            <template v-if="!loading && loggedIn">
                <v-navigation-drawer disable-resize-watcher fixed stateless app class="sidebar" v-model="drawer" :mini-variant="sideBarOpened" width="320">
                    <div>
                        <menu-header :side-bar-opened="sideBarOpened" :portfolio="portfolio" :clientInfo="clientInfo" @togglePanel="togglePanel"></menu-header>
                        <div v-if="!sideBarOpened" :class="['wrap-toogle-menu-btn', 'small-screen-hide-toogle-menu-btn']">
                            <v-btn @click="togglePanel" fab dark small depressed color="#F0F3F8" class="toogle-menu-btn">
                                <v-icon dark>keyboard_arrow_left</v-icon>
                            </v-btn>
                        </div>
                        <navigation-list :mainSection="mainSection" :side-bar-opened="sideBarOpened" :settingsSelected="settingsSelected"
                                         @openDialog="openDialog" :number-of-events="eventsCount"></navigation-list>
                    </div>
                    <menu-bottom-navigation></menu-bottom-navigation>
                </v-navigation-drawer>
                <v-content>
                    <div class="mobile-wrapper-menu">
                        <menu-header :side-bar-opened="sideBarOpened" :isMobile="true" :portfolio="portfolio" :clientInfo="clientInfo" @togglePanel="togglePanel"></menu-header>
                        <navigation-list :mainSection="mainSection" :sideBarOpened="sideBarOpened" :settingsSelected="settingsSelected"
                                         @openDialog="openDialog" :class="sideBarOpened ? 'part-mobile-menu' : ''"></navigation-list>
                        <menu-bottom-navigation :class="sideBarOpened ? 'part-mobile-menu' : ''"></menu-bottom-navigation>
                    </div>
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
                    <v-tour name="intro" :steps="tourSteps">
                        <template slot-scope="tour">
                            <transition name="fade">
                                <v-step
                                    v-if="tour.currentStep === index"
                                    v-for="(step, index) of tour.steps"
                                    :key="index"
                                    :step="step"
                                    :previous-step="tour.previousStep"
                                    :next-step="tour.nextStep"
                                    :stop="tour.stop"
                                    :is-first="tour.isFirst"
                                    :is-last="tour.isLast"
                                    :labels="tour.labels"
                                >
                                    <template>
                                        <div slot="actions">
                                            <!-- <button @click="tour.previousStep" class="btn btn-primary">Previous step</button>
                                            <button @click="myCustomNextStep" class="btn btn-primary">Next step</button> -->
                                        </div>
                                    </template>
                                </v-step>
                            </transition>
                        </template>
                    </v-tour>
                </v-content>
            </template>

            <template v-if="loading">
                <v-content>
                    <div class="mobile-wrapper-menu">

                    </div>
                    <v-container fluid :class="['paddT0', 'fb-0', sideBarOpened ? '' : 'hide-main-content']">
                        <content-loader :height="800" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
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
    components: {ContentLoader, ErrorHandler, FeedbackDialog, SignIn, FooterContent, MenuHeader, NavigationList, MenuBottomNavigation, TariffExpiredHint}
})
export class AppFrame extends UI {

    /** Дата новой версии */
    private readonly NEW_USERS_DATE = DateUtils.parseDate("2019-05-02");

    @Inject
    private localStorage: Storage;
    @Inject
    private clientService: ClientService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @MainStore.Getter
    private eventsCount: number;

    @MainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;

    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;

    @MainStore.Mutation(MutationType.CHANGE_SIDEBAR_STATE)
    private changeSideBarState: (sideBarState: boolean) => void;

    /** Признак залогиненного пользователя */
    private loggedIn = false;

    /* Пользователь уведомлен об обновлениях */
    private isNotifyAccepted = false;

    private tourSteps: TourStep[] = Tours.INTRO_STEPS;

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ["PortfolioPage"];

    private drawer = true;
    private loading = false;

    private mainSection: NavBarItem[] = [
        {title: "Портфель", action: "portfolio", icon: "fas fa-briefcase"},
        {title: "Аналитика", action: "adviser"},
        {title: "Сделки", action: "trades", icon: "fas fa-list-alt"},
        {title: "События", action: "events", icon: "far fa-calendar-check"},
        {title: "Дивиденды", action: "dividends", icon: "far fa-calendar-plus"},
        {title: "Составной портфель", action: "combined-portfolio", icon: "fas fa-object-group"},
        {title: "Котировки", action: "quotes", icon: "fas fa-chart-area"},
        {title: "Информация", path: "/share-info", icon: "fas fa-info"},
        {
            title: "Настройки", icon: "fas fa-cog", action: "settings", subMenu: [
                {title: "Управление портфелями", action: "portfolio-management", icon: "fas fa-suitcase"},
                {title: "Импорт сделок", action: "import", icon: "fas fa-download"},
                {title: "Экспорт сделок", action: "export", icon: "fas fa-upload"},
                {title: "Тарифы", action: "tariffs", icon: "fas fa-credit-card"},
                {title: "Партнерская программа", action: "promo-codes", icon: "fas fa-heart"},
                {title: "Уведомления", action: "notifications", icon: "fas fa-bell"}
            ]
        },
        {title: "Справка", action: "help", icon: "far fa-question-circle"},
        {title: "Выход", action: "logout", icon: "exit_to_app"}
    ];

    @ShowProgress
    async created(): Promise<void> {
        this.changeSideBarState(this.localStorage.get(StoreKeys.MENU_STATE_KEY, true));
        await this.checkAuthorized();
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isNotifyAccepted = UiStateHelper.lastUpdateNotification === NotificationUpdateDialog.DATE;
            this.showUpdatesMessage();
            this.loggedIn = true;
            if (this.portfolio && this.portfolio.overview.totalTradesCount === 0 && (this.$route.name === "portfolio" || this.$route.name === "trades")) {
                this.$tours["intro"].start();
            }
        }
    }

    private myCustomNextStep(): void {
        // @ts-ignore
        this.$router.push("/settings/import");
        if (this.$tours['intro'].currentStep === 1) {
            this.$tours['intro'].nextStep();
        }
    }

    private async checkAuthorized(registration?: boolean): Promise<void> {
        const authorized = !!this.localStorage.get(StoreKeys.TOKEN_KEY, null);
        // если есть токен юзера в локал стор и стор пуст и это не публичная зона то пробуем загрузить инфу о клиенте
        if (authorized && !CommonUtils.exists(this.$store.state[StoreType.MAIN].clientInfo)) {
            await this.startup();
        }
        if (registration) {
            this.$router.push("/portfolio");
        }
    }

    private async startup(): Promise<void> {
        this.loading = true;
        try {
            const client = await this.clientService.getClientInfo();
            await this.loadUser({token: this.localStorage.get(StoreKeys.TOKEN_KEY, null), user: client});
            await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
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
            await this.loadUser(clientInfo);
            await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
            this.loggedIn = true;
            this.$snotify.clear();
            this.$router.push("portfolio");
        } finally {
            this.loading = false;
        }
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    /**
     * Отображает уведомление об обновлениях
     * Только для приватной зоны
     */
    private showUpdatesMessage(): void {
        if (!this.isNotifyAccepted) {
            this.$snotify.info("Мы улучшили сервис для Вас, ознакомьтесь с обновлениями", {
                closeOnClick: false,
                timeout: 0,
                buttons: [{
                    text: "Подробнее", action: async (toast: SnotifyToast): Promise<void> => {
                        this.$snotify.remove(toast.id);
                        await this.openNotificationUpdateDialog();
                    }
                }]
            });
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

    private togglePanel(): void {
        this.changeSideBarState(!this.sideBarOpened);
        this.localStorage.set(StoreKeys.MENU_STATE_KEY, !this.sideBarOpened);
    }

    private get settingsSelected(): boolean {
        return this.$route.path.indexOf("settings") !== -1;
    }
}
