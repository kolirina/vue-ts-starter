import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {BondQuotes} from "./bondQuotes";
import {StockQuotes} from "./stockQuotes";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-tabs slot="extension" v-model="currentTab" color="indigo" grow dark>
                <v-tab>
                    Акции
                </v-tab>
                <v-tab>
                    Облигации
                </v-tab>

                <v-tab-item lazy>
                    <v-card flat>
                        <v-card-text>
                            <stock-quotes></stock-quotes>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
                <v-tab-item lazy>
                    <v-card flat>
                        <v-card-text>
                            <bond-quotes></bond-quotes>
                        </v-card-text>
                    </v-card>
                </v-tab-item>
            </v-tabs>
        </v-container>
    `,
    components: {StockQuotes, BondQuotes}
})
export class QuotesPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private currentTab: any = null;
}
