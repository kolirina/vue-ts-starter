import {Component, UI} from "./ui";

@Component({
    // language=Vue
    template: `
        <v-app id="inspire" light>
            <template>
                <v-content>
                    <v-container fluid :class="['paddT0', 'fb-0']">
                        <v-slide-y-transition mode="out-in">
                            <router-view></router-view>
                        </v-slide-y-transition>
                    </v-container>
                </v-content>
            </template>
        </v-app>`
})
export class AppFrame extends UI {

    async created(): Promise<void> {
    }
}
