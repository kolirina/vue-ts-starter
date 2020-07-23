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

import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {PortfolioEditDialog} from "../../components/dialogs/portfolioEditDialog";
import {PortfoliosTable} from "../../components/tables/portfoliosTable";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {Portfolio} from "../../types/types";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="clientInfo && clientInfo.user" fluid>
            <v-layout row wrap>
                <v-flex>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Управление портфелями</div>
                        </v-card-title>
                    </v-card>

                    <portfolios-table :portfolios="clientInfo.user.portfolios"></portfolios-table>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {PortfoliosTable}
})
export class PortfoliosManagementPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_PORTFOLIO)
    private updatePortfolio: (portfolio: PortfolioParams) => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private portfolio: Portfolio;

    created(): void {
        UI.on(EventType.PORTFOLIO_CREATED, async () => this.reloadPortfolios());
        UI.on(EventType.PORTFOLIO_UPDATED, async (portfolio: PortfolioParams) => this.updatePortfolio(portfolio));
        UI.on(EventType.PORTFOLIO_RELOAD, async (portfolio: PortfolioParams) => await this.reloadPortfolio(portfolio.id));
        UI.on(EventType.TRADE_CREATED, async () => await this.reloadPortfolio(this.portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.PORTFOLIO_CREATED);
        UI.off(EventType.PORTFOLIO_UPDATED);
        UI.off(EventType.PORTFOLIO_RELOAD);
        UI.off(EventType.TRADE_CREATED);
    }

    private async openDialog(): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
    }
}
