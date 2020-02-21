import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {MarketService} from "../../services/marketService";
import {Currency, CurrencyItem} from "../../types/currency";

@Component({
    // language=Vue
    template: `
        <v-container fluid class="pl-0 pt-0 pb-5">
            <v-layout class="currency" wrap>
                <v-flex v-for="currency of currencies" :key="currency.charCode" xs12 sm6 md4 lg2>
                    <v-card flat :title="currency.name" class="currency-card margL24 margT20">
                        <div>
                            <span class="fs14 bold">{{ currency.nominal }} {{ currency.charCode }}</span> = <span class="rub fs14">{{ currency.value }}</span>
                        </div>
                    </v-card>
                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class CurrencyQuotes extends UI {

    @Inject
    private marketservice: MarketService;

    private currencies: CurrencyItem[] = [];

    /**
     * Загрузка данных для компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        const array = await this.marketservice.loadCurrencies();
        const sortBy: string[] = [Currency.EUR, Currency.USD, Currency.GBP];
        this.currencies = array.sort((a, b) => sortBy.indexOf(b.charCode) - sortBy.indexOf(a.charCode));
    }
}
