import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {PortfolioEditDialog} from "../../components/dialogs/portfolioEditDialog";
import {PortfoliosTable} from "../../components/portfoliosTable";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {StoreType} from "../../vuex/storeType";

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
    @Inject
    private portfolioService: PortfolioService;
    private portfolios: PortfolioParams[] = null;

    created(): void {
        UI.on(EventType.PORTFOLIO_CREATED, async () => this.refreshPortfolios());
    }

    async mounted(): Promise<void> {
        this.portfolios = this.clientInfo.user.portfolios;
    }

    async refreshPortfolios(): Promise<void> {
        console.log("UPD");
    }

    private async openDialog(): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
    }
}
