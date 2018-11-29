import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {DividendDashboardComponent} from "../components/dividendDashboardComponent";
import {DividendAggregateInfo, DividendService} from "../services/dividendService";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dividend-dashboard-component v-if="dividendInfo" :data="dividendInfo.dividendDashboard"></dividend-dashboard-component>
        </v-container>
    `,
    components: {DividendDashboardComponent}
})
export class DividendsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    @Inject
    private dividendService: DividendService;

    private loading = false;

    private dividendInfo: DividendAggregateInfo = null;

    async created(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    private async loadDividendAggregateInfo(): Promise<void> {
        this.loading = true;
        this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id);
        this.loading = false;
    }
}
