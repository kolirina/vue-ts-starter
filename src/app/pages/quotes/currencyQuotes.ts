import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {MarketService} from "../../services/marketService";
import {Currency} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-container fluid class="currency">
            <v-card v-for="currency of currencies" :key="currency.charCode" flat class="elevation-6 currency-card" :title="currency.name">
                <v-card-title primary-title class="currency-code" :key="currency.charCode">
                    <div>
                        {{ currency.nominal }} {{ currency.charCode }}
                    </div>
                </v-card-title>

                <v-card-text class="currency-value rub">
                    = {{ currency.value }}
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class CurrencyQuotes extends UI {

    @Inject
    private marketservice: MarketService;

    private currencies: Currency[] = [];

    /**
     * Загрузка данных для компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        const array = await this.marketservice.loadCurrencies();
        const sortBy = ["EUR", "USD"];
        this.currencies = array.sort((a, b) => sortBy.indexOf(b.charCode) - sortBy.indexOf(a.charCode));
    }
}
