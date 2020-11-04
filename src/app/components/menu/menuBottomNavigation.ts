import {Component, namespace, Prop, UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-layout class="mini-menu-width iconMenu margB16" justify-end>
            <!--v-list-tile class="iconMenu-btn" active-class="active-link" :to="{name: 'notification'}" title="Уведомления">
                <v-list-tile-content class="intel-icon icon-m-notification"></v-list-tile-content>
            </v-list-tile-->
            <v-list-tile class="iconMenu-btn" active-class="active-link" :to="{name: 'portfolio-management'}" title="Управление портфелями">
                <v-list-tile-content class="intel-icon icon-m-portfolio-management"></v-list-tile-content>
            </v-list-tile>
            <v-list-tile class="iconMenu-btn" active-class="active-link" :to="{name: 'profile'}" title="Профиль">
                <v-list-tile-content class="intel-icon icon-m-profile"></v-list-tile-content>
            </v-list-tile>
            <v-list-tile class="iconMenu-btn" active-class="active-link" :to="{name: 'logout'}" title="Выход">
                <v-list-tile-content class="intel-icon icon-m-logout"></v-list-tile-content>
            </v-list-tile>
        </v-layout>
    `
})
export class MenuBottomNavigation extends UI {

    @Prop({type: Boolean, default: false})
    private sideBarOpened: boolean;
}
