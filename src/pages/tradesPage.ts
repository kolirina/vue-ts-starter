import Component from "vue-class-component";
import {UI} from "../app/UI";
import {Portfolio} from "../types/types";
import {TradesTable} from "../components/tradesTable";
import {StoreType} from "../vuex/storeType";
import {Getter, namespace} from "vuex-class/lib/bindings";

const PortfolioGetter = namespace(StoreType.MAIN, Getter);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboard"></dashboard>
            <trades-table :trades="portfolio.trades"></trades-table>
        </v-container>
    `,
    components: {TradesTable}
})
export class TradesPage extends UI {

    @PortfolioGetter('portfolio') portfolio: Portfolio;
}
