import Component from 'vue-class-component';
import {namespace} from 'vuex-class/lib/bindings';
import {UI} from '../app/UI';
import {TradesTable} from '../components/tradesTable';
import {Portfolio} from '../types/types';
import {StoreType} from '../vuex/storeType';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <trades-table :trades="portfolio.trades"></trades-table>
        </v-container>
    `,
    components: {TradesTable}
})
export class TradesPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private mounted(): void {
        console.log('TRADES PAGE', this.$store.state[StoreType.MAIN]);
    }
}
