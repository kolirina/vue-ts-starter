import {UI} from "../app/UI";
import Component from "vue-class-component";
import {ClientInfo, Portfolio, PortfolioRow} from "../types/types";
import {ClientService} from "../services/ClientService";
import {Container} from "typescript-ioc";
import {StoreType} from "../vuex/storeType";
import {MutationType} from "../vuex/mutationType";
import {Action, Getter, namespace, State} from "vuex-class/lib/bindings";
import {PortfolioService} from "../services/PortfolioService";

const MainState = namespace(StoreType.MAIN, State);
const MainAction = namespace(StoreType.MAIN, Action);

@Component({
    // language=Vue
    template: `
        <div v-if="portfolios" class="text-xs-center">
            <v-menu offset-y>
                <v-btn slot="activator" color="primary" dark>{{ getPortfolioName(selected) }}</v-btn>
                <v-list>
                    <v-list-tile v-for="(portfolio, index) in portfolios" :key="index" @click="onSelect(portfolio)">
                        <v-list-tile-title>{{ getPortfolioName(portfolio) }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </div>
    `
})
export class PortfolioSwitcher extends UI {

    @MainState("clientInfo")
    private clientInfo: ClientInfo;

    @MainAction(MutationType.SET_CURRENT_PORTFOLIO)
    setCurrentPortfolio: (portfolio: Portfolio) => void;

    private clientService = (<ClientService> Container.get(ClientService));
    private portfolioService = (<PortfolioService> Container.get(PortfolioService));

    private portfolios: PortfolioRow[] = null;

    private selected: PortfolioRow = null;

    private async mounted(): Promise<void> {
        this.portfolios = await this.clientService.getClientInfo().client.portfolios;
        this.selected = this.getSelected();
    }

    private created(): void {
        console.log("created in PS", this.clientInfo);
    }

    private onSelect(selected: PortfolioRow): void {
        // this.$store.commit(`${StoreType.MAIN}/${MutationType.SET_CURRENT_PORTFOLIO}`, selected.id);
        // this.$store.commit('')
        this.setCurrentPortfolio(this.portfolioService.getById(selected.id));
        this.selected = selected;
    }


    private getPortfolioName(portfolio: PortfolioRow): string {
        return `${portfolio.name} (${portfolio.currency}), ${portfolio.access}`;
    }

    private getSelected(id?: string): PortfolioRow {
        console.log("SELECTED", this.$store.state[StoreType.MAIN]);
        const currentPortfolioId = this.$store.state[StoreType.MAIN].currentPortfolio.id;
        const portfolio = this.portfolios.find(p => p.id === currentPortfolioId);
        if (!portfolio) {
            return this.portfolios[0];
        }
        return portfolio;

    }
}