import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {DividendChart} from "../components/charts/dividendChart";
import {BigMoney} from "../types/bigMoney";
import {Portfolio} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {BaseShareInfoPage} from "./shareInfo/baseShareInfoPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <base-share-info-page :ticker="ticker" :portfolio-avg-price="portfolioAvgPrice" @reloadPortfolio="onReloadPortfolio"></base-share-info-page>
    `,
    components: {BaseShareInfoPage}
})
export class ShareInfoPage extends UI {

    $refs: {
        chartComponent: DividendChart
    };

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    /** Код ценной бумаги */
    private ticker: string = null;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        this.ticker = this.$route.params.ticker;
    }

    private async onReloadPortfolio(): Promise<void> {
        await this.reloadPortfolio(this.portfolio.id);
    }

    private get portfolioAvgPrice(): number {
        const row = this.portfolio.overview.stockPortfolio.rows.find(r => r.stock.ticker === this.ticker);
        return row ? new BigMoney(row.avgBuy).amount.toNumber() : null;
    }

}
