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
        <v-list-tile class="text-xs-center portfolios sidebar-list-item">
            <v-list-tile-action class="sidebar-item-action">
                <img src="img/sidebar/case.svg">
            </v-list-tile-action>
            <v-list-tile-content class="portfolio-content">
                <v-menu offset-y transition="slide-y-transition" class="portfolios-drop portfolios-menu">
                    <div slot="activator" class="portfolios-inner-wrap">
                        <div class="portfolios-inner-content">
                            <span class="portfolios-name ellipsis">{{ selected.name }}</span>
                            <div class="portfolios-list-icons">
                                <i :class="selected.viewCurrency.toLowerCase()" title="Валюта"></i>
                                <i v-if="selected.access" class="fas fa-share-alt" title="Публичный"></i>
                                <i v-else class="far fa-eye-slash" title="Приватный"></i>
                                <i v-if="selected.professionalMode" class="fas fa-rocket" title="Профессиональный режим"></i>
                            </div>
                        </div>
                        <div class="portfolios-arrow">
                            <v-icon>arrow_drop_down</v-icon>
                        </div>
                    </div>

                    <v-list class="portfolios-list">
                        <v-list-tile v-for="(portfolio, index) in clientInfo.user.portfolios" class="portfolios-list-tile" :key="index"
                                     @click="onSelect(portfolio)">
                            <v-list-tile-title class="ellipsis">{{ portfolio.name }}</v-list-tile-title>
                            <div class="portfolios-list-icons">
                                <i :class="portfolio.viewCurrency.toLowerCase()" title="Валюта"></i>
                                <i v-if="portfolio.access" class="fas fa-share-alt" title="Публичный"></i>
                                <i v-else class="far fa-eye-slash" title="Приватный"></i>
                                <i v-if="portfolio.professionalMode" class="fas fa-rocket" title="Профессиональный режим"></i>
                            </div>
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

    private selected: PortfolioParams = null;

    async created(): Promise<void> {
        this.selected = this.getSelected();
    }

    private async onSelect(selected: PortfolioParams): Promise<void> {
        await this.setCurrentPortfolio(selected.id);
        this.selected = selected;
    }

    private getSelected(): PortfolioParams {
        const currentPortfolioId = this.portfolio.id;
        const portfolio = this.clientInfo.user.portfolios.find(p => p.id === currentPortfolioId);
        if (!portfolio) {
            return this.clientInfo.user.portfolios[0];
        }
        return portfolio;
    }
}
