import Component from "vue-class-component";
import {UI} from "../app/UI";
import {ClientInfo, PortfolioParams} from "../types/types";
import {PortfoliosTable} from "../components/portfoliosTable";
import {StoreType} from "../vuex/storeType";
import {namespace} from "vuex-class/lib/bindings";
import {PortfolioEditDialog} from "../components/dialogs/portfolioEditDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolios" fluid>
            <v-btn @click.stop="openDialog" color="primary" dark>
                <v-icon>add_circle_outline</v-icon>
                Добавить портфель
            </v-btn>
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

    private async openDialog(): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
    }
}
