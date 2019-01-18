import Decimal from "decimal.js";
import * as moment from "moment";
import {Inject} from "typescript-ioc";
import {Component, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {BalancesTable} from "../components/balancesTable";
import {StockTable} from "../components/stockTable";
import {MarketHistoryService} from "../services/marketHistoryService";
import {MarketService} from "../services/marketService";
import {TradeFields, TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {TradeDataHolder} from "../types/trade/tradeDataHolder";
import {Portfolio, Share} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="selectable">
            <v-layout column wrap>
                <v-flex xs12>
                    <v-card>
                        <v-card-title>
                            <span class="headline">Текущие остатки портфеля</span>
                        </v-card-title>
                        <v-card-text>
                            <p>Перечислите все ценные бумаги и денежные остатки в составе портфеля.
                                Старайтесь указывать верную дату и цену покупки бумаг - это повысит точность расчетов.</p>
                            <p>
                                Для максимальной гибкости (чтобы учесть облигации, повторные покупки, дивиденды) вы можете поочередно занести
                                <a href="#/trades">все сделки портфеля</a>
                                <v-tooltip :max-width="250" top>
                                    <i slot="activator" class="far fa-question-circle"></i>
                                    <span>
                                    Через диалог добавления сделки добавляйте одна за другой все события портфеля:
                                    ввод и вывод денег, покупка и продажа бумаг, дивиденды, купоны, уплаченные налоги.
                                    Это наиболее долгий способ заполнить портфель, но в то же время максимально точный и гибкий.
                                </span>
                                </v-tooltip>
                            </p>
                            <div style="height: 50px"/>
                            <v-layout row wrap justify-space-around>
                                <v-flex d-flex xs5>
                                    <v-layout column wrap>
                                        <div class="title">Добавить ценную бумагу</div>
                                        <v-form ref="stockForm" v-model="stockFormIsValid" lazy-validation>
                                            <v-flex>
                                                <v-autocomplete v-model="share"
                                                                required
                                                                :rules="rulesShare"
                                                                label="Тикер | Название ценной бумаги"
                                                                append-icon="fas fa-building"
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
                                                    <v-text-field v-model="date"
                                                                  required
                                                                  :rules="rulesDate"
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
                                            <v-flex>
                                                <ii-number-field v-model="quantity"
                                                                 required
                                                                 :rules="rulesQuantity"
                                                                 append-icon="fas fa-plus"
                                                                 decimals="0"
                                                                 label="Количество"
                                                                 name="quantity"
                                                                 @keyup="calculateOnQuantity"
                                                                 @change="changeOnQuantity"
                                                ></ii-number-field>
                                            </v-flex>
                                            <v-flex class="subtitle" v-if="closePrice !== null">
                                                Цена закрытия: <b>{{ closePrice.amount.toString() }} {{ closePrice.currencySymbol }}</b>
                                                <v-icon color="primary"
                                                        title="указать в цене сделки"
                                                        style="cursor: pointer"
                                                        @click.native="price = closePrice.amount.toString(); calculateOnPrice()"
                                                >fas fa-arrow-alt-circle-down
                                                </v-icon>
                                            </v-flex>
                                            <v-layout wrap>
                                                <v-flex>
                                                    <ii-number-field v-model="price"
                                                                     append-icon="fas fa-money-bill-alt"
                                                                     label="Цена акции"
                                                                     messages="укажите цену акции или стоимость сделки"
                                                                     name="price"
                                                                     required
                                                                     :rules="rulesPrice"
                                                                     @keyup="calculateOnPrice"
                                                    ></ii-number-field>
                                                </v-flex>
                                                <v-flex/>
                                                <ii-number-field v-model="total"
                                                                 append-icon="fas fa-money-bill-alt"
                                                                 decimals="2"
                                                                 label="Стоимость позиции"
                                                                 messages="укажите цену акции или стоимость сделки"
                                                                 name="total"
                                                                 required
                                                                 :rules="rulesPrice"
                                                                 @keyup="calculateOnTotal"
                                                                 @change="changeOnTotal"
                                                ></ii-number-field>
                                            </v-layout>
                                        </v-form>
                                        <v-spacer></v-spacer>
                                        <div>
                                            <v-btn color="primary"
                                                   :loading="processState"
                                                   :disabled="!stockFormIsValid || processState"
                                                   @click.native="addStock()"
                                            >
                                                Добавить
                                                <span slot="loader" class="custom-loader">
                                                <v-icon light>fas fa-spinner fa-spin</v-icon>
                                            </span>
                                            </v-btn>
                                        </div>
                                    </v-layout>
                                </v-flex>
                                <v-flex d-flex xs5>
                                    <v-layout column wrap>
                                        <div class="title">Добавить остатки денежных средств</div>
                                        <v-form ref="moneyForm" v-model="moneyFormIsValid" lazy-validation>
                                            <v-flex xs12>
                                                <v-layout wrap>
                                                    <v-flex xs12 lg8>
                                                        <ii-number-field v-model="moneyField"
                                                                         requered
                                                                         :rules="rulesMoney"
                                                                         append-icon="fas fa-money-bill-alt"
                                                                         decimals="2"
                                                                         label="Сумма"
                                                        ></ii-number-field>
                                                    </v-flex>
                                                    <v-spacer></v-spacer>
                                                    <v-flex xs12 lg3>
                                                        <v-select v-model="moneyCurrency"
                                                                  label="Валюта сделки"
                                                                  :items="currencyList"></v-select>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                        </v-form>
                                        <div>
                                            <v-btn color="primary"
                                                   :loading="processState"
                                                   :disabled="!moneyFormIsValid || processState"
                                                   @click.native="addMoney()"
                                            >
                                                Добавить
                                                <span slot="loader" class="custom-loader">
                                                <v-icon light>fas fa-spinner fa-spin</v-icon>
                                            </span>
                                            </v-btn>
                                        </div>
                                    </v-layout>
                                </v-flex>
                            </v-layout>
                        </v-card-text>
                    </v-card>
                </v-flex>
            </v-layout>
            <v-card>
                <v-card-text class="text-xs-center title">
                    Текущая стоимость портфеля:
                    <a href="#/portfolio" style="text-decoration: none">
                    <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">
                        {{ this.portfolio.overview.dashboardData.currentCost | amount(true) }}
                    </span>
                    </a>
                </v-card-text>
            </v-card>
            <balances-table :assets="portfolio.overview.assetRows" :stocks="portfolio.overview.stockPortfolio.rows" :loading="processState"/>
        </v-container>
    `,
    components: {AssetTable, BalancesTable, StockTable}
})
export class BalancesPage extends UI implements TradeDataHolder {

    $refs: {
        dateMenu: any,
        stockForm: any,
        moneyForm: any
    };

    @Inject
    private marketService: MarketService;

    @Inject
    private marketHistoryService: MarketHistoryService;

    @Inject
    private tradeService: TradeService;

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;

    @MainStore.Getter
    private portfolio: Portfolio;

    private assetType = AssetType.STOCK;

    private changedQuantity = false;

    private changedPrice = false;

    private changedTotal = false;

    private closePrice: BigMoney = null;

    private currency = "RUB";

    private currencyList = ["RUB", "EUR", "USD"];

    /** Текущий объект таймера */
    private currentTimer: number = null;

    private date: string = moment().format("YYYY-MM-DD");

    private dateMenuValue = false;

    private facevalue: string = null;

    private fee: string = null;

    private filteredShares: Share[] = [];

    private keepMoney = false;

    private moneyField: string = null;

    private moneyAmount: string = null;

    private moneyCurrency = "RUB";

    private moneyFormIsValid = true;

    private nkd: string = null;

    private note: string = null;

    private notFoundLabel = "Ничего не найдено";

    private operation: Operation = null;

    private perOne = true;

    private processState = false;

    private price: string = null;

    private rulesDate = [(val: string): boolean | string => !!val || "выберите дату"];

    private rulesMoney = [(val: string): boolean | string => !!val || "укажите цену акции или стоимость сделки"];

    private rulesPrice = [(val: string): boolean | string => !!val || "укажите цену акции или стоимость сделки"];

    private rulesShare = [(val: string): boolean | string => !!val || "выберите акцию"];

    private rulesQuantity = [(val: string): boolean | string => !!val || "укажите количество"];

    private stockFormIsValid = true;

    private quantity: number = null;

    private searchQuery: string = null;

    private share: Share = null;

    private shareSearch = false;

    private total: string = null;

    private valid = true;

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

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        clearTimeout(this.currentTimer);
        if (!this.searchQuery || this.searchQuery.length <= 2) {
            this.shareSearch = false;
            return;
        }
        this.shareSearch = true;
        const delay = new Promise((resolve, reject): void => {
            this.currentTimer = setTimeout(async (): Promise<void> => {
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
        if (!this.$refs.stockForm.validate()) {
            return;
        }
        this.assetType = AssetType.STOCK;
        this.operation = Operation.BUY;
        this.moneyAmount = this.total;
        await this.addTrade();
        await this.$refs.stockForm.reset();
        this.date = moment().format("YYYY-MM-DD");
    }

    private async addMoney(): Promise<void> {
        if (!this.$refs.moneyForm.validate()) {
            return;
        }
        this.assetType = AssetType.MONEY;
        this.operation = Operation.DEPOSIT;
        this.moneyAmount = this.moneyField;
        await this.addTrade();
        await this.$refs.moneyForm.reset();
    }

    private async addTrade(): Promise<void> {
        const trade: TradeFields = {
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
            await this.tradeService.saveTrade({
                portfolioId: this.portfolio.id,
                asset: this.assetType.enumName,
                operation: this.operation.enumName,
                createLinkedTrade: this.keepMoney,
                fields: trade
            });
            await this.reloadPortfolio(this.portfolio.id);
            this.$snotify.info("Баланс успешно сохранен");
            return;
        } catch (e) {
            // for (const errorInfo of errors.fields) {
            //     this.$validator.errors.add({field: errorInfo.name, msg: errorInfo.errorMessage});
            // }
            return;
        } finally {
            this.processState = false;
        }
    }

    private calculateOnQuantity(): void {
        !!this.quantity ? this.changedQuantity = true : this.changedQuantity = false;
        if (this.changedQuantity && this.changedTotal) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
        } else if (this.changedQuantity && this.changedPrice) {
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
        } else if (!this.changedQuantity && this.changedTotal) {
            this.changedPrice = false;
            this.price = "";
        } else if (!this.changedQuantity && this.changedPrice) {
            this.total = "";
        }
    }

    private calculateOnPrice(): void {
        !!this.price ? this.changedPrice = true : this.changedPrice = false;
        if (this.changedPrice && this.changedQuantity) {
            this.changedTotal = false;
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
        } else {
            this.changedTotal = false;
            this.total = "";
        }
    }

    private calculateOnTotal(): void {
        !!this.total ? this.changedTotal = true : this.changedTotal = false;
        if (this.changedTotal && this.changedQuantity) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
        } else {
            this.changedPrice = false;
            this.price = "";
        }
    }

    private changeOnQuantity(): void {
        !!this.quantity ? this.changedQuantity = true : this.changedQuantity = false;
        if (this.changedQuantity && this.changedTotal) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        } else if (this.changedQuantity && this.changedPrice) {
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        }
    }

    private changeOnTotal(): void {
        !!this.total ? this.changedTotal = true : this.changedTotal = false;
        if (this.changedTotal && this.changedQuantity) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        } else {
            this.changedPrice = false;
            this.price = "";
        }
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
