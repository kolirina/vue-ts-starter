import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {BondQuotes} from "./bondQuotes";
import {CurrencyQuotes} from "./currencyQuotes";
import {StockQuotes} from "./stockQuotes";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Котировки</div>
                </v-card-title>
            </v-card>
            <v-card flat class="pa-0">
                <v-radio-group v-model="currentTab" row class="mt-0 pt-4 pl-4 margB35" hide-details>
                    <v-radio v-for="item in quotesType" :key="item" :label="item" :value="item" class="pl-1"></v-radio>
                </v-radio-group>
                <stock-quotes v-if="currentTab === quotesType.STOCK"></stock-quotes>
                <bond-quotes v-if="currentTab === quotesType.BOND"></bond-quotes>
                <currency-quotes v-if="currentTab === quotesType.CURRENCY"></currency-quotes>
            </v-card>
        </v-container>
    `,
    components: {StockQuotes, BondQuotes, CurrencyQuotes}
})
export class QuotesPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private quotesType = QuotesType;
    private currentTab: QuotesType = QuotesType.STOCK;

}

export enum QuotesType {
    STOCK = "Акции",
    BOND = "Облигации",
    CURRENCY = "Валюты"
}