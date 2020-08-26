import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {EventType} from "../types/eventType";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BaseDividendsPage} from "./baseDividendsPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <empty-portfolio-stub v-if="isEmptyBlockShowed"></empty-portfolio-stub>
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
export class DividendsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
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
        await this.loadDividendAggregateInfo();
        UI.on(EventType.TRADE_CREATED, async () => {
            await this.reloadPortfolio(this.portfolio.id);
            await this.loadDividendAggregateInfo();
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
    private async loadDividendAggregateInfo(): Promise<void> {
        this.initialized = false;
        try {
            if (this.portfolio.id) {
                this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
            } else {
                this.dividendInfo = await this.dividendService.getDividendAggregateInfoCombined(this.portfolio.portfolioParams.viewCurrency,
                    this.portfolio.portfolioParams.combinedIds);
            }
        } finally {
            this.initialized = true;
        }
    }

    private get isEmptyBlockShowed(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }
}
