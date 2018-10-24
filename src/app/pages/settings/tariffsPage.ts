import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {ClientInfo} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            Тарифы
        </v-container>
    `
})
export class TariffsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    async mounted(): Promise<void> {

    }
}
