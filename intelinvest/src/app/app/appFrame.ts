import {Component, UI} from "@intelinvest/platform/src/app/ui";

@Component({
    // language=Vue
    template: `
        <v-app id="inspire">
            <v-main>
                <v-container fluid>
                    <v-slide-y-transition mode="out-in">
                        <!--<keep-alive :include="cachedPages">-->
                        <router-view></router-view>
                        <!--</keep-alive>-->
                    </v-slide-y-transition>
                </v-container>
            </v-main>
        </v-app>`
})
export class AppFrame extends UI {
}
