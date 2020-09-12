/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../app/ui";
import {CompositePortfolioManagementDialog} from "../components/dialogs/compositePortfolioManagementDialog";
import {Storage} from "../platform/services/storage";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams} from "../services/portfolioService";
import {StoreKeys} from "../types/storeKeys";
import {CombinedPortfolioParams, Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({})
export class PortfolioBasedPage extends UI {

    @MainStore.Getter
    protected clientInfo: ClientInfo;
    @MainStore.Getter
    protected portfolio: Portfolio;
    /** Комбинированный портфель */
    @MainStore.Getter
    protected combinedPortfolioParams: PortfolioParams;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    protected reloadPortfolio: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_COMBINED_PORTFOLIO)
    protected updateCombinedPortfolio: (viewCurrency: string) => void;
    @Inject
    protected localStorage: Storage;
    @Inject
    protected overviewService: OverviewService;

    protected async showDialogCompositePortfolio(): Promise<void> {
        const result = await new CompositePortfolioManagementDialog().show({
            portfolios: this.clientInfo.user.portfolios,
            viewCurrency: this.portfolio.portfolioParams.viewCurrency
        });
        if (result) {
            this.overviewService.resetCacheForCombinedPortfolio({
                ids: this.combinedPortfolioParams.combinedIds,
                viewCurrency: this.combinedPortfolioParams.viewCurrency
            });
            this.updateCombinedPortfolio(result);
            const portfolioParams = this.localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
            portfolioParams.viewCurrency = result;
            this.localStorage.set(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, portfolioParams);
            await this.reloadPortfolio();
        }
    }

    protected get isEmptyBlockShowed(): boolean {
        console.log(this.portfolio?.overview.totalTradesCount);
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }

    protected get combinedPortfolioSelected(): boolean {
        return this.portfolio.portfolioParams.combinedFlag;
    }
}
