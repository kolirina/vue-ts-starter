import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {Portfolio} from "../../types/types";
import {PortfolioSwitcher} from "../portfolioSwitcher";

@Component({
    // language=Vue
    template: `
        <v-layout :class="['pt-3', 'overflow-hidden', mini && !isMobile ? 'column' : '']" align-center>
            <v-layout class="mini-menu-width sidebar-item-action" justify-center>
                <v-btn @click="togglePanel" v-if="mini" flat icon dark class="small-screen-hide-toogle-menu-btn">
                    <span class="hamburger-icon"></span>
                </v-btn>
                <span v-else class="sidebar-icon sidebar-logo small-screen-hide-toogle-menu-btn"></span>
                <v-btn @click="togglePanel" flat icon dark class="small-screen-show-toogle-menu-btn">
                    <span class="hamburger-icon"></span>
                </v-btn>
            </v-layout>
            <portfolio-switcher v-if="clientInfo && portfolio" :mini="mini" :isMobile="isMobile"></portfolio-switcher>
        </v-layout>
    `,
    components: {PortfolioSwitcher}
})
export class BtnPortfolioSwitch extends UI {

    @Prop({type: Boolean, required: true})
    private mini: boolean;

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