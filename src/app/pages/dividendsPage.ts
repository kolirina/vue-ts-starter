import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {EventType} from "../types/eventType";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BaseDividendsPage} from "./baseDividendsPage";
import {PortfolioBasedPage} from "./portfolioBasedPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <empty-portfolio-stub v-if="isEmptyBlockShowed" @openCombinedDialog="showDialogCompositePortfolio"></empty-portfolio-stub>
                <base-dividends-page v-else :portfolio="portfolio" :dividend-info="dividendInfo" :side-bar-opened="sideBarOpened"></base-dividends-page>
            </template>
            <template v-else>
                <content-loader class="content-loader" :height="800" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="20" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="140" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="260" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="380" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="500" rx="5" ry="5" width="801.11" height="100"/>
                </content-loader>
            </template>
        </v-slide-x-reverse-transition>
    `,
    components: {BaseDividendsPage}
})
export class DividendsPage extends PortfolioBasedPage {

    @MainStore.Getter
    protected portfolio: Portfolio;
    @MainStore.Getter
    protected sideBarOpened: boolean;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    protected reloadPortfolio: () => Promise<void>;
    @Inject
    private dividendService: DividendService;
    /** Информация по дивидендам */
    private dividendInfo: DividendAggregateInfo = null;
    /** Признак инициализации */
    private initialized = false;

    /**
     * Загружает данные по дивидендам
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.initialized = false;
        try {
            await this.loadDividendAggregateInfo();
        } finally {
            this.initialized = true;
        }
        UI.on(EventType.TRADE_CREATED, async () => {
            await this.reloadPortfolio();
        });
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async loadDividendAggregateInfo(): Promise<void> {
        if (this.portfolio.id) {
            this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
        } else {
            this.dividendInfo = await this.dividendService.getDividendAggregateInfoCombined(this.portfolio.portfolioParams.viewCurrency,
                this.portfolio.portfolioParams.combinedIds);
        }
    }
}
