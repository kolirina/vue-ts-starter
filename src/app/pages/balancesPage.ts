import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AssetTable} from "../components/assetTable";
import {BalancesTable} from "../components/balancesTable";
import {PopularPaperDialog} from "../components/dialogs/popularPaperDialog";
import {StockTable} from "../components/stockTable";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketHistoryService} from "../services/marketHistoryService";
import {MarketService} from "../services/marketService";
import {TradeFields, TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {TradeDataHolder} from "../types/trade/tradeDataHolder";
import {CurrencyUnit, ErrorInfo, Portfolio, Share} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid class="selectable">
            <v-layout column wrap>
                <v-flex xs12>
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">Задать текущие остатки портфеля</div>
                        </v-card-title>
                    </v-card>
                    <v-card flat>
                        <v-card-text>
                            <p class="fs14">Перечислите все ценные бумаги и денежные остатки в составе портфеля.
                                Старайтесь указывать верную дату и цену покупки бумаг - это повысит точность расчетов.</p>
                            <p class="fs14">
                                Для максимальной гибкости (чтобы учесть облигации, повторные покупки, дивиденды) вы можете поочередно занести
                                <a href="#/trades" class="decorationNone">все сделки портфеля</a>
                                <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                    Через диалог добавления сделки добавляйте одна за другой все события портфеля:
                                    ввод и вывод денег, покупка и продажа бумаг, дивиденды, купоны, уплаченные налоги.
                                    Это наиболее долгий способ заполнить портфель, но в то же время максимально точный и гибкий.
                                </span>
                                </v-tooltip>
                            </p>

                            <div style="height: 30px"/>

                            <v-layout row wrap justify-space-around>
                                <v-flex d-flex xs5>
                                    <v-layout column wrap>
                                        <div class="title">Добавить ценную бумагу</div>
                                        <v-form ref="stockForm" v-model="stockFormIsValid" class="mt-4" lazy-validation>
                                            <v-layout align-center>
                                                <share-search :asset-type="assetType" :filtered-shares="filteredShares" @change="onShareSelect"
                                                              required :rules="rulesShare"></share-search>
                                                <div class="btn-open-dialog-top-paper">
                                                    <v-btn flat icon color="primary" class="ma-0" @click.stop="popularPaper">
                                                        <v-icon>stars</v-icon>
                                                    </v-btn>
                                                </div>
                                            </v-layout>
                                            <v-flex class="mt-4">
                                                <v-menu v-model="dateMenuValue" full-width lazy min-width="290px" offset-y ref="dateMenu"
                                                        transition="scale-transition" :close-on-content-click="false" :return-value.sync="date">
                                                    <v-text-field v-model="date" required :rules="rulesDate" slot="activator" label="Дата покупки" append-icon="event" readonly>
                                                    </v-text-field>
                                                    <v-date-picker v-model="date" locale="ru" :no-title="true" :first-day-of-week="1" @input="onDateSelected"></v-date-picker>
                                                </v-menu>
                                            </v-flex>
                                            <v-flex class="mt-4">
                                                <ii-number-field v-model="quantity" required :rules="rulesQuantity" :decimals="0" label="Количество" name="quantity"
                                                                 @keyup="calculateOnQuantity" @change="changeOnQuantity">
                                                </ii-number-field>
                                            </v-flex>
                                            <v-layout wrap>
                                                <v-flex class="mt-4">
                                                    <ii-number-field v-model="price" label="Цена акции" :error-messages="errors.collect('price')"
                                                                     name="price" required :rules="rulesPrice" @keyup="calculateOnPrice">
                                                    </ii-number-field>
                                                </v-flex>
                                                <v-flex class="mt-4"></v-flex>
                                                <v-flex class="mt-4">
                                                    <ii-number-field v-model="total" :decimals="2" label="Стоимость позиции" :error-messages="errors.collect('total')"
                                                                     name="total" required :rules="rulesPrice" @keyup="calculateOnTotal" @change="changeOnTotal">
                                                    </ii-number-field>
                                                </v-flex>
                                            </v-layout>
                                            <v-flex class="mt-1" style="font-size: 12px;" v-if="closePrice !== null">
                                                Цена закрытия: <a @click="setClosePrice"
                                                                  title="Указать в качестве цены">{{ closePrice.amount.toString() }} {{ closePrice.currencySymbol }}</a>
                                            </v-flex>
                                        </v-form>
                                        <v-spacer></v-spacer>
                                        <div class="margT20">
                                            <v-btn color="primary" class="big_btn" :loading="processState" :disabled="!stockFormIsValid || processState" @click.native="addStock()">
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
                                        <v-form ref="moneyForm" v-model="moneyFormIsValid" class="mt-4" lazy-validation>
                                            <v-flex xs12>
                                                <v-layout wrap>
                                                    <v-flex xs12 lg8>
                                                        <ii-number-field v-model="moneyField" requered :rules="rulesMoney" :decimals="2" label="Сумма"></ii-number-field>
                                                    </v-flex>
                                                    <v-spacer></v-spacer>
                                                    <v-flex xs12 lg3>
                                                        <v-select v-model="moneyCurrency" label="Валюта сделки" :items="currencyList"></v-select>
                                                    </v-flex>
                                                </v-layout>
                                            </v-flex>
                                        </v-form>
                                        <div class="margT20">
                                            <v-btn color="primary" class="big_btn" :loading="processState"
                                                   :disabled="!moneyFormIsValid || processState" @click.native="addMoney()">
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

            <v-card flat>
                <v-card-text class="text-xs-center title">
                    Текущая стоимость портфеля:
                    <router-link to="portfolio" style="text-decoration: none">
                        <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">
                            {{ this.portfolio.overview.dashboardData.currentCost | amount(true) }}
                        </span>
                    </router-link>
                </v-card-text>
            </v-card>
            <div style="height: 30px"/>
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
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;

    private assetType = AssetType.STOCK;

    private changedQuantity = false;

    private changedPrice = false;

    private changedTotal = false;

    private closePrice: BigMoney = null;

    private currency = "RUB";

    private currencyList = CurrencyUnit.values().map(c => c.code);

    private date = DateUtils.currentDate();

    private dateMenuValue = false;

    private facevalue: string = null;

    private fee: string = null;

    private keepMoney = false;

    private moneyField: string = null;

    private moneyAmount: string = null;

    private moneyCurrency = "RUB";

    private moneyFormIsValid = true;

    private nkd: string = null;

    private note: string = null;

    private operation: Operation = null;

    private perOne = true;

    private processState = false;

    private price: string = null;

    private rulesDate = [(val: string): boolean | string => !!val || "выберите дату"];

    private rulesMoney = [(val: string): boolean | string => !!val || "укажите сумму"];

    private rulesPrice = [(val: string): boolean | string => !!val || "укажите цену акции или стоимость сделки"];

    private rulesShare = [(val: string): boolean | string => !!val || "выберите акцию"];

    private rulesQuantity = [(val: string): boolean | string => !!val || "укажите количество"];

    private stockFormIsValid = true;

    private quantity: number = null;

    private share: Share = null;

    private total: string = null;

    private topShares: Share[] = null;

    private filteredShares: Share[] = null;

    @ShowProgress
    async created(): Promise<void> {
        this.topShares = await this.marketService.loadTopStocks();
    }

    private async popularPaper(): Promise<void> {
        const share: Share = await new PopularPaperDialog().show(this.topShares);
        if (share) {
            this.filteredShares = [share];
            await this.onShareSelect(share);
        }
    }

    private async onDateSelected(date: string): Promise<void> {
        this.$refs.dateMenu.save(date);
        await this.fillFieldsFromShare();
    }

    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        await this.fillFieldsFromShare();
    }

    private setClosePrice(): void {
        this.price = this.closePrice.amount.toString();
        this.calculateOnPrice();
    }

    private async fillFieldsFromShare(): Promise<void> {
        // при очистке поля автокомплита
        if (!this.share) {
            return;
        }
        this.currency = this.share.currency;
        this.closePrice = null;
        if (this.date) {
            this.closePrice = new BigMoney((await this.marketHistoryService.getStockHistory(this.share.ticker,
                dayjs(this.date).format("DD.MM.YYYY"))).price);
        }
    }

    private async addStock(): Promise<void> {
        if (!this.$refs.stockForm.validate()) {
            return;
        }
        this.assetType = AssetType.STOCK;
        this.operation = Operation.BUY;
        this.moneyAmount = this.total;
        this.currency = this.share.currency;
        await this.addTrade();
        await this.$refs.stockForm.reset();
        this.resetForm();
    }

    private async addMoney(): Promise<void> {
        if (!this.$refs.moneyForm.validate()) {
            return;
        }
        this.assetType = AssetType.MONEY;
        this.operation = Operation.DEPOSIT;
        this.moneyAmount = this.moneyField;
        const currentCurrency = this.moneyCurrency;
        this.currency = this.moneyCurrency;
        await this.addTrade();
        await this.$refs.moneyForm.reset();
        this.resetForm();
        this.moneyCurrency = this.currencyList.filter(cur => cur !== currentCurrency)[0] || CurrencyUnit.RUB.code;
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
            this.resetForm();
            this.$snotify.info("Баланс успешно сохранен");
        } catch (e) {
            this.handleError(e);
            return;
        } finally {
            this.processState = false;
        }
    }

    private handleError(error: ErrorInfo): void {
        const validatorFields = this.$validator.fields.items.map(f => f.name);
        for (const errorInfo of error.fields) {
            if (validatorFields.includes(errorInfo.name)) {
                this.$validator.errors.add({field: errorInfo.name, msg: errorInfo.errorMessage});
            }
        }
        if (this.$validator.errors.count() === 0) {
            const globalMessage = TradeUtils.getGlobalMessage(error);
            this.$snotify.error(globalMessage);
        }
    }

    private calculateOnQuantity(): void {
        this.changedQuantity = !!this.quantity;
        if (this.changedQuantity && !!this.total) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
        } else if (this.changedQuantity && !!this.price) {
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
        if (this.changedPrice && !!this.quantity) {
            this.changedTotal = false;
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
        } else {
            this.changedTotal = false;
            this.total = "";
        }
    }

    private calculateOnTotal(): void {
        this.changedTotal = !!this.total;
        if (this.changedTotal && this.changedQuantity) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
        } else {
            this.changedPrice = false;
            this.price = "";
        }
    }

    private changeOnQuantity(): void {
        this.changedQuantity = !!this.quantity;
        if (this.changedQuantity && this.changedTotal) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        } else if (this.changedQuantity && !!this.price) {
            this.total = new Decimal(this.getPrice()).mul(new Decimal(this.getQuantity())).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        }
    }

    private changeOnTotal(): void {
        this.changedTotal = !!this.total;
        if (this.changedTotal && this.changedQuantity) {
            this.changedPrice = false;
            this.price = new Decimal(this.total).dividedBy(new Decimal(this.quantity)).toDecimalPlaces(6, Decimal.ROUND_HALF_UP).toString();
            this.total = new Decimal(this.price).mul(new Decimal(this.quantity)).toDecimalPlaces(2, Decimal.ROUND_HALF_UP).toString();
        } else {
            this.changedPrice = false;
            this.price = "";
        }
    }

    private get shareTicker(): string {
        return this.share ? this.share.ticker : null;
    }

    private resetForm(): void {
        this.closePrice = null;
        this.date = DateUtils.currentDate();
        this.assetType = AssetType.STOCK;
        this.price = null;
        this.total = null;
    }

    // tslint:disable:member-ordering
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
}
