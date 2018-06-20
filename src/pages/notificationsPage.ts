import Component from "vue-class-component";
import {UI} from "../app/UI";
import {ClientInfo} from "../types/types";
import {StoreType} from "../vuex/storeType";
import {namespace} from "vuex-class/lib/bindings";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Уведомления
        </v-container>
    `
})
export class NotificationsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private async mounted(): Promise<void> {

    }
}
