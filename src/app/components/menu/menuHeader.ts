import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {Portfolio} from "../../types/types";
import {PortfolioSwitcher} from "../portfolioSwitcher";

@Component({
    // language=Vue
    template: `
        <v-layout :class="['pt-3', 'overflow-hidden', sideBarOpened && !isMobile ? 'column' : '']" align-center>
            <v-layout class="mini-menu-width sidebar-item-action" justify-center>
                <v-btn @click="togglePanel" v-if="sideBarOpened" flat icon dark>
                    <span class="hamburger-icon"></span>
                </v-btn>
                <span v-else class="sidebar-icon sidebar-logo"></span>
            </v-layout>
            <portfolio-switcher v-if="clientInfo && portfolio" :side-bar-opened="sideBarOpened" :is-mobile="isMobile"></portfolio-switcher>
            <v-layout v-if="isMobile" justify-end class="w100pc">
                <v-btn @click="togglePanel" v-if="!sideBarOpened && isMobile" flat icon dark class="mobile-menu-close-btn">
                    <v-icon>close</v-icon>
                </v-btn>
            </v-layout>
        </v-layout>
    `,
    components: {PortfolioSwitcher}
})
export class MenuHeader extends UI {

    @Prop({type: Boolean, required: true})
    private sideBarOpened: boolean;

    @Prop({type: Boolean, required: false, default: false})
    private isMobile: boolean;

    @Prop({required: true})
    private portfolio: Portfolio;

    @Prop({required: true})
    private clientInfo: ClientInfo;

    private togglePanel(): void {
        this.$emit("togglePanel");
    }
}
