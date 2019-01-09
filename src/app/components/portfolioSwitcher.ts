import Component from "vue-class-component";
import {Action, Getter, namespace} from "vuex-class/lib/bindings";
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
        <v-list-tile v-if="portfolios" class="text-xs-center portfolios sidebar-list-item">
            <v-list-tile-action class="sidebar-item-action">
                <img src="img/sidebar/case.svg">
            </v-list-tile-action>
            <v-list-tile-content class="portfolio-content">
                <v-menu offset-y transition="slide-y-transition" class="portfolios-menu">
                    <div slot="activator" class="portfolios-inner-wrap">
                        <div class="portfolios-inner-content">
                            <span class="portfolios-name">{{ selected.name }}</span>
                            <span class="portfolios-currency">{{ selected.viewCurrency }}</span>
                        </div>
                        <div class="portfolios-arrow">
                            <v-icon>arrow_drop_down</v-icon>
                        </div>
                    </div>

                    <v-list style="max-height: 500px; overflow-x: auto;">
                        <v-list-tile v-for="(portfolio, index) in portfolios" :key="index" @click="onSelect(portfolio)">
                            <v-list-tile-title>{{ getPortfolioName(portfolio) }}</v-list-tile-title>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-list-tile-content>

        </v-list-tile>
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

    async created(): Promise<void> {
        this.portfolios = this.clientInfo.user.portfolios;
        this.selected = this.getSelected();
    }

    private async onSelect(selected: PortfolioParams): Promise<void> {
        await this.setCurrentPortfolio(selected.id);
        this.selected = selected;
    }

    private getPortfolioName(portfolio: PortfolioParams): string {
        return `${portfolio.name} (${portfolio.viewCurrency}), ${portfolio.access ? "Публичный" : "Закрытый"}`;
    }

    private getSelected(id?: string): PortfolioParams {
        const currentPortfolioId = this.portfolio.id;
        const portfolio = this.portfolios.find(p => p.id === currentPortfolioId);
        if (!portfolio) {
            return this.portfolios[0];
        }
        return portfolio;
    }
}
