import {UI} from './UI';
import Component from 'vue-class-component';
import {MutationType} from '../vuex/mutationType';
import {ClientInfo, LoginRequest, Portfolio} from '../types/types';
import {namespace} from 'vuex-class/lib/bindings';
import {StoreType} from '../vuex/storeType';
import {PortfolioSwitcher} from "../components/portfolioSwitcher";

const mainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-app id="inspire">
            <template v-if="!isInitialized">
                <v-content>
                    <v-container fluid fill-height>
                        <v-layout align-center justify-center>
                            <v-flex xs12 sm8 md4>
                                <v-card class="elevation-12">
                                    <v-toolbar dark color="primary">
                                        <v-toolbar-title>Вход</v-toolbar-title>
                                        <v-spacer></v-spacer>
                                    </v-toolbar>
                                    <v-card-text>
                                        <v-form>
                                            <v-text-field prepend-icon="person" name="login" label="Имя пользователя" type="text" required
                                                          v-model="username"></v-text-field>
                                            <v-text-field id="password" prepend-icon="lock" name="password" label="Пароль" required type="password"
                                                          v-model="password"></v-text-field>
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
                    <v-btn flat color="pink" @click.native="closeMessage">Close</v-btn>
                </v-snackbar>
            </template>

            <template v-else>
                <v-navigation-drawer v-model="drawer" fixed app>
                    <v-toolbar flat>
                        <v-list>
                            <v-list-tile>
                                <v-list-tile-title class="title">
                                    Меню
                                </v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-toolbar>
                    <v-divider></v-divider>
                    <v-list dense class="pt-0">
                        <v-list-tile v-for="item in items" :key="item.title" @click="go(item.name)">
                            <v-list-tile-action>
                                <v-icon>{{ item.icon }}</v-icon>
                            </v-list-tile-action>
                            <v-list-tile-content>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </v-list>
                </v-navigation-drawer>

                <v-toolbar color="indigo" dark fixed app>
                    <v-toolbar-side-icon @click.stop="drawer = !drawer"></v-toolbar-side-icon>
                    <v-toolbar-title>INTELINVEST</v-toolbar-title>
                    <v-spacer></v-spacer>
                    <portfolio-switcher></portfolio-switcher>
                    <add-trade-dialog>
                        <slot name="activator">
                            <v-btn icon>
                                <v-icon>plus</v-icon>
                            </v-btn>
                        </slot>
                    </add-trade-dialog>
                    <v-btn icon @click="logout">
                        <v-icon>exit_to_app</v-icon>
                    </v-btn>
                </v-toolbar>

                <v-content>
                    <v-container fluid fill-height>
                        <!--<keep-alive :include="cachedPages">-->
                        <router-view></router-view>
                        <!--</keep-alive>-->
                    </v-container>
                </v-content>
                <v-footer color="indigo" app inset>
                    <span class="white--text">&copy; 2018</span>
                </v-footer>
            </template>
        </v-app>
    `,
    components: {PortfolioSwitcher}
})
export class AppFrame extends UI {

    @mainStore.Action(MutationType.SET_CLIENT_INFO)
    private loadUser: (request: LoginRequest) => Promise<ClientInfo>;

    @mainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    private username: string = null;

    private password: string = null;

    private showMessage = false;

    private message = '';

    private severity = 'info';

    private isInitialized = false;

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ['PortfolioPage'];

    private drawer: boolean = false;

    private items: NavBarItem[] = [
        {title: 'Портфель', name: 'portfolio', icon: 'fas fa-briefcase'},
        {title: 'Сделки', name: 'trades', icon: 'fas fa-list-alt'},
        {title: 'Комбинированный портфель', name: 'combined-portfolio', icon: 'fas fa-object-group'},
        {title: 'Настройки', name: 'settings', icon: 'fas fa-cog'}
    ];

    private go(path: string): void {
        this.$router.push({name: `${path.toLowerCase()}`});
    }

    private async created(): Promise<void> {
        // если удалось восстановить state, значит все уже загружено
        if (this.$store.state[StoreType.MAIN].clientInfo) {
            this.isInitialized = true;
        }
        console.log('created APP FRAME', this.isInitialized);
    }

    private async login(): Promise<void> {
        if (!this.username || !this.password) {
            this.message = 'Заполните поля';
            this.severity = 'error';
            return;
        }
        console.log('LOGIN');
        try {
            await this.loadUser({username: this.username, password: this.password});
        } catch (e) {
            console.log('Ошибка при входе', e);
            return;
        }
        await this.setCurrentPortfolio(this.$store.state[StoreType.MAIN].clientInfo.user.currentPortfolioId);
        this.isInitialized = true;
    }

    private logout(): void {
        console.log('logout');
        this.$router.push({name: 'logout'})
    }

    private closeMessage(): void {
        this.showMessage = false;
        this.message = '';
        this.severity = 'info';
    }
}

export type NavBarItem = {
    title: string,
    name: string,
    icon: string
}
