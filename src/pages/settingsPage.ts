import Component from "vue-class-component";
import {UI} from "../app/UI";
import {ClientInfo, PortfolioParams} from "../types/types";
import {PortfoliosTable} from "../components/portfoliosTable";
import {StoreType} from "../vuex/storeType";
import {namespace} from "vuex-class/lib/bindings";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolios" fluid>
            <portfolios-table :portfolios="portfolios"></portfolios-table>
        </v-container>
    `,
    components: {PortfoliosTable}
})
export class SettingsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;

    private portfolios: PortfolioParams[] = null;

    private async mounted(): Promise<void> {
        this.portfolios = this.clientInfo.user.portfolios;
    }
}
