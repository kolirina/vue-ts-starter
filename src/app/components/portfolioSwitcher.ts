import {namespace} from "vuex-class/lib/bindings";
import {Component, UI, Watch} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {PortfolioParams} from "../services/portfolioService";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-list-tile class="text-xs-center sidebar-list-item">
            <img src="img/sidebar/case.svg">
            <v-list-tile-content class="portfolio-content">
                <v-menu offset-y transition="slide-y-transition" class="portfolios-drop portfolios-menu">
                    <div slot="activator" class="portfolios-inner-wrap">
                        <div class="portfolios-inner-content">
                            <span class="portfolios-name ellipsis">{{ selected.name }}</span>
                            <div class="portfolios-list-icons">
                                <i :class="selected.viewCurrency.toLowerCase()" title="Валюта"></i>
                                <img src="img/portfolio/share.svg" v-if="selected.access" title="Публичный">
                                <img src="img/portfolio/pro.svg" v-if="selected.professionalMode" title="Профессиональный режим">
                            </div>
                        </div>
                        <div class="portfolios-arrow">
                            <v-icon>keyboard_arrow_down</v-icon>
                        </div>
                    </div>

                    <v-list class="portfolios-list">
                        <v-list-tile v-for="(portfolio, index) in clientInfo.user.portfolios" class="portfolios-list-tile" :key="index"
                                     @click="onSelect(portfolio)">
                            <v-list-tile-title class="ellipsis">{{ portfolio.name }}</v-list-tile-title>
                            <div class="portfolios-list-icons">
                                <i :class="selected.viewCurrency.toLowerCase()" title="Валюта"></i>
                                <img src="img/portfolio/share.svg" v-if="selected.access" title="Публичный">
                                <img src="img/portfolio/pro.svg" v-if="selected.professionalMode" title="Профессиональный режим">
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
    private setCurrentPortfolio: (id: number) => Promise<Portfolio>;

    @MainStore.Action(MutationType.SET_DEFAULT_PORTFOLIO)
    private setDefaultPortfolio: (id: number) => Promise<void>;

    private selected: PortfolioParams = null;

    async created(): Promise<void> {
        this.selected = this.getSelected();
    }

    @ShowProgress
    private async onSelect(selected: PortfolioParams): Promise<void> {
        await this.setDefaultPortfolio(selected.id);
        await this.setCurrentPortfolio(selected.id);
        this.selected = selected;
    }

    @Watch("clientInfo.user.portfolios", {deep: true})
    private onPortfoliosChange(): void {
        this.selected = this.getSelected();
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
