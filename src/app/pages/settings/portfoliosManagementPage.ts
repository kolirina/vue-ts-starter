/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, UI} from "../../app/ui";
import {ChangeTariffDialog} from "../../components/dialogs/changeTariffDialog";
import {PortfoliosTile} from "../../components/portfoliosTile";
import {PortfoliosTable} from "../../components/tables/portfoliosTable";
import {Storage} from "../../platform/services/storage";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {StoreKeys} from "../../types/storeKeys";
import {Portfolio} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="clientInfo && clientInfo.user" fluid class="page-wrapper">
            <v-layout row wrap>
                <v-flex>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text margR12 lh36">Управление портфелями</div>
                            <v-btn-toggle :value="displayMode" @change="onDisplayModeChange" class="btn-group" mandatory>
                                <v-btn :value="DisplayMode.TILE" class="btn_icon-tile"></v-btn>
                                <v-btn :value="DisplayMode.LIST" class="btn_icon-list"></v-btn>
                            </v-btn-toggle>
                            <v-spacer></v-spacer>
                            <v-btn v-if="displayMode === DisplayMode.LIST" @click.stop="createNewPortfolio" class="primary">
                                Добавить портфель
                            </v-btn>
                        </v-card-title>
                    </v-card>
                    <portfolios-tile v-if="displayMode === DisplayMode.TILE" :portfolios="clientInfo.user.portfolios" data-v-step="0"></portfolios-tile>
                    <portfolios-table v-if="displayMode === DisplayMode.LIST" :portfolios="clientInfo.user.portfolios" data-v-step="0"></portfolios-table>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {PortfoliosTable, PortfoliosTile}
})
export class PortfoliosManagementPage extends UI {

    @Inject
    private localStorage: Storage;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_PORTFOLIO)
    private updatePortfolio: (portfolio: PortfolioParams) => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    private reloadPortfolio: () => Promise<void>;
    /** Режимы отображения портфелей */
    private DisplayMode = DisplayMode;
    /** Режим отображения списка */
    private displayMode = DisplayMode.TILE;

    created(): void {
        this.displayMode = this.localStorage.get(StoreKeys.PORTFOLIO_DISPLAY_MODE_KEY, DisplayMode.TILE);
        UI.on(EventType.PORTFOLIO_CREATED, async () => {
            await this.reloadPortfolios();
            UI.emit(EventType.PORTFOLIO_LIST_UPDATED);
        });
        UI.on(EventType.PORTFOLIO_UPDATED, async (portfolio: PortfolioParams) => await this.updatePortfolio(portfolio));
        UI.on(EventType.PORTFOLIO_RELOAD, async (portfolio: PortfolioParams) => {
            if (this.portfolio.id === portfolio.id) {
                await this.reloadPortfolio();
            }
        });
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio());
    }

    beforeDestroy(): void {
        UI.off(EventType.PORTFOLIO_CREATED);
        UI.off(EventType.PORTFOLIO_UPDATED);
        UI.off(EventType.PORTFOLIO_RELOAD);
        UI.off(EventType.TRADE_CREATED);
    }

    private onDisplayModeChange(displayMode: DisplayMode): void {
        this.displayMode = displayMode;
        this.localStorage.set(StoreKeys.PORTFOLIO_DISPLAY_MODE_KEY, this.displayMode);
    }

    private async createNewPortfolio(): Promise<void> {
        if (this.clientInfo.user.tariff.maxPortfoliosCount < this.availablePortfolios.length + 1) {
            await new ChangeTariffDialog().show(this.$router);
            return;
        }
        await this.$router.push({name: "portfolio-management-edit", params: {id: "new"}});
    }

    /**
     * Возвращает список портфелей доступных для переключения
     */
    private get availablePortfolios(): PortfolioParams[] {
        return this.clientInfo.user.portfolios.filter(portfolio => !portfolio.combinedFlag);
    }
}

enum DisplayMode {
    TILE = "TILE",
    LIST = "LIST"
}
