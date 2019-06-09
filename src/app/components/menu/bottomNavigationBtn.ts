import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {Portfolio} from "../../types/types";
import {PortfolioSwitcher} from "../portfolioSwitcher";

@Component({
    // language=Vue
    template: `
        <v-layout v-if="!publicZone" column>
            <v-layout class="mini-menu-width" align-center justify-end column>
                <div>
                    <v-btn flat round icon dark :to="{name: 'portfolio-management'}" title="Управление портфелями"
                            active-class="active-btn-link" class="link-icon-btn">
                        <span class="settings-icon"></span>
                    </v-btn>
                </div>
                <div class="mt-1 mb-3">
                    <v-btn flat icon dark :to="{name: 'profile'}" title="Профиль" active-class="active-btn-link" class="link-icon-btn">
                        <span class="profile-icon"></span>
                    </v-btn>
                </div>
            </v-layout>
        </v-layout>
    `,
    components: {PortfolioSwitcher}
})
export class BottomNavigationBtn extends UI {
    @Prop({required: true})
    private publicZone: boolean;
}