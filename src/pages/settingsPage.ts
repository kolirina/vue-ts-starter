import Component from "vue-class-component";
import {UI} from "../app/UI";
import {PortfolioRow} from "../types/types";
import {Container} from "typescript-ioc";
import {ClientService} from "../services/ClientService";
import {PortfoliosTable} from "../components/portfoliosTable";

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

    private clientService = (<ClientService> Container.get(ClientService));

    private portfolios: PortfolioRow[] = null;

    private async mounted(): Promise<void> {
        this.portfolios = await this.clientService.getClientInfo().client.portfolios;
    }
}
