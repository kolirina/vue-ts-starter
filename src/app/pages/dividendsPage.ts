import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {ShowProgress} from "../platform/decorators/showProgress";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {EventType} from "../types/eventType";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";
import {BaseDividendsPage} from "./baseDividendsPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <base-dividends-page :portfolio="portfolio" :dividend-info="dividendInfo" :side-bar-opened="sideBarOpened"></base-dividends-page>
    `,
    components: {BaseDividendsPage}
})
export class DividendsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private sideBarOpened: boolean;
    @Inject
    private dividendService: DividendService;
    /** Информация по дивидендам */
    private dividendInfo: DividendAggregateInfo = null;

    /**
     * Загружает данные по дивидендам
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadDividendAggregateInfo();
        UI.on(EventType.TRADE_CREATED, async () => await this.loadDividendAggregateInfo());
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
        this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
    }
}
