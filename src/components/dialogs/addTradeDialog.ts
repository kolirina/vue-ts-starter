import Component from "vue-class-component";
import {CustomDialog} from "./customDialog";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Watch} from "vue-property-decorator";
import {Portfolio, Share, TradeData} from "../../types/types";
import {Inject} from "typescript-ioc";
import {MarketService} from "../../services/marketService";
import Decimal from "decimal.js";
import {BigMoney} from "../../types/bigMoney";
import {TradeMap} from "../../types/trade/tradeMap";
import {TradeDataHolder} from "../../types/trade/tradeDataHolder";
import {TradeValue} from "../../types/trade/tradeValue";
import {VueRouter} from "vue-router/types/router";
import {MainStore} from "../../vuex/mainStore";


@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" persistent max-width="700px">
            <v-card>
                <v-card-title>
                    <span class="headline">Добавление сделки</span>
                </v-card-title>
                <v-card-text>
                    <v-container grid-list-md>
                        <v-layout wrap>
                            <v-flex xs12 sm6>
                                <v-select :items="assetTypes" v-model="assetType" label="Тип актива" item-text="description"></v-select>
                            </v-flex>

                            <v-flex xs12 sm6>
                                <v-select :items="assetType.operations" v-model="operation" label="Операция" item-text="description"></v-select>
                            </v-flex>

                            <v-flex v-if="shareAssetType" xs12>
                                <v-select :items="filteredShares"
                                          :filter="customFilter"
                                          v-model="share"
                                          label="Тикер / Название компании"
                                          :loading="shareSearch"
                                          :no-data-text="notFoundLabel"
                                          autocomplete
                                          clearable
                                          cache-items
                                          required
                                          prepend-icon="fas fa-building"
                                          :search-input.sync="searchQuery">
                                    <template slot="selection" slot-scope="data">
                                        {{ shareLabelSelected(data.item) }}
                                    </template>
                                    <template slot="item" slot-scope="data">
                                        {{ shareLabelListItem(data.item) }}
                                    </template>
                                </v-select>
                            </v-flex>

                            <v-flex xs12>
                                <v-menu
                                        ref="dateMenu"
                                        :close-on-content-click="false"
                                        v-model="dateMenuValue"
                                        :nudge-right="40"
                                        :return-value.sync="date"
                                        lazy
                                        transition="scale-transition"
                                        offset-y
                                        full-width
                                        min-width="290px">
                                    <v-text-field
                                            slot="activator"
                                            v-model="date"
                                            label="Дата"
                                            required
                                            prepend-icon="event"
                                            readonly></v-text-field>
                                    <v-date-picker v-model="date" @input="$refs.dateMenu.save(date)"></v-date-picker>
                                </v-menu>
                            </v-flex>

                            <v-flex v-if="shareAssetType" xs12>
                                <v-text-field :label="priceLabel" v-model="price"
                                              @keyup="calculateFee"
                                              prepend-icon="fas fa-money-bill-alt"></v-text-field>
                            </v-flex>

                            <v-flex v-if="bondTrade" xs12>
                                <v-text-field label="Номинал" v-model="facevalue"
                                              @keyup="calculateFee"
                                              prepend-icon="fas fa-money-bill"></v-text-field>
                            </v-flex>
                            <v-flex v-if="bondTrade" xs12>
                                <v-layout wrap>
                                    <v-flex xs12 lg6>
                                        <v-text-field label="НКД" v-model="nkd"
                                                      @keyup="calculateFee"
                                                      prepend-icon="fas fa-money-bill-alt"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 lg6>
                                        <v-tooltip top>
                                            <v-checkbox slot="activator" label="НКД на одну облигацию" v-model="perOne"></v-checkbox>
                                            <span>Отключите если вносите суммарный НКД</span>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <v-flex xs12>
                                <v-text-field v-if="shareAssetType"
                                              label="Количество" v-model="quantity"
                                              @keyup="calculateFee"
                                              :hint="lotSizeHint" persistent-hint
                                              prepend-icon="fas fa-plus">
                                </v-text-field>
                            </v-flex>
                            <v-flex xs12>
                                <v-text-field v-if="shareAssetType"
                                              label="Комиссия" v-model="fee"
                                              prepend-icon="fas fa-coins"
                                              hint="Для автоматического рассчета комиссии задайте значение в Настройках или введите значение суммарной комиссии">
                                </v-text-field>
                            </v-flex>

                            <v-flex v-if="moneyTrade" xs12>
                                <v-layout wrap>
                                    <v-flex xs12 lg8>
                                        <v-text-field label="Сумма" v-model="moneyAmount"
                                                      prepend-icon="fas fa-money-bill-alt"></v-text-field>
                                    </v-flex>
                                    <v-flex xs12 lg4>
                                        <v-select :items="currencyList" v-model="moneyCurrency" label="Валюта сделки"></v-select>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <v-flex xs12>
                                <v-text-field label="Заметка" v-model="note" :counter="160" prepend-icon="fas fa-sticky-note"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <v-layout wrap>
                            <v-flex xs12 lg6>
                                <span class="body-2">Сумма сделки: </span><span v-if="total"><b class="title">{{ total }} {{ currency }}</b></span>
                            </v-flex>
                            <v-flex xs12 lg6>
                                <v-checkbox :label="keepMoneyLabel" v-model="keepMoney"></v-checkbox>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small>* обозначает обязательные поля</small>
                </v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="info lighten-2" flat @click.native="cancel">Отмена</v-btn>
                    <v-btn :loading="processState" :disabled="processState" color="primary" dark @click.native="addTrade">
                        Добавить
                        <span slot="loader" class="custom-loader">
                        <v-icon light>fas fa-spinner fa-spin</v-icon>
                      </span>
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    `,
    components: {CustomDialog}
})
export class AddTradeDialog extends CustomDialog<TradeDialogData, boolean> implements TradeDataHolder {

    @Inject
    private marketService: MarketService;

    $refs: {
        dateMenu: any
    };

    private portfolio: Portfolio = null;

    private notFoundLabel = 'Ничего не найдено';

    private assetTypes = AssetType.values();

    private assetType = AssetType.STOCK;

    private operation = Operation.BUY;

    private currencyList = ['RUB', 'USD'];

    private moneyCurrency = 'RUB';

    private share: Share = null;

    private filteredShares: Share[] = [];

    private ticker: string = null;

    private date: Date = null;

    private price: string = null;

    private quantity: number = null;

    private facevalue: string = null;

    private nkd: string = null;

    private fee: string = null;

    private note: string = null;

    private dateMenuValue = false;

    private shareSearch = false;

    private moneyAmount: string = null;

    private keepMoney = true;
    private perOne = true;

    private currency = 'RUB';

    private priceMask = '9999.99';

    private searchQuery: string = null;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    private processState = false;

    private mounted(): void {
        this.portfolio = (this.data.store as any).currentPortfolio;
        this.share = this.data.share || null;
        this.assetType = this.data.assetType || AssetType.STOCK;
        this.operation = this.data.operation || Operation.BUY;
        console.log('ADD TRADE DIALOG2', this.data);
    }

    @Watch("assetType")
    private onAssetTypeChange(newValue: AssetType): void {
        this.operation = this.assetType.operations[0];
    }

    @Watch("searchQuery")
    private async onSearch(): Promise<void> {
        console.log('SEARCH', this.searchQuery);
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

    private get total(): string {
        if (!this.isValid()) {
            return null;
        }
        const total = TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL](this);
        return total;
    }

    private get totalWithoutFee(): string {
        if (!this.isValid()) {
            return null;
        }
        const total = TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL_WF](this);
        return total;
    }

    private isValid(): boolean {
        return !((this.assetType !== AssetType.MONEY && (!this.price || !this.quantity)) || (this.assetType === AssetType.MONEY && !this.moneyAmount));
    }

    private get keepMoneyLabel(): string {
        const toPort = "Зачислить деньги";
        const fromPort = "Списать деньги";
        return Operation.BUY === this.operation || Operation.WITHDRAW === this.operation || Operation.LOSS === this.operation ? fromPort : toPort;
    }

    private get lotSizeHint(): string {
        return 'указывается в штуках.' + (this.share ? ' 1 лот = ' + this.share.lotsize + ' шт.' : '');
    }

    private get priceLabel(): string {
        return [Operation.AMORTIZATION, Operation.COUPON, Operation.DIVIDEND].includes(this.operation) ? 'Начисление' : 'Цена';
    }

    @Watch("share")
    private shareSelect(): void {
        console.log('SELECT SHARE', this.share);
        this.price = new BigMoney(this.share.price).amount.toString();
        this.currency = this.share.currency;
    }

    private calculateFee(): void {
        const fixFee = this.portfolio.portfolioParams.fixFee ? new Decimal(this.portfolio.portfolioParams.fixFee) : null;
        if (fixFee && this.assetType !== AssetType.MONEY) {
            const totalNkd = this.getNkd() && this.getQuantity() ? new Decimal(this.getNkd()).mul(new Decimal(this.isPerOne() ? this.getQuantity() : 1)) :
                new Decimal(0);
            this.fee = this.totalWithoutFee ? new Decimal(this.totalWithoutFee).sub(totalNkd).mul(fixFee)
                .dividedBy(100).toDP(2, Decimal.ROUND_HALF_UP).toString() : this.fee;
        }
    }

    private cancel(): void {
        this.close();
    }

    /**
     * Фильтрация происходит на сервере, дополнительно фильтровать не нужно
     * @param item
     * @param {string} queryText
     * @param {string} itemText
     * @returns {boolean}
     */
    private customFilter(item: any, queryText: string, itemText: string): boolean {
        return true;
    }

    private shareLabelSelected(share: Share): string {
        return `${share.ticker} (${share.shortname})`;
    }

    private shareLabelListItem(share: Share): string {
        if ((share as any) === this.notFoundLabel) {
            return this.notFoundLabel;
        }
        const price = new BigMoney(share.price);
        return `${share.ticker} (${share.shortname}), ${price.amount.toString()} ${price.currency}`;
    }

    private async addTrade(): Promise<void> {
        const trade: TradeData = {
            ticker: this.share.ticker,
            date: this.date,
            quantity: this.quantity,
            price: this.price,
            facevalue: null,
            nkd: null,
            perOne: false,
            fee: this.fee,
            note: this.note,
            keepMoney: true,
            moneyAmount: this.total,
            currency: this.currency
        };
        console.log('ADD', trade);
        this.processState = true;
        setTimeout(() => {
            this.processState = false;
        }, 5000);
        //this.close(true);
    }

    private get shareAssetType(): boolean {
        return this.assetType === AssetType.STOCK || this.assetType === AssetType.BOND;
    }

    private get bondTrade(): boolean {
        return this.assetType === AssetType.BOND && this.operation != Operation.COUPON && this.operation != Operation.AMORTIZATION;
    }

    private get moneyTrade(): boolean {
        return this.assetType === AssetType.MONEY;
    }

    getShare(): Share {
        return this.share;
    }

    getDate(): Date {
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

export type TradeDialogData = {
    store: MainStore,
    router: VueRouter,
    tradeData?: TradeData,
    share?: Share,
    operation?: Operation,
    assetType?: AssetType
}