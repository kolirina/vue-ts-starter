import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {StoreType} from "../../vuex/storeType";

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

    async mounted(): Promise<void> {

    }
}
