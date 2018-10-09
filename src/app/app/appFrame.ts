import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {PortfolioSwitcher} from "../components/portfolioSwitcher";
import {ClientService} from "../services/clientService";
import {ClientInfo, Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {UI} from "./ui";

const mainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
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
                <v-navigation-drawer v-model="drawer" fixed clipped app>
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
                <v-footer color="indigo" app inset>
                    <span class="white--text" style="margin-left: 15px;">&copy; 2018</span>
                </v-footer>
            </template>
        </v-app>
    `,
    components: {PortfolioSwitcher}
})
export class AppFrame extends UI {

    @Inject
    private clientService: ClientService;

    @mainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (clientInfo: ClientInfo) => Promise<void>;

    @mainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    private username: string = null;

    private password: string = null;

    private showMessage = false;

    private message = "";

    private severity = "info";

    private isInitialized = false;

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
        {title: "Комбинированный портфель", action: "combined-portfolio", icon: "fas fa-object-group"},
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
        }
    ];

    async created(): Promise<void> {
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isInitialized = true;
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
        await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
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
