import Decimal from "decimal.js";
import {MaskOptions} from "imask";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {StoreType} from "../vuex/storeType";
import {UI} from "../app/ui";
import {MarketService} from "../services/marketService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {TradeDataHolder} from "../types/trade/tradeDataHolder";
import {TradeMap} from "../types/trade/tradeMap";
import {TradeValue} from "../types/trade/tradeValue";
import {Share, Portfolio, TradeData} from "../types/types";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
    <v-container grid-list-md>
    <v-card>
        <v-card-title>
                <span class="headline">Текущие остатки портфеля</span>
        </v-card-title>
        <v-card-text>
                Перечислите все ценные бумаги и денежные остатки в составе портфеля.
                Старайтесь указывать верную дату и цену покупки бумаг - это повысит точность расчетов.
        </v-card-text>
    </v-card>
    <v-card>
        <v-card-title>
            <span class="title">Добавить ценную бумагу</span>
        </v-card-title>
        <v-card-text>
            <v-flex >
                <v-autocomplete v-model="share"
                                label="Тикер | Название ценной бумаги"
                                append-icon="fas fa-building"
                                cache-items
                                clearable
                                dense
                                name="share"
                                required
                                :error-messages="errors.collect('share')"
                                :hide-no-data="true"
                                :items="filteredShares"
                                :loading="shareSearch"
                                :no-data-text="notFoundLabel"
                                :no-filter="true"
                                :search-input.sync="searchQuery">
                    <template slot="selection" slot-scope="data">
                        {{ shareLabelSelected(data.item) }}
                    </template>
                    <template slot="item" slot-scope="data">
                        {{ shareLabelListItem(data.item) }}
                    </template>
                </v-autocomplete>
            </v-flex>
            <v-flex>
                <v-menu v-model="dateMenuValue"
                        ref="dateMenu"
                        :close-on-content-click="false"
                        :return-value.sync="date"
                        lazy
                        transition="scale-transition"
                        offset-y
                        full-width
                        min-width="290px"
                >
                    <v-text-field  v-model="date"
                                    slot="activator"
                                    label="Дата покупки"
                                    required
                                    append-icon="event"
                                    readonly
                    ></v-text-field>
                    <v-date-picker v-model="date"
                                    locale="ru"
                                    :no-title="true"
                                    :first-day-of-week="1"
                                    @input="$refs.dateMenu.save(date)"
                    ></v-date-picker>
                </v-menu>
            </v-flex>
            <v-flex>
                TODO: Цена закрытия
            </v-flex>
            <v-flex>
                Укажите среднюю цену покупки или стоимость позиции
                <v-text-field v-mask="priceMask"
                                v-model="price"
                                v-validate="'required'"
                                append-icon="fas fa-money-bill-alt"
                                label="Цена акции"
                                name="price"
                                :error-messages="errors.collect('price')"
                                @keyup="calculateTotal"
                ></v-text-field>
            </v-flex>
            <v-flex>
                <v-text-field v-model="quantity"
                                v-validate="'required'"
                                append-icon="fas fa-plus"
                                label="Количество"
                                name="quantity"
                                :error-messages="errors.collect('quantity')"
                                @keyup="calculateTotal"
                ></v-text-field>
                <v-text-field v-model="total"
                                v-validate="'required'"
                                append-icon="fas fa-money-bill-alt"
                                label="Стоимость позиции"
                                name="total"
                                :error-messages="errors.collect('total')"
                                @change="calculatePrice"
                ></v-text-field>
            </v-flex>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" dark
                    :loading="processState" :disabled="processState"
                    @click.native="moneyTrade(false); addTrade('STOCK')"
            >
                Добавить
                <span slot="loader" class="custom-loader">
                    <v-icon light>fas fa-spinner fa-spin</v-icon>
                </span>
            </v-btn>
        </v-card-actions>
    </v-card>
    <v-card>
        <v-card-title>
                <span class="title">Добавить остатки денежных средств</span>
        </v-card-title>
        <v-card-text>
            <v-flex xs12>
                <v-layout wrap>
                    <v-flex xs12 lg8>
                        <v-text-field v-model="moneyAmount"
                                        append-icon="fas fa-money-bill-alt"
                                        label="Сумма" 
                        ></v-text-field>
                    </v-flex>
                    <v-flex xs12 lg4>
                        <v-select v-model="moneyCurrency"
                                    label="Валюта сделки"
                                    :items="currencyList"></v-select>
                    </v-flex>
                </v-layout>
            </v-flex>
        </v-card-text>
        <v-card-actions>
            <v-btn color="primary" dark
                    :loading="processState" :disabled="processState"
                    @click.native="moneyTrade(true); addTrade()"
            >
                Добавить
                <span slot="loader" class="custom-loader">
                    <v-icon light>fas fa-spinner fa-spin</v-icon>
                </span>
            </v-btn>
        </v-card-actions>
    </v-card>
</v-container>
    `
})
export class BalancesPage extends UI implements TradeDataHolder {

    @Inject
    private marketService: MarketService

    @Inject
    private tradeService: TradeService;

    @MainStore.Getter
    private portfolio: Portfolio;

    private assetType = AssetType.STOCK;

    private currency = "RUB";

    private currencyList = ["RUB", "USD"];

    /** Текущий объект таймера */
    private currentTimer: number = null;

    private date = "";

    private dateMenuValue = false;

    private facevalue: string = null;

    private fee: string = null;

    private filteredShares: Share[] = [];

    private keepMoney = true;

    private moneyAmount: string = null;

    private moneyCurrency = "RUB";

    private nkd: string = null;

    private note: string = null;

    private notFoundLabel = "Ничего не найдено";

    private perOne = true;

    private processState = false;

    private price: string = null;

    private priceMask: MaskOptions = {
        mask: Number,
        min: -10000,
        max: 10000,
        scale: 2,
        thousandsSeparator: " "
    };

    private quantity: number = null;

    private share: Share = null;

    private searchQuery: string = null;

    private shareSearch = false;

    private total: string = null;

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
                    this.filteredShares = await this.marketService.searchStocks(this.searchQuery);
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

    private async addTrade(): Promise<void> {
        const operation = (this.assetType === AssetType.STOCK ? Operation.BUY : Operation.DEPOSIT);
        const moneyAmount = (this.assetType === AssetType.STOCK ? this.total : this.moneyAmount);
        const trade: TradeData = {
            ticker: this.shareTicker,
            date: this.getDate(),
            quantity: this.getQuantity(),
            price: this.getPrice(),
            facevalue: this.getFacevalue(),
            nkd: this.getNkd(),
            perOne: this.isPerOne(),
            fee: this.getFee(),
            note: this.getNote(),
            keepMoney: this.isKeepMoney(),
            moneyAmount: moneyAmount,
            currency: this.currency
        };
        this.processState = true;
        try {
            const errors = await this.tradeService.saveTrade({
                portfolioId: this.portfolio.id,
                asset: this.assetType.enumName,
                operation: operation.enumName,
                createLinkedTrade: this.keepMoney,
                fields: trade
            });
            if (!errors) {
                return;
            }
            for (const errorInfo of errors.fields) {
                console.log("M", errorInfo);
                this.$validator.errors.add({field: errorInfo.name, msg: errorInfo.errorMessage});
            }
        } catch (e) {
            console.log("e", e);
            return;
        } finally {
            this.clearForm();
            this.processState = false;
        }
    }

    private calculatePrice(): void {
        this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_DOWN).toString();
        this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toString();
    }

    private calculateTotal(): void {
        if (this.isValid()) {
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
        }
    }

    private clearForm(): void {
        this.share = null;
        this.date = "";
        this.quantity = null;
        this.price = null;
        this.facevalue = null;
        this.nkd = null;
        this.perOne = true;
        this.fee = null;
        this.note = null;
        this.keepMoney = true;
        this.moneyAmount = null;
        this.total = null;
        this.currency = "RUB";
    }

    private moneyTrade(isMoneyTrade: boolean) {
        (isMoneyTrade)? this.assetType = AssetType.MONEY : this.assetType = AssetType.STOCK;
    }

    getShare(): Share {
        return this.share;
    }

    getDate(): string {
        return this.date;
    }

    getQuantity(): number {
        return this.quantity;
    }

    getPrice(): string {
        return this.price;
    }

    getFacevalue(): string {
        return this.facevalue;
    }

    getNkd(): string {
        return this.nkd;
    }

    getFee(): string {
        return this.fee;
    }

    getNote(): string {
        return this.note;
    }

    isKeepMoney(): boolean {
        return this.keepMoney;
    }

    isPerOne(): boolean {
        return this.perOne;
    }

    getMoneyAmount(): string {
        return this.moneyAmount;
    }

    getCurrency(): string {
        return this.currency;
    }

    private isValid(): boolean {
        return !(!this.price || !this.quantity);
    }

    mounted(): void {
        // this.portfolio = this.currentPortfolio;
        // this.share = this.$root.$store.share || null;
        console.log("this.portfolio", this.portfolio);
    }

    private shareLabelListItem(share: Share): string {
        if ((share as any) === this.notFoundLabel) {
            return this.notFoundLabel;
        }
        const price = new BigMoney(share.price);
        return `${share.ticker} (${share.shortname}), ${price.amount.toString()} ${price.currency}`;
    }

    private shareLabelSelected(share: Share): string {
        return `${share.ticker} (${share.shortname})`;
    }

    private get shareTicker(): string {
        return this.share ? this.share.ticker : null;
    }
}
