import {UI} from "./UI";
import Component from "vue-class-component";
import {PortfolioSwitcher} from "../components/portfolioSwitcher";

@Component({
    // language=Vue
    template: `
        <v-app id="inspire">
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
            </v-toolbar>
            <v-content>
                <v-container fluid fill-height>
                    <keep-alive :include="cachedPages">
                        <router-view></router-view>
                    </keep-alive>
                </v-container>
            </v-content>
            <v-footer color="indigo" app inset>
                <span class="white--text">&copy; 2018</span>
            </v-footer>
        </v-app>
    `,
    components: {PortfolioSwitcher}
})
export class AppFrame extends UI {

    /**
     * Названия кэшируемых компонентов (страниц). В качестве названия необходимо указывать либо имя файла компонента (это его name)
     * или название компонента если он зарегистрирован в uiRegistry через UI.component.
     * Необходимые действия выполняются в хуках activated и deactivated кешируемого компонента.
     * @type {string[]}
     */
    private cachedPages = ["PortfolioPage"];

    private drawer: boolean = false;

    private items: NavBarItem[] = [
        {title: 'Портфель', name: 'portfolio', icon: 'fas fa-briefcase'},
        {title: 'Сделки', name: 'trades', icon: 'fas fa-list-alt'},
        {title: 'Настройки', name: 'settings', icon: 'fas fa-cog'}
    ];

    private go(path: string): void {
        this.$router.push({name: `${path.toLowerCase()}`});
    }
}

export type NavBarItem = {
    title: string,
    name: string,
    icon: string
}