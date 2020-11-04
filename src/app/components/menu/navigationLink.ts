import {Component, Prop, UI} from "../../app/ui";
import {NavBarItem} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <div :class="[iconMode ? 'iconMenu-btn' : '']">
            <template v-if="item.subMenu">
                <v-menu transition="slide-y-transition" bottom left class="submenu-item-list" content-class="submenu-v-menu" nudge-bottom="47">
                    <v-list-tile slot="activator" :class="[iconMode ? 'intel-icon icon-m-' + item.name : '', subMenuRouteSelected(item) ? 'active-link' : '']">
                        <i v-if="iconMode" class="exp-panel-arrow"></i>
                        <template v-else>
                            <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                            <v-list-tile-action>
                                <v-icon color="grey lighten-1">keyboard_arrow_down</v-icon>
                            </v-list-tile-action>
                        </template>
                    </v-list-tile>
                    <v-list-tile active-class="active-link" v-for="subItem in item.subMenu.filter(item => !item.active)" :key="subItem.action"
                                 :to="{path: subItem.path, name: subItem.action, params: subItem.params}">
                        <v-list-tile-content>
                            <v-list-tile-title>{{ subItem.title }}</v-list-tile-title>
                        </v-list-tile-content>
                    </v-list-tile>
                </v-menu>
            </template>
            <v-list-tile v-else :key="item.action" active-class="active-link" :to="{path: item.path, name: item.action, params: item.params}">
                <v-list-tile-content :class="[iconMode ? 'intel-icon icon-m-' + item.name : '']">
                    <v-list-tile-title>{{ item.title }}</v-list-tile-title>
                </v-list-tile-content>
            </v-list-tile>
        </div>
    `
})
export class NavigationLink extends UI {

    @Prop({type: Boolean, required: false, default: false})
    private iconMode: boolean;

    @Prop({required: true})
    private item: NavBarItem;

    private subMenuRouteSelected(item: NavBarItem): boolean {
        const path = this.$route.path;
        const subMenu = item.subMenu.map(menu => menu.action || menu.path);
        return subMenu.some(menu => path.includes(menu));
    }
}
