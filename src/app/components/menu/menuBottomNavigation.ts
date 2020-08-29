import {Component, namespace, Prop, UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-layout class="mini-menu-width" align-center justify-end column>
            <div>
                <v-btn flat round icon dark :to="{name: 'portfolio-management'}" title="Управление портфелями" active-class="active-btn-link" class="link-icon-btn">
                    <span class="settings-icon"></span>
                </v-btn>
            </div>
            <div class="mt-1">
                <v-btn flat icon dark :to="{name: 'profile'}" title="Профиль" active-class="active-btn-link" class="link-icon-btn">
                    <span class="profile-icon"></span>
                </v-btn>
            </div>
            <div class="mt-1 mb-3">
                <v-btn flat icon dark :to="{name: 'logout'}" title="Выход" active-class="active-btn-link" class="link-icon-btn">
                    <span class="logout-icon"></span>
                </v-btn>
            </div>
        </v-layout>
    `
})
export class MenuBottomNavigation extends UI {

    @Prop({type: Boolean, default: false})
    private sideBarOpened: boolean;
}
