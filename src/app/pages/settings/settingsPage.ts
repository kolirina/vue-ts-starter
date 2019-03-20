import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {PortfolioEditDialog} from "../../components/dialogs/portfolioEditDialog";
import {PortfoliosTable} from "../../components/portfoliosTable";
import {ClientInfo} from "../../services/clientService";
import {PortfolioParams} from "../../services/portfolioService";
import {EventType} from "../../types/eventType";
import {MutationType} from "../../vuex/mutationType";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="clientInfo && clientInfo.user" fluid>
            <v-layout row wrap>
                <v-flex>
                    <div class="section-title" style="margin-bottom: 3px">Управление портфелями</div>
                    <v-card class="portfolio-settings-card portfolio-settings-card-main portfolio-settings-card-full">
                        <v-btn @click.stop="openDialog" class="primary">
                            Добавить портфель
                        </v-btn>
                    </v-card>

                    <portfolios-table :portfolios="clientInfo.user.portfolios"></portfolios-table>
                </v-flex>
            </v-layout>
        </v-container>
    `,
    components: {PortfoliosTable}
})
export class SettingsPage extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIOS)
    private reloadPortfolios: () => Promise<void>;
    @MainStore.Mutation(MutationType.UPDATE_PORTFOLIO)
    private updatePortfolio: (portfolio: PortfolioParams) => Promise<void>;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    created(): void {
        UI.on(EventType.PORTFOLIO_CREATED, async () => this.reloadPortfolios());
        UI.on(EventType.PORTFOLIO_UPDATED, async (portfolio: PortfolioParams) => this.updatePortfolio(portfolio));
        UI.on(EventType.PORTFOLIO_RELOAD, async (portfolio: PortfolioParams) => await this.reloadPortfolio(portfolio.id));
    }

    beforeDestroy(): void {
        UI.off(EventType.PORTFOLIO_CREATED);
        UI.off(EventType.PORTFOLIO_UPDATED);
        UI.off(EventType.PORTFOLIO_RELOAD);
    }

    private async openDialog(): Promise<void> {
        await new PortfolioEditDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
    }
}
