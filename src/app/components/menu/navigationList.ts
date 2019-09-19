import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {NavBarItem} from "../../types/types";
import {PortfolioSwitcher} from "../portfolioSwitcher";

@Component({
    // language=Vue
    template: `
        <v-layout class="overflow-hidden">
            <v-layout column justify-space-between align-center class="mini-menu-width">
                <div>
                    <v-btn @click.stop="openDialog" fab dark small color="indigo" depressed class="add-btn-menu">
                        <v-icon dark>add</v-icon>
                    </v-btn>
                </div>
            </v-layout>
            <v-layout v-if="!sideBarOpened" column class="wrap-list-menu">
                <div v-for="item in mainSection">
                    <template v-if="item.action === 'adviser'">
                        <v-list-tile :key="item.action" active-class="active-link"
                                     :to="{path: item.path, name: item.action, params: item.params}">
                            <v-list-tile-content v-if="item.action === linkAdditionalFunctionality.EVENTS && numberOfEvents" class="badge-link">
                                <v-badge color="primary">
                                    <template #badge>
                                        <span title="У вас есть новые события по портфелю!">{{ numberOfEvents >= 100 ? "99+" : numberOfEvents }}</span>
                                    </template>
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-badge>
                            </v-list-tile-content>
                            <v-list-tile-content v-else>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                    <template v-else-if="item.action === 'help'">
                        <v-list-tile :key="item.action" active-class="active-link"
                                     :to="{path: item.path, name: item.action, params: item.params}">
                            <v-list-tile-content v-if="item.action === linkAdditionalFunctionality.EVENTS && numberOfEvents" class="badge-link">
                                <v-badge color="primary">
                                    <template #badge>
                                        <span title="У вас есть новые события по портфелю!">{{ numberOfEvents >= 100 ? "99+" : numberOfEvents }}</span>
                                    </template>
                                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                </v-badge>
                            </v-list-tile-content>
                            <v-list-tile-content v-else>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-list-tile-content>
                        </v-list-tile>
                    </template>
                    <template v-else-if="item.subMenu">
                        <v-menu transition="slide-y-transition" bottom left class="submenu-item-list" content-class="submenu-v-menu" nudge-bottom="47">
                            <v-list-tile slot="activator" :class="{'active-link': settingsSelected}">
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                                <v-list-tile-action>
                                    <v-icon color="grey lighten-1">keyboard_arrow_down</v-icon>
                                </v-list-tile-action>
                            </v-list-tile>
                            <v-list-tile active-class="active-link" v-for="subItem in item.subMenu" :key="subItem.action"
                                         :to="{name: subItem.action, params: item.params}">
                                <v-list-tile-content>
                                    <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                                </v-list-tile-content>
                            </v-list-tile>
                        </v-menu>
                    </template>
                    <v-list-tile v-else :key="item.action" active-class="active-link"
                                 :to="{path: item.path, name: item.action, params: item.params}">
                        <v-list-tile-content v-if="item.action === linkAdditionalFunctionality.EVENTS && numberOfEvents" class="badge-link">
                            <v-badge color="primary">
                                <template #badge>
                                    <span title="У вас есть новые события по портфелю!">{{ numberOfEvents >= 100 ? "99+" : numberOfEvents }}</span>
                                </template>
                                <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            </v-badge>
                        </v-list-tile-content>
                        <v-list-tile-content v-else>
                            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </div>
            </v-layout>
        </v-layout>
    `,
    components: {PortfolioSwitcher}
})
export class NavigationList extends UI {

    @Prop({type: Boolean, required: true})
    private sideBarOpened: boolean;

    @Prop({type: Boolean, required: true})
    private settingsSelected: boolean;

    @Prop({required: true})
    private mainSection: NavBarItem[];

    @Prop({type: Number})
    private numberOfEvents: number;

    /** Список ссылок с доп. функционалом */
    private linkAdditionalFunctionality = LinkAdditionalFunctionality;

    private openDialog(): void {
        this.$emit("openDialog");
    }
}
export enum LinkAdditionalFunctionality {
    EVENTS = "events"
}
