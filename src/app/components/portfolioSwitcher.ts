import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, Prop, UI} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {Storage} from "../platform/services/storage";
import {ClientInfo} from "../services/clientService";
import {DealsImportProvider} from "../services/importService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams, PortfolioService} from "../services/portfolioService";
import {CurrencyUnit} from "../types/currency";
import {EventType} from "../types/eventType";
import {StoreKeys} from "../types/storeKeys";
import {Tariff} from "../types/tariff";
import {CombinedPortfolioParams, Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {CompositePortfolioManagementDialog} from "./dialogs/compositePortfolioManagementDialog";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-list-tile class="text-xs-center sidebar-list-item">
            <v-list-tile-content class="portfolio-content">
                <v-menu v-model="menu" offset-y transition="slide-y-transition" class="portfolios-drop portfolios-menu">
                    <v-layout slot="activator" class="pa-0 w100pc" justify-center align-center row>
                        <span :class="['portfolio-switcher-icon', sideBarOpened ? '' : 'mx-3', isMobile ? 'mx-3' : '', brokerIcon]"
                              :title="brokerDescription"></span>
                        <div v-if="!sideBarOpened || isMobile" class="portfolios-inner-content">
                            <span class="w140 fs13 ellipsis">{{ selected.name }}</span>
                            <v-layout align-center class="portfolios-list-icons margT4">
                                <div :class="['portfolios-list-currency__item', {'active': selected.viewCurrency === currency}]"
                                     @click.stop="changeCurrency(currency)"
                                     v-for="currency in currencyList">
                                    {{ currency }}
                                </div>
                                <i v-if="selected.access !== 0" class="public-portfolio-icon" :title="selected.access === 2 ? 'Публичный' : 'Публичный по ссылке'"></i>
                                <!-- todo иконка составного портфеля -->
                                <div v-if="selected.professionalMode" class="professional-mode-icon" title="Профессиональный режим"></div>
                            </v-layout>
                        </div>
                        <div v-if="!sideBarOpened || isMobile" class="portfolios-arrow">
                            <v-icon>keyboard_arrow_down</v-icon>
                        </div>
                    </v-layout>

                    <v-list class="portfolios-list">
                        <v-list-tile v-for="(portfolio, index) in clientInfo.user.portfolios" class="portfolios-list-tile" :key="index" @click="onSelect(portfolio)">
                            <div :class="['portfolios-list-tile__icon', getBrokerIconClass(portfolio.brokerId)]"></div>
                            <div class="portfolios-list-tile__info">
                                <v-list-tile-title class="ellipsis">{{ portfolio.name }}</v-list-tile-title>
                                <v-layout align-center class="portfolios-list-icons">
                                    <i :class="portfolio.viewCurrency.toLowerCase()" title="Валюта"></i>
                                    <i v-if="portfolio.access !== 0" class="public-portfolio-icon" :title="portfolio.access === 2 ? 'Публичный' : 'Публичный по ссылке'"></i>
                                    <!-- todo иконка составного портфеля -->
                                    <div v-if="portfolio.professionalMode" class="professional-mode-icon" title="Профессиональный режим"></div>
                                </v-layout>
                            </div>
                            <div v-if="portfolio.id" @click.stop="goToPortfolioSettings(portfolio.id)" class="portfolios-list__settings" title="Управление портфелем"></div>
                            <div v-else @click.stop="setCombinedPortfolio" class="portfolios-list__settings" title="Управление портфелем"></div>
                        </v-list-tile>
                    </v-list>
                </v-menu>
            </v-list-tile-content>
        </v-list-tile>
    `
})
export class PortfolioSwitcher extends UI {

    /** Комбинированный портфель */
    @MainStore.Getter
    private combinedPortfolioParams: PortfolioParams;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;

    @MainStore.Mutation(MutationType.UPDATE_COMBINED_PORTFOLIO)
    private updateCombinedPortfolio: (viewCurrency: string) => void;

    @MainStore.Action(MutationType.SET_CURRENT_PORTFOLIO)
    private loadAndSetCurrentPortfolio: (id: number) => Promise<Portfolio>;
    @MainStore.Action(MutationType.SET_CURRENT_COMBINED_PORTFOLIO)
    private setCurrentCombinedPortfolio: (portfolioParams: CombinedPortfolioParams) => Promise<Portfolio>;

    @MainStore.Action(MutationType.SET_DEFAULT_PORTFOLIO)
    private setDefaultPortfolio: (id: number) => Promise<void>;

    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;

    @Inject
    private portfolioService: PortfolioService;
    @Inject
    private localStorage: Storage;
    @Inject
    private overviewService: OverviewService;
    @Prop({default: false, required: false})
    private sideBarOpened: boolean;

    @Prop({default: false, required: false})
    private isMobile: boolean;
    /** Выбранный портфель */
    private selected: PortfolioParams = null;
    /** Список валют */
    private currencyList = [CurrencyUnit.RUB, CurrencyUnit.USD, CurrencyUnit.EUR].map(currency => currency.code);
    /** Активатор меню */
    private menu = false;

    /**
     * Инициализация портфелей
     */
    async created(): Promise<void> {
        this.initCombinedPortfolio();
        UI.on(EventType.PORTFOLIO_LIST_UPDATED, () => this.initCombinedPortfolio());
        UI.on(EventType.SET_PORTFOLIO, (portfolioParams: PortfolioParams) => this.onSelect(portfolioParams));
    }

    beforeDestroy(): void {
        UI.off(EventType.PORTFOLIO_LIST_UPDATED);
        UI.off(EventType.SET_PORTFOLIO);
    }

    private initCombinedPortfolio(): void {
        if (this.clientInfo.user.portfolios.length > 1 && this.clientInfo.user.tariff !== Tariff.FREE) {
            const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, null);
            if (!this.clientInfo.user.portfolios.some(portfolio => portfolio.combinedFlag)) {
                this.clientInfo.user.portfolios.push(this.combinedPortfolioParams);
            } else {
                // составной портфель должен быть всегда последним
                this.clientInfo.user.portfolios = this.clientInfo.user.portfolios.filter(portfolio => !portfolio.combinedFlag);
                this.clientInfo.user.portfolios.push(this.combinedPortfolioParams);
            }
            this.updateCombinedPortfolio(portfolioParams?.viewCurrency || this.combinedPortfolioParams.viewCurrency);
        }
        this.selected = this.getSelected();
    }

    @ShowProgress
    private async onSelect(selected: PortfolioParams): Promise<void> {
        const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
        if (selected.id) {
            await this.setDefaultPortfolio(selected.id);
            await this.loadAndSetCurrentPortfolio(selected.id);
            portfolioParams.selected = false;
        } else {
            await this.setCurrentCombinedPortfolio({ids: selected.combinedIds, viewCurrency: selected.viewCurrency} as CombinedPortfolioParams);
            portfolioParams.selected = true;
        }
        this.localStorage.set<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, portfolioParams);
        this.selected = selected;
    }

    private onPortfoliosChange(): void {
        this.initCombinedPortfolio();
    }

    private getSelected(): PortfolioParams {
        const currentPortfolioId = this.portfolio.id;
        const portfolio = this.clientInfo.user.portfolios.find(p => p.id === currentPortfolioId);
        const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, null);
        if (portfolioParams?.selected) {
            return this.combinedPortfolioParams;
        }
        if (!portfolio) {
            return this.clientInfo.user.portfolios[0];
        }
        return portfolio;
    }

    private getBrokerIconClass(brokerId: number): string {
        const provider = DealsImportProvider.valueById(brokerId);
        return provider ? provider.code.toLowerCase() : "";
    }

    /**
     * Обновляет валюту портфеля
     * @param currencyCode валюта
     */
    private async changeCurrency(currencyCode: string): Promise<void> {
        if (this.selected.combinedFlag) {
            const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
            portfolioParams.viewCurrency = currencyCode;
            this.localStorage.set<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, portfolioParams);
            await this.setCurrentCombinedPortfolio({ids: this.selected.combinedIds, viewCurrency: currencyCode});
            this.selected.viewCurrency = currencyCode;
            return;
        }
        await this.portfolioService.changeCurrency(this.selected.id, currencyCode);
        await this.reloadPortfolio();
    }

    private goToPortfolioSettings(id: number): void {
        this.$router.push({name: "portfolio-management-edit", params: {id: String(id)}});
    }

    private async setCombinedPortfolio(): Promise<void> {
        this.menu = false;
        const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
        const result = await new CompositePortfolioManagementDialog().show({
            portfolios: this.clientInfo.user.portfolios,
            viewCurrency: portfolioParams?.viewCurrency || CurrencyUnit.RUB.code
        });
        if (result) {
            this.overviewService.resetCacheForCombinedPortfolio({
                ids: this.combinedPortfolioParams.combinedIds,
                viewCurrency: this.combinedPortfolioParams.viewCurrency
            });
            this.updateCombinedPortfolio(result);
            await this.reloadPortfolio();
        }
    }

    private get broker(): DealsImportProvider {
        const provider = DealsImportProvider.valueById(this.selected.brokerId);
        return provider ? provider : null;
    }

    private get brokerIcon(): string {
        return this.broker ? this.broker.code.toLowerCase() : "";
    }

    private get brokerDescription(): string {
        return this.broker ? this.broker.description : "";
    }
}
