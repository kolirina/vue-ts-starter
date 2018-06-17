import {UI} from "../app/UI";
import Component from "vue-class-component";
import {ClientInfo, Portfolio, PortfolioParams} from "../types/types";
import {StoreType} from "../vuex/storeType";
import {MutationType} from "../vuex/mutationType";
import {Action, Getter, namespace} from "vuex-class/lib/bindings";

const MainStore = namespace(StoreType.MAIN);

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

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;

    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private setCurrentPortfolio: (id: string) => Promise<Portfolio>;

    private portfolios: PortfolioParams[] = null;

    private selected: PortfolioParams = null;

    private async created(): Promise<void> {
        console.log('PS', this.clientInfo);
        this.portfolios = this.clientInfo.user.portfolios;
        this.selected = this.getSelected();
    }

    private async onSelect(selected: PortfolioParams): Promise<void> {
        await this.setCurrentPortfolio(selected.id);
        this.selected = selected;
    }


    private getPortfolioName(portfolio: PortfolioParams): string {
        return `${portfolio.name} (${portfolio.viewCurrency}), ${portfolio.access ? 'Публичный' : 'Закрытый'}`;
    }

    private getSelected(id?: string): PortfolioParams {
        console.log("SELECTED", this.$store.state[StoreType.MAIN]);
        const currentPortfolioId = this.portfolio.id;
        const portfolio = this.portfolios.find(p => p.id === currentPortfolioId);
        if (!portfolio) {
            return this.portfolios[0];
        }
        return portfolio;

    }
}
