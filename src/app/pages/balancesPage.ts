import Decimal from "decimal.js";
import {MaskOptions} from "imask";
import * as moment from "moment";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {StockTable} from "../components/stockTable";
import {MarketService} from "../services/marketService";
import {MarketHistoryService} from "../services/marketHistoryService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {TradeDataHolder} from "../types/trade/tradeDataHolder";
import {TradeMap} from "../types/trade/tradeMap";
import {TradeValue} from "../types/trade/tradeValue";
import {Share, Portfolio, TradeData, StockHistoryResponce} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";


const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
    <v-container grid-list-md>
        <v-layout column wrap>
            <dashboard :data="portfolio.overview.dashboardData"></dashboard>
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                            <span class="headline">Текущие остатки портфеля</span>
                    </v-card-title>
                    <v-card-text>
                            <p>Перечислите все ценные бумаги и денежные остатки в составе портфеля.</p>
                            <p>Старайтесь указывать верную дату и цену покупки бумаг - это повысит точность расчетов.</p>
                            <ii-number-field label="Цена акции"></ii-number-field>
                    </v-card-text>
                </v-card>
            </v-flex>
            <v-layout row wrap>
                <v-flex d-flex xs6>
                    <v-card d-flex>
                        <v-card-title>
                            <span class="title">Добавить ценную бумагу</span>
                        </v-card-title>
                        <v-card-text d-flex>
                            <v-form ref="stockForm" v-model="valid" lazy-validation>
                                <v-flex>
                                    <v-autocomplete v-model="share"
                                                    label="Тикер | Название ценной бумаги"
                                                    append-icon="fas fa-building"
                                                    cache-items
                                                    clearable
                                                    dense
                                                    name="share"
                                                    :hide-no-data="true"
                                                    :items="filteredShares"
                                                    :loading="shareSearch"
                                                    :no-data-text="notFoundLabel"
                                                    :no-filter="true"
                                                    :search-input.sync="searchQuery"
                                    >
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
                                            full-width
                                            lazy
                                            min-width="290px"
                                            offset-y
                                            ref="dateMenu"
                                            transition="scale-transition"
                                            :close-on-content-click="false"
                                            :return-value.sync="date"
                                    >
                                        <v-text-field  v-model="date"
                                                        slot="activator"
                                                        label="Дата покупки"
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
                                <v-flex class="subtitle" v-if="closePrice !== null">
                                    Цена закрытия: <b>{{ closePrice.amount }} {{ closePrice.currency }}</b>
                                    <v-btn color="success"
                                            @click.native="price = closePrice.amount"
                                    >
                                        Указать в цене сделки
                                    </v-btn>
                                </v-flex>
                                <v-flex>
                                    Укажите среднюю цену покупки или стоимость позиции
                                    <v-text-field v-mask="priceMask"
                                                    v-model="price"
                                                    append-icon="fas fa-money-bill-alt"
                                                    label="Цена акции"
                                                    name="price"
                                                    @keyup="calculateTotal"
                                    ></v-text-field>
                                </v-flex>
                                <v-flex>
                                    <v-text-field v-model="quantity"
                                                    append-icon="fas fa-plus"
                                                    label="Количество"
                                                    name="quantity"
                                                    @keyup="calculateTotal"
                                    ></v-text-field>
                                    <v-text-field v-model="total"
                                                    append-icon="fas fa-money-bill-alt"
                                                    label="Стоимость позиции"
                                                    name="total"
                                                    @change="calculatePrice"
                                    ></v-text-field>
                                </v-flex>
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="primary" dark
                                    :loading="processState" :disabled="processState"
                                    @click.native="addStock()"
                            >
                                Добавить
                                <span slot="loader" class="custom-loader">
                                    <v-icon light>fas fa-spinner fa-spin</v-icon>
                                </span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
                <v-flex d-flex xs6>
                    <v-card>
                        <v-card-title>
                                <span class="title">Добавить остатки денежных средств</span>
                        </v-card-title>
                        <v-card-text d-flex>
                            <v-form ref="moneyForm" v-model="valid" lazy-validation>
                                <v-flex xs12>
                                    <v-layout wrap>
                                        <v-flex xs12 lg8>
                                            <v-text-field v-model="moneyField"
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
                            </v-form>
                        </v-card-text>
                        <v-card-actions>
                            <v-btn color="primary" dark
                                    :loading="processState"
                                    :disabled="processState"
                                    @click.native="addMoney()"
                            >
                                Добавить
                                <span slot="loader" class="custom-loader">
                                    <v-icon light>fas fa-spinner fa-spin</v-icon>
                                </span>
                            </v-btn>
                        </v-card-actions>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-flex xs12>
                    <v-card>
                        <v-card-title>
                                <span class="title">Состав портфеля</span>
                        </v-card-title>
                        <asset-table :assets="portfolio.overview.assetRows"></asset-table>
                    </v-card>
            </v-flex>
            <v-flex xs12>
                <v-card>
                    <v-card-title>
                            <span class="title">Акции</span>
                    </v-card-title>
                    <stock-table :rows="portfolio.overview.stockPortfolio.rows" :loading="processState"></stock-table>
                </v-card>
            </v-flex>
        </v-layout>
    </v-container>
    `,
    components: {AssetTable, StockTable}
})
export class BalancesPage extends UI implements TradeDataHolder {

    $refs: {
        dateMenu: any,
        stockForm: any,
        moneyForm: any
    };

    @Inject
    private marketService: MarketService
    
    @Inject
    private marketHistoryService: MarketHistoryService;
    
    @Inject
    private tradeService: TradeService;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    @MainStore.Getter
    private portfolio: Portfolio;

    private assetType = AssetType.STOCK;

    private closePrice: BigMoney = null;

    private currency = "RUB";

    private currencyList = ["RUB", "USD"];

    /** Текущий объект таймера */
    private currentTimer: number = null;

    private date: string = moment().format("YYYY-MM-DD");

    private dateMenuValue = false;

    private facevalue: string = null;

    private fee: string = null;

    private filteredShares: Share[] = [];

    private keepMoney = true;

    private moneyField: string = null;

    private moneyAmount: string = null;

    private moneyCurrency = "RUB";

    private nkd: string = null;

    private note: string = null;

    private notFoundLabel = "Ничего не найдено";

    private operation: Operation = null;

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

    private valid = true;

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

    @Watch("date")
    @Watch("share")
    private async onTickerOrDateChange(): Promise<void> {
        this.closePrice = null;
        if (this.date && this.share) {
            this.closePrice = new BigMoney((await this.marketHistoryService.getStockHistory(this.share.ticker, moment(this.date).format("DD.MM.YYYY"))).stock.price);
        }
    }

    private async addStock(): Promise<void> {
        this.assetType = AssetType.STOCK;
        this.operation = Operation.BUY;
        this.moneyAmount = this.total;
        await this.addTrade();
        this.$refs.stockForm.reset();
        this.date = moment().format("YYYY-MM-DD");
    }

    private async addMoney(): Promise<void> {
        this.assetType = AssetType.MONEY;
        this.operation = Operation.DEPOSIT;
        this.moneyAmount = this.moneyField;
        await this.addTrade();
        this.$refs.moneyForm.reset();
    }

    private async addTrade(): Promise<void> {
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
            moneyAmount: this.moneyAmount,
            currency: this.currency
        };
        this.processState = true;
        try {
            const errors = await this.tradeService.saveTrade({
                portfolioId: this.portfolio.id,
                asset: this.assetType.enumName,
                operation: this.operation.enumName,
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
            this.processState = false;
            await this.reloadPortfolio(this.portfolio.id);
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
