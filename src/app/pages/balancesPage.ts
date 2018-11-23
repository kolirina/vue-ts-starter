import { Inject } from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
// import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
// import {StoreType} from "../vuex/storeType";
import { MarketService } from "../services/marketService";
import {Share} from "../types/types";

// const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
<v-container>
    <v-card>
        <v-card-title>
            <span class="headline">Текущие остатки портфеля</span>
        </v-card-title>
        <v-card-text>
            <v-flex >
                    <p>
                        Перечислите все ценные бумаги и денежные остатки в составе портфеля.
                        Старайтесь указывать верную дату и цену покупки бумаг - это повысит точность расчетов.
                    </p>
                    <p>
                        Добавить ценную бумагу
                    </p>
            </v-flex>
            <v-flex >
                <v-autocomplete v-model="share"
                                label="Тикер | Название ценной бумаги"
                                append-icon="fas fa-building"
                                cache-items
                                clearable
                                name="share"
                                required
                                :error-messages="errors.collect('share')"
                                :hide-no-data="true"
                                :items="filteredShares"
                                :loading="shareSearch"
                                :no-data-text="notFoundLabel"
                                :no-filter="true"
                                :search-input.sync="searchQuery">
                </v-autocomplete>
            </v-flex>
        </v-card-text>
    </v-card>
</v-container>
    `
})
export class BalancesPage extends UI {

    @Inject
    private marketService: MarketService

    private filteredShares: Share[] = [];

    private notFoundLabel = "Ничего не найдено";
    
    private share: Share = null;

    private searchQuery: string = null;

    private shareSearch = false;

    /** Текущий объект таймера */
    private currentTimer: number = null;

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        console.log("SEARCH", this.searchQuery);
        if (!this.searchQuery || this.searchQuery.length <= 2) {
            return;
        }
        clearTimeout(this.currentTimer);
        this.shareSearch = true;
        const delay = new Promise((resolve, reject) => {
            this.currentTimer = setTimeout(async () => {
                try {
                    this.filteredShares = [
                        ...await this.marketService.searchStocks(this.searchQuery),
                        ...await this.marketService.searchBonds(this.searchQuery)
                    ];
                    console.log("filtered bonds", this.filteredShares);
                    this.shareSearch = false;
                } catch (error) {
                    reject(error);
                }
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
                this.shareSearch = false;
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            this.shareSearch = false;
            throw error;
        }
    }
}
