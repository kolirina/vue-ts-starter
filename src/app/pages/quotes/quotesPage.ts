import Component from "vue-class-component";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {Enum, EnumType, IStaticEnum} from "../../platform/enum";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";
import {AssetQuotes} from "./assetQuotes";
import {BondQuotes} from "./bondQuotes";
import {CommonAssetQuotes} from "./commonAssetQuotes";
import {CurrencyQuotes} from "./currencyQuotes";
import {EtfQuotes} from "./etfQuotes";
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
                <v-radio-group v-model="currentTab" row class="mt-0 pt-4 pl-4 margB35" @change="onTabSelected" hide-details>
                    <v-radio v-for="item in quotesTypes" :key="item.code" :label="item.description" :value="item" class="pl-1" mandatory></v-radio>
                </v-radio-group>
                <stock-quotes v-if="currentTab === QuotesType.STOCK"></stock-quotes>
                <etf-quotes v-if="currentTab === QuotesType.ETF"></etf-quotes>
                <bond-quotes v-if="currentTab === QuotesType.BOND"></bond-quotes>
                <asset-quotes v-if="currentTab === QuotesType['USER-ASSETS']"></asset-quotes>
                <common-asset-quotes v-if="currentTab === QuotesType['COMMON-ASSETS']"></common-asset-quotes>
                <currency-quotes v-if="currentTab === QuotesType.CURRENCY"></currency-quotes>
            </v-card>
        </v-container>
    `,
    components: {StockQuotes, EtfQuotes, BondQuotes, CurrencyQuotes, AssetQuotes, CommonAssetQuotes}
})
export class QuotesPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    /** Типы котировок */
    private QuotesType = QuotesType;
    /** Типы котировок */
    private quotesTypes = QuotesType.values();
    /** Текущий таб */
    private currentTab: QuotesType = QuotesType.STOCK;

    created(): void {
        this.currentTab = QuotesType.valueByName(this.$route.params.tab.toUpperCase()) || QuotesType.STOCK;
    }

    private onTabSelected(): void {
        this.$router.push({name: "quotes", params: {tab: this.currentTab.code}});
    }
}

@Enum("code")
export class QuotesType extends (EnumType as IStaticEnum<QuotesType>) {

    static readonly STOCK = new QuotesType("stock", "Акции");
    static readonly ETF = new QuotesType("etf", "ПИФы/ETF");
    static readonly BOND = new QuotesType("bond", "Облигации");
    static readonly CURRENCY = new QuotesType("currency", "Валюты");
    static readonly "USER-ASSETS" = new QuotesType("user-assets", "Пользовательские активы");
    static readonly "COMMON-ASSETS" = new QuotesType("common-assets", "Общие активы");

    private constructor(public code: string, public description: string) {
        super();
    }
}
