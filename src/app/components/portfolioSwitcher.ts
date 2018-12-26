import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams} from "../services/portfolioService";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div v-if="clientInfo && clientInfo.user && portfolio" class="text-xs-center">
            <v-menu offset-y transition="slide-y-transition">
                <v-btn slot="activator" color="primary">{{ getPortfolioName(selected) }}</v-btn>
                <v-list style="max-height: 500px; overflow-x: auto;">
                    <v-list-tile v-for="(portfolio, index) in clientInfo.user.portfolios" :key="index" @click="onSelect(portfolio)">
                        <v-list-tile-title>{{ getPortfolioName(portfolio) }}</v-list-tile-title>
                    </v-list-tile>
                </v-list>
            </v-menu>
        </div>
    `
})
export class PortfolioSwitcher extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    private async onSelect(selected: PortfolioParams): Promise<void> {
        await this.setCurrentPortfolio(selected.id);
    }

    private getPortfolioName(portfolio: PortfolioParams): string {
        return `${portfolio.name} (${portfolio.viewCurrency}), ${portfolio.access ? "Публичный" : "Закрытый"}`;
    }

    private get selected(): PortfolioParams {
        const currentPortfolioId = this.portfolio.id;
        const portfolio = this.clientInfo.user.portfolios.find(p => p.id === currentPortfolioId);
        if (!portfolio) {
            return this.clientInfo.user.portfolios[0];
        }
        return portfolio;
    }
}
