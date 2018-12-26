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
import {UiStateHelper} from "../utils/uiStateHelper";
import {StoreType} from "../vuex/storeType";
import {UI} from "./ui";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <vue-snotify></vue-snotify>
            <error-handler></error-handler>

            <v-navigation-drawer v-model="drawer" clipped app>
                <v-divider></v-divider>
                <v-list dense>
                    <template v-for="item in mainSection">
                        <v-list-group v-if="item.subMenu" v-model="item.active" :key="item.title" :prepend-icon="item.icon" no-action>
                            <v-list-tile slot="activator">
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                            <v-list-tile v-for="subItem in item.subMenu" :key="subItem.action" :to="{name: subItem.action, params: item.params}">
                                <v-list-tile-action>
                                    <v-icon small>{{ subItem.icon }}</v-icon>
                                </v-list-tile-action>
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-list-group>

                        <v-list-tile v-else :key="item.action" :to="{name: item.action, params: item.params}">
                            <v-list-tile-action>
                                <v-icon small>{{ item.icon }}</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                </v-list>
            </v-navigation-drawer>

            <v-toolbar color="indigo" dark app clipped-left>
                <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
                <v-toolbar-title>INTELINVEST</v-toolbar-title>
                <v-spacer></v-spacer>
                <portfolio-switcher></portfolio-switcher>
                <v-btn icon v-if="!isNotifyAccepted"
                       @click.native.stop="openNotificationUpdateDialog">
                    <v-icon class="faa-vertical animated">whatshot</v-icon>
                </v-btn>
                <v-btn icon @click.native.stop="openDialog">
                    <v-icon>add_circle_outline</v-icon>
                </v-btn>
                <v-btn icon @click="logout">
                    <v-icon>exit_to_app</v-icon>
                </v-btn>
            </v-toolbar>

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
        </v-app>`,
    components: {PortfolioSwitcher, ErrorHandler, FeedbackDialog}
})
export class AppFrame extends UI {

    @Inject
    private clientService: ClientService;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    /* Пользователь уведомлен об обновлениях */
    private isNotifyAccepted = false;

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ["PortfolioPage"];

    private drawer = false;

    private mainSection: NavBarItem[] = [
        {title: "Портфель", action: "portfolio", icon: "fas fa-briefcase"},
        {title: "Сделки", action: "trades", icon: "fas fa-list-alt"},
        {title: "События", action: "events", icon: "far fa-calendar-check"},
        {title: "Дивиденды", action: "dividends", icon: "far fa-calendar-plus"},
        {title: "Комбинированный портфель", action: "combined-portfolio", icon: "fas fa-object-group"},
        {title: "Котировки", action: "quotes", icon: "fas fa-chart-area"},
        {title: "Информация", action: "share-info", params: {ticker: "GAZP"}, icon: "fas fa-info"},
        {
            title: "Настройки", icon: "fas fa-cog", subMenu: [
                {title: "Управление портфелями", action: "portfolio-settings", icon: "fas fa-suitcase"},
                {title: "Импорт сделок", action: "import", icon: "fas fa-download"},
                {title: "Экспорт сделок", action: "export", icon: "fas fa-upload"},
                {title: "Профиль", action: "profile", icon: "fas fa-user"},
                {title: "Тарифы", action: "tariffs", icon: "fas fa-credit-card"},
                {title: "Промо-коды", action: "promo-codes", icon: "fas fa-heart"},
                {title: "Уведомления", action: "notifications", icon: "fas fa-bell"}
            ]
        },
        {title: "Справка", action: "help", icon: "far fa-question-circle"},
    ];

    async created(): Promise<void> {
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isNotifyAccepted = UiStateHelper.lastUpdateNotification === NotificationUpdateDialog.DATE;
        }
    }

    private logout(): void {
        this.$router.push({name: "logout"});
    }

    private async openDialog(): Promise<void> {
        await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
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
