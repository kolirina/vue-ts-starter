import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import {VueRouter} from "vue-router/types/router";
import {Component, UI} from "../../app/ui";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {AssetCategory, AssetService} from "../../services/assetService";
import {Client, ClientService} from "../../services/clientService";
import {DateTimeService} from "../../services/dateTimeService";
import {EventFields} from "../../services/eventService";
import {MarketHistoryService} from "../../services/marketHistoryService";
import {MarketService} from "../../services/marketService";
import {OverviewService} from "../../services/overviewService";
import {MoneyResiduals, PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {TradeFields, TradeRequest, TradeService} from "../../services/tradeService";
import {AssetType} from "../../types/assetType";
import {BigMoney} from "../../types/bigMoney";
import {ALLOWED_CURRENCIES, Currency} from "../../types/currency";
import {AddTradeEvent, EventType} from "../../types/eventType";
import {Operation} from "../../types/operation";
import {Permission} from "../../types/permission";
import {PortfolioAssetType} from "../../types/portfolioAssetType";
import {TradeDataHolder} from "../../types/trade/tradeDataHolder";
import {TradeMap} from "../../types/trade/tradeMap";
import {TradeValue} from "../../types/trade/tradeValue";
import {Asset, Bond, ErrorInfo, Portfolio, Share, ShareType} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {TariffUtils} from "../../utils/tariffUtils";
import {TradeUtils} from "../../utils/tradeUtils";
import {MainStore} from "../../vuex/mainStore";
import {FeedbackDialog} from "./feedbackDialog";
import {TariffExpiredDialog} from "./tariffExpiredDialog";

@Component({
    // language=Vue
    template: `
        <v-dialog v-model="showed" ref="dialog" persistent max-width="700px">
            <v-card class="dialog-wrap">
                <v-icon class="closeDialog" @click.native="close">close</v-icon>

                <v-card-title class="paddB0">
                    <span class="fs16 bold">{{ dialogTitle }}</span>
                    <span v-if="!editMode && clientInfo && portfolio" class="items-dialog-title fs16 bold">
                        <v-menu bottom content-class="dialog-type-menu" nudge-bottom="20" bottom right max-height="480">
                            <span slot="activator">
                                <span>
                                    {{ portfolio.portfolioParams.name }}
                                </span>
                            </span>
                            <v-list dense>
                                <v-flex>
                                    <div class="menu-text" v-for="portfolioParams in clientInfo.portfolios" :key="portfolioParams.id" @click="setPortfolio(portfolioParams)">
                                        {{ portfolioParams.name }}
                                    </div>
                                </v-flex>
                            </v-list>
                        </v-menu>
                    </span>
                </v-card-title>

                <v-card-text class="paddT0 paddB0">
                    <v-container grid-list-md class="paddT0 paddB0">
                        <v-layout wrap>
                            <!-- Тип актива -->
                            <v-flex xs12 sm6>
                                <v-select :items="assetTypes" v-model="assetType" :return-object="true" label="Тип актива" item-text="description" dense
                                          hide-details @change="onAssetTypeChange"></v-select>
                            </v-flex>

                            <!-- Операция -->
                            <v-flex xs12 sm6>
                                <v-select :items="assetType.operations" v-model="operation" :return-object="true" label="Операция" dense hide-details
                                          item-text="description" @change="onOperationChange"></v-select>
                            </v-flex>

                            <!-- Тикер бумаги -->
                            <v-flex v-if="shareAssetType" xs12 :class="portfolioProModeEnabled ? 'sm6' : 'sm9'">
                                <share-search :asset-type="assetType" :filtered-shares="filteredShares" :placeholder="shareSearchPlaceholder" class="required"
                                              :create-asset-allowed="createAssetAllowed"
                                              @change="onShareSelect" @clear="onShareClear" @requestNewShare="onRequestNewShare"
                                              autofocus ellipsis allow-request></share-search>
                                <!-- Дополнительная информация -->
                                <div v-if="isAssetTrade" class="fs12-opacity mt-1">
                                    <span>
                                        Более подробную информацию об активах вы можете прочитать в
                                        <a @click="goToHelp" title="Управление активами">Справке</a>
                                    </span>
                                </div>
                            </v-flex>

                            <!-- Дата сделки -->
                            <v-flex xs12 :class="isMoneyTrade ? portfolioProModeEnabled ? 'sm6' : '' : 'sm3'">
                                <v-menu ref="dateMenu" :close-on-content-click="false" v-model="dateMenuValue" :nudge-right="40" :return-value.sync="date"
                                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                                    <v-text-field name="date" slot="activator" v-model="date" label="Дата" v-validate="'required'"
                                                  :error-messages="errors.collect('date')" readonly class="required"></v-text-field>
                                    <v-date-picker v-model="date" :no-title="true" locale="ru" :first-day-of-week="1" @input="onDateSelected"></v-date-picker>
                                </v-menu>
                            </v-flex>

                            <!-- Время сделки -->
                            <v-flex v-if="portfolioProModeEnabled" xs12 :class="isMoneyTrade ? 'sm6' : 'sm3'">
                                <v-dialog ref="timeMenu" v-model="timeMenuValue" :return-value.sync="time" persistent lazy full-width width="290px">
                                    <v-text-field slot="activator" v-model="time" label="Время" readonly></v-text-field>
                                    <v-time-picker v-if="timeMenuValue" v-model="time" format="24hr" full-width>
                                        <v-spacer></v-spacer>
                                        <v-btn flat color="primary" @click="timeMenuValue = false">Отмена</v-btn>
                                        <v-btn flat color="primary" @click="$refs.timeMenu.save(time)">OK</v-btn>
                                    </v-time-picker>
                                </v-dialog>
                            </v-flex>

                            <!-- Блок указания данных по добавляемому активу -->
                            <v-layout v-if="newCustomAsset" class="ma-auto" wrap>
                                <!-- Категория актива -->
                                <v-flex xs12 sm6>
                                    <v-select :items="assetCategories" v-model="assetCategory" :return-object="true" label="Категория актива" item-text="description"
                                              dense hide-details></v-select>
                                </v-flex>
                                <!-- Цена -->
                                <v-flex xs12 sm3>
                                    <ii-number-field label="Текущая цена" v-model="assetPrice" class="required" name="assetPrice" v-validate="'required|min_value:0.000001'"
                                                     :error-messages="errors.collect('assetPrice')">
                                    </ii-number-field>
                                </v-flex>
                                <!-- Влюта -->
                                <v-flex xs12 sm3>
                                    <v-select :items="currencyList" v-model="assetCurrency" @change="onNewAssetCurrencyChange" label="Валюта актива"></v-select>
                                </v-flex>
                                <!-- Дополнительная информация -->
                                <v-flex xs12 sm12>
                                    <div class="fs12-opacity mt-1">
                                        <span>
                                            Вы можете настроить дополнительные параметры позже на
                                            <a @click="goToUserAssets" title="Управление активами">странице</a> управления вашими активами
                                        </span>
                                    </div>
                                </v-flex>
                            </v-layout>

                            <!-- Цена -->
                            <v-flex v-if="shareAssetType" xs12 sm6>
                                <ii-number-field :label="priceLabel" v-model="price" class="required" name="price" v-validate="'required|min_value:0.000001'"
                                                 :error-messages="errors.collect('price')" @keyup="calculateFee" persistent-hint maxLength="11"
                                                 :hint="isBondTrade ? 'Указывается в процентах, например, 101.59' : ''">
                                </ii-number-field>
                            </v-flex>

                            <!-- Количество -->
                            <v-flex v-if="shareAssetType" xs12 sm6>
                                <ii-number-field label="Количество" v-model="quantity" @keyup="calculateFee" name="quantity" :decimals="quantityDecimals" maxLength="11"
                                                 v-validate="quantityValidationRule" :error-messages="errors.collect('quantity')" class="required" browser-autocomplete="false">
                                </ii-number-field>
                                <div class="fs12-opacity mt-1">
                                    <span v-if="showCurrentQuantityLabel">
                                        Текущее количество {{ isStockTrade ? "акций" : isAssetTrade ? "" : "облигаций" }}
                                        <a @click="setToQuantity" title="Подставить в Количество">{{ currentCountShareSearch }} шт.</a>
                                    </span>
                                    <span v-else>{{ isAssetTrade ? "" : lotSizeHint }}</span>
                                </div>
                            </v-flex>

                            <!-- Номинал -->
                            <v-flex v-if="isBondTrade" xs12 :class="operation === Operation.REPAYMENT ? 'sm6' : 'sm3'">
                                <ii-number-field label="Номинал" v-model="facevalue" @keyup="calculateFee" :decimals="3" name="facevalue" maxLength="11"
                                                 v-validate="'required|min_value:0.001'" :error-messages="errors.collect('facevalue')" class="required">
                                </ii-number-field>
                            </v-flex>

                            <!-- НКД -->
                            <v-flex v-if="operation !== Operation.REPAYMENT" xs12 sm9>
                                <v-layout wrap>
                                    <v-flex v-if="isBondTrade" xs12 lg6>
                                        <ii-number-field label="НКД" v-model="nkd" @keyup="calculateFee" :decimals="2" name="nkd" maxLength="11"
                                                         v-validate="nkdValidationString" :error-messages="errors.collect('nkd')" class="required">
                                        </ii-number-field>
                                    </v-flex>
                                    <v-flex v-if="calculationAssetType || isBondTrade" xs12 lg6>
                                        <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                                            <v-checkbox slot="activator" label="Начисление на одну бумагу" v-model="perOne"></v-checkbox>
                                            <span>Отключите если вносите сумму начисления</span>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <!-- Комиссия -->
                            <v-flex v-if="shareAssetType && !calculationAssetType" xs12>
                                <ii-number-field label="Комиссия" v-model="fee" :decimals="2" maxLength="11" :hint="feeHint"></ii-number-field>
                            </v-flex>

                            <!-- Сумма денег (для денежной сделки) -->
                            <v-flex v-if="isCurrencyConversion" xs12>
                                <v-layout wrap class="margB16">
                                    <v-flex xs6>
                                        <div class="fs14 margB16">
                                            <v-layout class="select-section" align-center>
                                                <span class="mr-2 pl-1">{{ purchasedCurrencyTitle }}</span>
                                                <v-select :items="purchasedCurrencies" v-model="purchasedCurrency" label="Валюта покупки" single-line
                                                          @change="onChangeExchangeRate"></v-select>
                                            </v-layout>
                                        </div>
                                        <ii-number-field :label="'Сумма в ' +  purchasedCurrency" v-model="moneyAmount" :decimals="2" name="purchased_currency_value"
                                                         v-validate="'required'" :error-messages="errors.collect('purchased_currency_value')"
                                                         class="required" @input="changedPurchasedCurrencyValue" maxLength="11"></ii-number-field>
                                    </v-flex>
                                    <v-flex xs6>
                                        <div class="fs14 margB16">
                                            <v-layout class="select-section" align-center>
                                                <span class="mr-2 pl-1">{{ debitCurrencyTitle }}</span>
                                                <v-select :items="debitCurrencies" v-model="debitCurrency" label="Валюта списания" single-line
                                                          @change="onChangeExchangeRate"></v-select>
                                            </v-layout>
                                        </div>
                                        <ii-number-field :label="'Сумма в ' +  debitCurrency" v-model="debitCurrencyValue" :decimals="2" name="debiting_currency_value"
                                                         v-validate="'required'" :error-messages="errors.collect('debiting_currency_value')"
                                                         class="required" @input="changedDebitingCurrencyValue" maxLength="11"></ii-number-field>
                                    </v-flex>
                                </v-layout>
                                <v-layout wrap class="margB35">
                                    <v-flex xs6>
                                        <div class="fs14 margB16">
                                            <v-layout class="select-section" align-center>
                                                <span class="mr-2 pl-1">Курс валюты</span>
                                            </v-layout>
                                        </div>
                                        <ii-number-field label="Курс валюты" v-model="currencyExchangeRate" :decimals="4" name="currency_exchange_rate"
                                                         v-validate="'required'" :error-messages="errors.collect('currency_exchange_rate')" maxLength="11"
                                                         class="required" @input="changedPurchasedCurrencyValue"></ii-number-field>
                                    </v-flex>
                                    <v-flex xs6>
                                        <div class="fs14 margB16">
                                            <v-layout class="select-section" align-center>
                                                <span class="mr-2 pl-1">Комиссия</span>
                                                <v-select :items="[feeCurrency]" v-model="feeCurrency" label="Валюта комиссии" single-line></v-select>
                                            </v-layout>
                                        </div>
                                        <ii-number-field label="Комиссия" v-model="fee" :decimals="2" maxLength="11"></ii-number-field>
                                    </v-flex>
                                </v-layout>
                            </v-flex>
                            <v-flex v-if="!isCurrencyConversion && isMoneyTrade" xs12>
                                <v-layout wrap>
                                    <v-flex xs12 lg8>
                                        <ii-number-field label="Сумма" v-model="moneyAmount" :decimals="2" name="money_amount" v-validate="'required|min_value:0.01'"
                                                         :error-messages="errors.collect('money_amount')" class="required" key="money-amount" maxLength="18"></ii-number-field>
                                        <div v-if="showFreeBalance" class="fs12-opacity mt-1">
                                            <span>
                                                <span class="fs12-opacity mt-1">В портфеле сейчас:</span>
                                                <a class="fs12" @click="setFreeBalance"
                                                   title="Указать">{{ freeBalance | amount(true) }} {{ freeBalance | currencySymbol }}</a>
                                            </span>
                                        </div>
                                    </v-flex>
                                    <v-flex xs12 lg4>
                                        <v-select :items="currencyList" v-model="moneyCurrency" label="Валюта сделки"></v-select>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <!-- Заметка -->
                            <v-flex xs12>
                                <v-text-field label="Заметка" v-model="note" :counter="160"
                                              v-validate="'max:160'" :error-messages="errors.collect('note')" name="note"></v-text-field>
                            </v-flex>
                        </v-layout>

                        <!-- Итоговая сумма сделки -->
                        <v-layout wrap>
                            <v-flex xs12 lg6>
                                <span class="fs14">Сумма сделки: </span><span v-if="total"><span class="bold">{{ total | number }}</span>
                                <span class="fs12-non-opacity">{{ getCurrency() }}</span></span>
                            </v-flex>
                            <v-flex xs12 lg6>
                                <span class="fs14">Доступно: </span><span v-if="moneyResiduals" class="fs14"><span
                                    class="fs14 bold">{{ moneyResidual | amount(true, 2, true, true) }}</span><span class="fs12-non-opacity pl-1">{{ getCurrency() }}</span></span>
                                <v-checkbox :disabled="keepMoneyDisabled" :label="keepMoneyLabel" v-model="keepMoney" hide-details></v-checkbox>
                            </v-flex>
                        </v-layout>
                        <small class="fs12-opacity">* обозначает обязательные поля</small>
                    </v-container>
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn :loading="processState" :disabled="!isValid || processState" color="primary" dark @click.native="addTrade">
                        {{ editMode ? "Сохранить" : "Добавить" }}
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

    $refs: {
        dateMenu: any,
        timeMenu: any,
    };

    @Inject
    private clientService: ClientService;
    @Inject
    private marketService: MarketService;
    @Inject
    private tradeService: TradeService;
    @Inject
    private portfolioService: PortfolioService;
    @Inject
    private marketHistoryService: MarketHistoryService;
    @Inject
    private overviewService: OverviewService;
    @Inject
    private dateTimeService: DateTimeService;
    @Inject
    private assetService: AssetService;
    /** Информация о клиенте */
    private clientInfo: Client = null;
    /** Выбранный портфель для добавления сделки. По умолчанию текущий */
    private portfolio: Portfolio = null;
    /** Типы возможных активов */
    private assetTypes = AssetType.values();
    /** Типы возможных активов */
    private assetCategories = AssetCategory.values();
    /** Операции */
    private Operation = Operation;
    /** Тип добавляемого актива */
    private assetType = AssetType.STOCK;
    /** Текущий курс для обменной сделки */
    private currencyExchangeRate: string = "";
    /** Покупаемая валюта */
    private purchasedCurrency: string = Currency.USD;
    /** Валюта списания для валютной сделки */
    private debitCurrency: string = Currency.RUB;
    /** Валюта комисии для валютной сделки */
    private feeCurrency: string = Currency.RUB;
    /** Сумма списания по валютной сделке */
    private debitCurrencyValue: string = "";
    /** Операция сделки */
    private operation = Operation.BUY;
    /** Список валют */
    private currencyList = ALLOWED_CURRENCIES;
    /** Валюта сделки по деньгам */
    private moneyCurrency: string = Currency.RUB;
    /** Ценная бумага сделки. Для денег может быть null */
    private share: Share = null;
    /** Текущая цена актива */
    private assetPrice = "";
    /** Тип актива по умолчанию */
    private assetCategory: AssetCategory = AssetCategory.OTHER;
    /** Валюта актива по умолчанию */
    private assetCurrency = Currency.RUB;
    /** Список найденных бумаг для добавления */
    private filteredShares: Share[] = [];

    private tradeId: string = null;

    private editedMoneyTradeId: string = null;

    private date = DateUtils.currentDate();

    private time = DateUtils.currentTime();

    private price: string = null;

    private quantity: number = null;

    private facevalue: string = null;

    private nkd: string = null;

    private fee: string = null;

    private note: string = null;
    /** Период события */
    private eventPeriod: string = null;
    /** Дата события */
    private eventDate: string = null;
    /** Признак исполнения события */
    private processShareEvent: boolean = false;

    private dateMenuValue = false;
    private timeMenuValue = false;

    private moneyAmount: string = null;

    private keepMoneyValue = true;
    private perOne = true;

    private currency: string = Currency.RUB;
    private processState = false;

    private moneyResiduals: MoneyResiduals = null;
    /** Признак доступности профессионального режима */
    private portfolioProModeEnabled = false;
    /** Текущее количество бумаг по которой идёт добавление сделки */
    private currentCountShareSearch: number = null;

    async mounted(): Promise<void> {
        this.clientInfo = await this.clientService.getClientInfo();
        await this.checkAllowedAddTrade();
        this.portfolio = (this.data.store as any).currentPortfolio;
        await this.setDialogParams();
    }

    private async onChangeExchangeRate(): Promise<void> {
        const res = await this.tradeService.getCurrencyFromTo(this.purchasedCurrency, this.debitCurrency, DateUtils.formatDayMonthYear(this.date));
        this.currencyExchangeRate = res.rate;
        this.feeCurrency = this.debitCurrency;
        this.changedPurchasedCurrencyValue();
    }

    private onAssetTypeChange(clearFields: boolean = true): void {
        if (this.data.operation === undefined) {
            this.operation = this.assetType.operations[0];
        } else {
            this.operation = this.data.operation;
        }
        if (clearFields) {
            // исправление бага валидатора https://github.com/logaretm/vee-validate/issues/2109
            this.$nextTick(() => this.clearFields());
        }
    }

    private changedPurchasedCurrencyValue(): void {
        if (!this.moneyAmount || !this.currencyExchangeRate) {
            return;
        }
        this.debitCurrencyValue = new Decimal(this.moneyAmount).mul(new Decimal(this.currencyExchangeRate))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private changedDebitingCurrencyValue(): void {
        if (!this.debitCurrencyValue || !this.currencyExchangeRate) {
            return;
        }
        this.moneyAmount = new Decimal(this.debitCurrencyValue).dividedBy(new Decimal(this.currencyExchangeRate))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private async setDialogParams(): Promise<void> {
        this.assetType = this.data.assetType || AssetType.STOCK;
        this.moneyCurrency = this.data.moneyCurrency || this.portfolio.portfolioParams.viewCurrency;
        this.share = this.data.share || null;
        this.operation = this.data.operation || Operation.BUY;
        await this.updatePortfolioInfo();
        if (this.data.quantity) {
            this.quantity = this.data.quantity;
        }
        if (this.data.date) {
            this.date = TradeUtils.getDateString(this.data.date);
            this.time = TradeUtils.getTimeString(this.data.date);
        }
        if (this.data.ticker || this.data.shareId) {
            await this.setShareFromTicker(this.isAssetTrade ? this.data.shareId : this.data.ticker);
            this.fillFieldsFromShare();
            this.filteredShares = [this.share];
        } else if (this.data.tradeFields) {
            await this.setTradeFields();
        } else if (this.data.eventFields) {
            this.filteredShares = this.share ? [this.share] : [];
            this.fillFieldsFromShare();
            await this.setEventFields();
        } else {
            this.fillFieldsFromShare();
            this.filteredShares = this.share ? [this.share] : [];
        }
        if (this.editMode && this.isCurrencyConversion) {
            this.purchasedCurrency = this.data.tradeFields.currency;
            this.debitCurrency = this.data.tradeFields.linkedTradeFields.currency;
            this.calculateExchangeRate();
            this.changedPurchasedCurrencyValue();
        }
        if (!this.editMode) {
            this.calculateFee();
        }
        this.calculateCurrentShareQuantity();
    }

    private calculateExchangeRate(): void {
        const fee = new Decimal(this.fee ? this.fee : "0");
        this.currencyExchangeRate = new BigMoney(this.data.tradeFields.linkedTradeFields.moneyAmount).amount.abs().plus(this.isCurrencyBuy ? fee.negated() : fee)
            .dividedBy(this.moneyAmount).toDP(4, Decimal.ROUND_HALF_UP).toString();
    }

    /**
     * Загружает и устанавливает информацию о выбранном портфеле
     * @param portfolioParams
     */
    @ShowProgress
    private async setPortfolio(portfolioParams: PortfolioParams): Promise<void> {
        this.portfolio = await this.overviewService.getById(portfolioParams.id);
        await this.updatePortfolioInfo();
    }

    /**
     * Обновляет данные диалога на основе выбранного портфеля
     */
    private async updatePortfolioInfo(): Promise<void> {
        this.portfolioProModeEnabled = TradeUtils.isPortfolioProModeEnabled(this.portfolio, this.clientInfo);
        this.moneyResiduals = await this.portfolioService.getMoneyResiduals(this.portfolio.id);
    }

    private async onTickerOrDateChange(): Promise<void> {
        await this.fillFields();
    }

    private async onOperationChange(): Promise<void> {
        if (this.isCurrencyConversion) {
            await this.onChangeExchangeRate();
        }
        await this.fillFields();
        this.calculateFee();
    }

    private async onNewAssetCurrencyChange(): Promise<void> {
        this.currency = this.assetCurrency;
    }

    private get purchasedCurrencyTitle(): string {
        return this.isCurrencyBuy ? "Покупаемая валюта" : "Продаваемая валюта";
    }

    private get debitCurrencyTitle(): string {
        return this.isCurrencyBuy ? "Валюта списания" : "Валюта зачисления";
    }

    private get isCurrencyConversion(): boolean {
        return this.isCurrencyBuy || this.isCurrencySell;
    }

    private get isCurrencyBuy(): boolean {
        return this.operation === Operation.CURRENCY_BUY;
    }

    private get isCurrencySell(): boolean {
        return this.operation === Operation.CURRENCY_SELL;
    }

    /**
     * Заполняем поля диалога на основе информации бумаги.
     * Ничего не делаем, если у нас событие, все поля уже заполнены и их перезатирать не нужно
     */
    private async fillFields(): Promise<void> {
        if (!this.date || !this.share || this.processShareEvent) {
            return;
        }
        // если это операция начисления, просто получаем данные о количестве и начичлеии.
        const calculationOperation = TradeUtils.isCalculationAssetType(this.operation);
        if (calculationOperation) {
            await this.fillFromSuggestedInfo();
            return;
        }
        // если дата текущая заполняем поля диалога из бумаги
        // иначе пробуем получить данных за прошлые даты
        const date = DateUtils.parseDate(this.date);
        if (DateUtils.isCurrentDate(date)) {
            this.fillFieldsFromShare();
        } else if (DateUtils.isBefore(date)) {
            if (this.assetType === AssetType.STOCK) {
                const stock = (await this.marketHistoryService.getStockHistory(this.share.ticker, dayjs(this.date).format("DD.MM.YYYY")));
                this.setPriceFromStockTypeShare(stock.price);
            } else if (this.assetType === AssetType.ASSET && this.share.id) {
                const asset = (await this.marketHistoryService.getAssetHistory(String(this.share.id), dayjs(this.date).format("DD.MM.YYYY")));
                this.setPriceFromStockTypeShare(asset.price);
            } else if (this.assetType === AssetType.BOND) {
                const bond = (await this.marketHistoryService.getBondHistory(this.share.ticker, dayjs(this.date).format("DD.MM.YYYY")));
                this.fillFieldsFromBond(bond);
            }
        }
    }

    private async fillFromSuggestedInfo(): Promise<void> {
        const suggestedInfo = await this.tradeService.getSuggestedInfo(this.portfolio.id, this.assetType.enumName,
            this.operation.enumName, this.share.ticker, String(this.share.id), this.date);
        if (suggestedInfo) {
            this.quantity = suggestedInfo.quantity;
            this.price = suggestedInfo.amount || this.price;
        }
    }

    /**
     * Осуществляет пересчет фиксированной комиссии
     * Работает для всех типов сделок кроме денежных и кроме Купоны, Амортизации, Погашения, Дивиденда
     */
    private calculateFee(): void {
        const fixFee = this.portfolio.portfolioParams.fixFee ? new Decimal(this.portfolio.portfolioParams.fixFee) : null;
        const calculation = [Operation.REPAYMENT, Operation.COUPON, Operation.AMORTIZATION, Operation.DIVIDEND].includes(this.operation);
        if (fixFee && !fixFee.isZero() && this.assetType !== AssetType.MONEY && !calculation) {
            const totalNkd = this.getNkd() && this.getQuantity() ? new Decimal(this.getNkd()).mul(new Decimal(this.isPerOne() ? this.getQuantity() : 1)) :
                new Decimal(0);
            this.fee = this.totalWithoutFee ? new Decimal(this.totalWithoutFee).sub(totalNkd).mul(fixFee)
                .dividedBy(100).toDP(2, Decimal.ROUND_HALF_UP).toString() : this.fee;
        }
        this.resetFee();
    }

    private async onDateSelected(date: string): Promise<void> {
        this.$refs.dateMenu.save(date);
        if (this.isCurrencyConversion) {
            await this.onChangeExchangeRate();
        }
        await this.onTickerOrDateChange();
    }

    private async onShareSelect(share: Share): Promise<void> {
        if (share && share.shareType === ShareType.ASSET && this.assetType !== AssetType.ASSET) {
            this.assetType = AssetType.ASSET;
        }
        this.share = share;
        this.calculateCurrentShareQuantity();
        this.fillFieldsFromShare();
        await this.onTickerOrDateChange();
    }

    private calculateCurrentShareQuantity(): void {
        this.currentCountShareSearch = null;
        if (this.share) {
            if (this.isStockTrade || (this.share as Asset).category === "STOCK") {
                const row = this.portfolio.overview.stockPortfolio.rows.find(item => item.share.ticker === this.share.ticker);
                this.currentCountShareSearch = row ? Number(row.quantity) : null;
            } else if (this.assetType === AssetType.BOND) {
                const row = this.portfolio.overview.bondPortfolio.rows.find(item => item.bond.ticker === this.share.ticker);
                this.currentCountShareSearch = row ? Number(row.quantity) : null;
            } else if (this.isAssetTrade) {
                const row = this.portfolio.overview.assetPortfolio.rows.find(item => item.asset.id === this.share.id);
                this.currentCountShareSearch = row ? Number(row.quantity) : null;
            }
        }
    }

    private fillFieldsFromShare(): void {
        // при очистке поля автокомплита
        if (!this.share) {
            return;
        }
        this.currency = this.share.currency;
        if (this.assetType === AssetType.STOCK) {
            this.setPriceFromStockTypeShare(this.share.price);
        } else if (this.assetType === AssetType.ASSET) {
            this.setPriceFromStockTypeShare(this.share.price);
        } else if (this.assetType === AssetType.BOND) {
            this.fillFieldsFromBond(this.share as Bond);
        }
    }

    @ShowProgress
    @DisableConcurrentExecution
    private async addTrade(): Promise<void> {
        this.$validator.errors.clear();
        const result = await this.$validator.validateAll();
        if (!result) {
            return;
        }
        const tradeFields: TradeFields = {
            shareId: this.share ? String(this.share.id) : null,
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
            moneyAmount: this.total,
            currency: this.getCurrency(),
            feeCurrency: this.getFeeCurrency(),
        };
        this.processState = true;
        try {
            if (this.editMode) {
                await this.editTrade(tradeFields);
                UI.emit(EventType.TRADE_UPDATED);
            } else {
                if (this.newCustomAsset) {
                    await this.saveAsset(tradeFields);
                }
                await this.saveTrade(tradeFields);
                UI.emit(EventType.TRADE_CREATED, {portfolioId: this.portfolio.id} as AddTradeEvent);
            }
            const msg = this.data.eventFields ? "Событие успешно исполнено" : `Сделка успешно ${this.editMode ? "отредактирована" : "добавлена"}`;
            this.$snotify.info(msg);
            // отправляем в ответе true если выбранный портфель в диалоге совпадает с текущим,
            // так как данные перезагружать не нужно если добавили в другой портфель
            const currentPortfolio = this.portfolio.id === this.clientInfo.currentPortfolioId;
            // сбрасываем кэш выбранного портфеля чтобы при переключении он загрузкился с новой сделкой
            if (!currentPortfolio) {
                this.overviewService.resetCacheForId(this.portfolio.id);
            }
            this.close(currentPortfolio);
        } catch (e) {
            this.handleError(e);
        } finally {
            this.processState = false;
        }
    }

    private async saveAsset(tradeFields: TradeFields): Promise<void> {
        const asset = await this.assetService.saveAsset({
            category: this.assetCategory,
            currency: this.assetCurrency,
            ticker: this.share.shortname,
            name: this.share.shortname,
            price: this.assetPrice,
        });
        this.share.id = asset.id;
        tradeFields.shareId = String(asset.id);
        UI.emit(EventType.ASSET_CREATED);
    }

    private async saveTrade(tradeFields: TradeFields): Promise<void> {
        return this.tradeService.saveTrade({
            portfolioId: this.portfolio.id,
            asset: this.assetType.enumName,
            operation: this.operation.enumName,
            createLinkedTrade: this.isKeepMoney(),
            eventDate: this.eventDate,
            eventPeriod: this.eventPeriod,
            processShareEvent: this.processShareEvent,
            fields: tradeFields,
            linkedTradeRequest: this.getConversionLinkedTrade()
        });
    }

    private async editTrade(tradeFields: TradeFields): Promise<void> {
        return this.tradeService.editTrade({
            tradeId: this.tradeId,
            tableName: TradeUtils.tradeTable(this.assetType, this.operation),
            asset: this.assetType.enumName,
            operation: this.operation.enumName,
            portfolioId: this.portfolio.id,
            createLinkedTrade: this.isKeepMoney(),
            editedMoneyTradeId: this.editedMoneyTradeId,
            fields: tradeFields,
            linkedTradeRequest: this.getConversionLinkedTrade()
        });
    }

    private handleError(error: ErrorInfo): void {
        // если 403 ошибки при добавлении сделок, диалог уже отобразили, больше ошибок показывать не нужно
        if (!CommonUtils.exists(error.fields)) {
            if ((error as any).code !== "403") {
                throw error;
            }
            return;
        }
        const validatorFields = this.$validator.fields.items.map((f: any) => f.name);
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

    private setPriceFromStockTypeShare(price: string): void {
        this.price = TradeUtils.isCalculationAssetType(this.operation) ? "" : TradeUtils.decimal(price);
    }

    /**
     * Заполняет поля диалога из облигации.
     * @param bond выбранная облигация
     */
    private fillFieldsFromBond(bond: Bond): void {
        const nkd = TradeUtils.decimal(bond.accruedint);
        const facevalue = TradeUtils.decimal(bond.facevalue);
        switch (this.operation) {
            case Operation.COUPON:
                this.price = nkd;
                this.facevalue = "";
                this.nkd = "";
                break;
            case Operation.AMORTIZATION:
                this.price = facevalue;
                this.facevalue = "";
                this.nkd = "";
                break;
            case Operation.REPAYMENT:
                this.price = "100.00";
                this.facevalue = facevalue;
                this.nkd = "";
                this.fee = "";
                break;
            default:
                this.price = bond.prevprice;
                this.facevalue = facevalue;
                this.nkd = nkd;
        }
    }

    private clearFields(): void {
        this.currentCountShareSearch = null;
        this.share = null;
        this.filteredShares = [];
        this.date = DateUtils.currentDate();
        this.time = DateUtils.currentTime();
        this.quantity = null;
        this.price = null;
        this.fee = null;
        this.note = "";
        this.nkd = null;
        this.facevalue = null;
        this.moneyAmount = null;
        this.eventDate = null;
        this.eventPeriod = null;
        this.processShareEvent = false;
        this.debitCurrencyValue = null;
        this.debitCurrency = Currency.RUB;
        this.currencyExchangeRate = null;
        this.purchasedCurrency = Currency.USD;
        this.feeCurrency = Currency.RUB;
        this.assetPrice = "";
        this.assetCategory = AssetCategory.OTHER;
        this.assetCurrency = Currency.RUB;
    }

    private resetFee(): void {
        if (!this.autoFeeApplicable) {
            this.fee = "";
        }
    }

    private onShareClear(): void {
        this.price = "";
        this.nkd = "";
        this.facevalue = "";
        this.filteredShares = [];
    }

    private async setTradeFields(): Promise<void> {
        await this.setShareFromTicker(this.isAssetTrade ? this.data.tradeFields.shareId : this.data.tradeFields.ticker);
        this.filteredShares = [this.share];

        this.tradeId = this.data.tradeId;
        this.editedMoneyTradeId = this.data.editedMoneyTradeId;
        this.date = TradeUtils.getDateString(this.data.tradeFields.date);
        this.time = TradeUtils.getTimeString(this.data.tradeFields.date);
        this.quantity = this.data.tradeFields.quantity;
        this.price = this.data.tradeFields.price;
        this.facevalue = TradeUtils.decimal(this.data.tradeFields.facevalue);
        this.nkd = TradeUtils.decimal(this.data.tradeFields.nkd);
        this.perOne = true;
        if (this.isBondTrade && new Decimal(this.nkd).comparedTo(new Decimal("0.01")) < 0) {
            const nkdValue = new Decimal(this.nkd);
            this.perOne = false;
            this.nkd = nkdValue.mul(new Decimal(this.quantity).toDP(2, Decimal.ROUND_HALF_UP)).toString();
        }
        this.fee = TradeUtils.decimal(this.data.tradeFields.fee);
        this.note = this.data.tradeFields.note;
        this.keepMoney = this.data.tradeFields.keepMoney;
        this.moneyAmount = TradeUtils.decimal(this.data.tradeFields.moneyAmount, true);
        this.currency = this.data.tradeFields.currency;
        this.feeCurrency = this.data.tradeFields.feeCurrency;
    }

    private async setShareFromTicker(shareId: string): Promise<void> {
        if (this.assetType === AssetType.STOCK) {
            this.share = (await this.marketService.getStockInfo(shareId)).share;
        } else if (this.assetType === AssetType.ASSET) {
            this.share = (await this.marketService.getAssetInfo(shareId)).share;
        } else if (this.assetType === AssetType.BOND) {
            this.share = (await this.marketService.getBondInfo(shareId)).bond;
        }
    }

    private async setEventFields(): Promise<void> {
        // при погашении нет НКД и комиссий, цена всегда 100%
        if (this.operation === Operation.REPAYMENT) {
            this.price = "100.00";
            this.facevalue = TradeUtils.decimal(this.data.eventFields.amountPerShare);
            this.nkd = "";
            this.fee = "";
        } else {
            this.price = TradeUtils.decimal(this.data.eventFields.amount);
        }
        this.currency = this.share.currency;
        this.quantity = this.data.eventFields.quantity;
        this.note = this.data.eventFields.note;
        this.perOne = this.data.eventFields.perOne;
        this.eventDate = this.data.eventFields.eventDate;
        this.date = TradeUtils.getDateString(this.data.eventFields.eventDate);
        this.eventPeriod = this.data.eventFields.eventPeriod;
        this.processShareEvent = true;
    }

    private setToQuantity(): void {
        this.quantity = this.currentCountShareSearch;
        this.calculateFee();
    }

    /**
     * Возвращает сформированный объект со связанной сделкой по деньгам для валютной сделки
     */
    private getConversionLinkedTrade(): TradeRequest {
        return this.isCurrencyConversion ? {
            portfolioId: this.portfolio.id,
            createLinkedTrade: false,
            asset: this.assetType.enumName,
            operation: (this.isCurrencyBuy ? Operation.WITHDRAW : Operation.DEPOSIT).enumName,
            fields: {
                currency: this.debitCurrency,
                feeCurrency: this.getFeeCurrency(),
                date: this.getDate(),
                facevalue: null,
                fee: "0",
                keepMoney: false,
                moneyAmount: this.getCurrencyConversionMoneyAmount(),
                nkd: null,
                note: null,
                perOne: false,
                price: this.getPrice(),
                quantity: this.getQuantity(),
                ticker: null
            }
        } : null;
    }

    /**
     * Возвращает сумму связанной сделки по деньгам с учетом комиссии
     */
    private getCurrencyConversionMoneyAmount(): string {
        const fee = this.fee ? new Decimal(this.fee) : null;
        if (fee) {
            return new Decimal(this.debitCurrencyValue).add(this.isCurrencyBuy ? fee : fee.negated()).toDP(2, Decimal.ROUND_HALF_UP).toString();
        }
        return this.debitCurrencyValue;
    }

    /**
     * Устанавливает текущий баланс денег в сумму
     */
    private setFreeBalance(): void {
        this.moneyAmount = new BigMoney(this.freeBalance).amount.toString();
    }

    /**
     * Проверяет тариф на активность
     */
    private async checkAllowedAddTrade(): Promise<void> {
        const tariffExpired = TariffUtils.isTariffExpired(this.clientInfo);
        if (tariffExpired) {
            this.close();
            await new TariffExpiredDialog().show(this.data.router);
        }
    }

    private goToUserAssets(): void {
        if (this.data.router.currentRoute.path !== "/quotes/user-assets") {
            this.data.router.push("/quotes/user-assets");
        }
    }

    private goToHelp(): void {
        if (this.data.router.currentRoute.path !== "/help") {
            this.data.router.push("/help");
        }
    }

    /**
     * Вызывает диалог обратной связи для добавления новой бумаги в систему
     * @param newTicket название новой бумаги из компонента поиска
     */
    private async onRequestNewShare(newTicket: string): Promise<void> {
        const message = `Пожалуйста добавьте бумагу ${newTicket} в систему.`;
        await new FeedbackDialog().show({clientInfo: this.clientInfo, message: message});
    }

    private get showFreeBalance(): boolean {
        return this.isMoneyTrade && this.operation === Operation.WITHDRAW && this.freeBalance &&
            new BigMoney(this.freeBalance).amount.comparedTo(new Decimal("0")) > 0;
    }

    private get purchasedCurrencies(): string[] {
        return this.currencyList.filter(currency => currency !== this.debitCurrency);
    }

    private get debitCurrencies(): string[] {
        return this.currencyList.filter(currency => currency !== this.purchasedCurrency);
    }

    private get shareTicker(): string {
        switch (this.assetType) {
            case AssetType.STOCK:
            case AssetType.ASSET:
                return this.share ? this.share.ticker : null;
            case AssetType.BOND:
                return this.share ? (this.share as Bond).isin : null;
        }
        return null;
    }

    private get shareAssetType(): boolean {
        return [AssetType.ASSET, AssetType.STOCK, AssetType.BOND].includes(this.assetType);
    }

    private get isStockTrade(): boolean {
        return this.assetType === AssetType.STOCK;
    }

    private get isAssetTrade(): boolean {
        return this.assetType === AssetType.ASSET;
    }

    private get isBondTrade(): boolean {
        return this.assetType === AssetType.BOND && this.operation !== Operation.COUPON && this.operation !== Operation.AMORTIZATION;
    }

    private get isMoneyTrade(): boolean {
        return this.assetType === AssetType.MONEY;
    }

    private get calculationAssetType(): boolean {
        return TradeUtils.isCalculationAssetType(this.operation);
    }

    private get total(): string {
        if (!this.isValid) {
            return null;
        }
        return TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL](this);
    }

    private get totalWithoutFee(): string {
        if (!this.isValid) {
            return null;
        }
        return TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL_WF](this);
    }

    private get isValid(): boolean {
        const noteValid = CommonUtils.isBlank(this.getNote()) || this.note.length <= 160;
        if (!noteValid) {
            return false;
        }
        switch (this.assetType) {
            case AssetType.STOCK:
            case AssetType.ASSET:
                return this.share && this.date && this.price && this.quantity > 0 && (!this.newCustomAsset || !!this.assetPrice);
            case AssetType.BOND:
                return this.share && this.date && this.price && (!!this.facevalue || [Operation.COUPON, Operation.AMORTIZATION].includes(this.operation)) && this.quantity > 0;
            case AssetType.MONEY:
                return this.date && (this.isCurrencyConversion ? !!this.currencyExchangeRate && !!this.debitCurrencyValue && !!this.moneyAmount : !!this.moneyAmount);
        }
        return false;
    }

    private get keepMoneyLabel(): string {
        const toPort = "Зачислить деньги";
        const fromPort = "Списать деньги";
        return [Operation.BUY, Operation.WITHDRAW, Operation.LOSS, Operation.CURRENCY_BUY].includes(this.operation) ? fromPort : toPort;
    }

    private get lotSizeHint(): string {
        return this.newCustomAsset ? "" : "указывается в штуках." + (this.share && this.assetType === AssetType.STOCK ? " 1 лот = " + this.share.lotsize + " шт." : "");
    }

    private get priceLabel(): string {
        if (this.newCustomAsset) {
            return "Цена покупки";
        }
        return [Operation.AMORTIZATION, Operation.COUPON, Operation.DIVIDEND].includes(this.operation) ? "Начисление" : "Цена";
    }

    private get moneyResidual(): string {
        return (this.moneyResiduals as any)[this.getCurrency()];
    }

    private get keepMoneyDisabled(): boolean {
        return this.assetType === AssetType.MONEY && [Operation.DEPOSIT, Operation.WITHDRAW, Operation.CURRENCY_BUY, Operation.CURRENCY_SELL].includes(this.operation);
    }

    private get keepMoney(): boolean {
        return this.keepMoneyValue || this.keepMoneyDisabled;
    }

    private set keepMoney(newValue: boolean) {
        this.keepMoneyValue = newValue;
    }

    private get nkdValidationString(): string {
        return [Operation.BUY, Operation.SELL].includes(this.operation) ? "required" : "";
    }

    private get editMode(): boolean {
        return !!this.tradeId;
    }

    private get dialogTitle(): string {
        return `${this.editMode ? "Редактирование" : "Добавление"} сделки${this.editMode ? "" : " в"}`;
    }

    private get shareSearchPlaceholder(): string {
        return this.isAssetTrade ? "Наименование" : "Код или название бумаги (компании)";
    }

    private get feeHint(): string {
        return this.autoFeeApplicable ? "Для автоматического рассчета комиссии задайте значение в Настройках или введите значение суммарной комиссии" : "";
    }

    /**
     * Возвращает признак применимости авторасчета комиссии для выбранного типа актива и операции
     */
    private get autoFeeApplicable(): boolean {
        const allowedOperations = [Operation.BUY, Operation.SELL];
        return (this.isStockTrade && allowedOperations.includes(this.operation)) ||
            (this.isAssetTrade && (this.share && ["STOCK", "BOND", "ETF"].includes((this.share as Asset).category))) ||
            (this.isBondTrade && allowedOperations.includes(this.operation));
    }

    private get newCustomAsset(): boolean {
        return this.isAssetTrade && this.share && this.share.id === null;
    }

    private get showCurrentQuantityLabel(): boolean {
        return this.currentCountShareSearch && (this.isStockTrade || this.assetType === AssetType.BOND || this.isAssetTrade);
    }

    private get createAssetAllowed(): boolean {
        return this.clientInfo && this.clientInfo.tariff.hasPermission(Permission.INVESTMENTS);
    }

    private get quantityDecimals(): number {
        return this.isAssetTrade || this.operation === Operation.DIVIDEND ? 6 : 0;
    }

    private get quantityValidationRule(): string {
        return this.isAssetTrade || this.operation === Operation.DIVIDEND ? "required|min_value:0.000001" : "required|min_value:1";
    }

    private get freeBalance(): string {
        if (!this.portfolio) {
            return null;
        }
        const freeBalanceRow = this.portfolio ? this.portfolio.overview.assetRows.find(row => {
            const type = PortfolioAssetType.valueByName(row.type);
            if (type.assetType === AssetType.MONEY && type.currency.code === this.moneyCurrency) {
                return row;
            }
            return null;
        }) : null;
        return freeBalanceRow ? freeBalanceRow.currCost : null;
    }

    // tslint:disable
    getShare(): Share {
        return this.share;
    }

    getDate(): string {
        const time = DateUtils.isCurrentDate(DateUtils.parseDate(this.date)) ? this.dateTimeService.getCurrentTime() : "12:00";
        return this.portfolioProModeEnabled ? `${this.date} ${this.time}` : `${this.date} ${time}`;
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
        if (this.isCurrencyConversion) {
            return this.purchasedCurrency;
        }
        return this.assetType === AssetType.MONEY ? this.moneyCurrency : this.currency;
    }

    getFeeCurrency(): string {
        if (this.isCurrencyConversion) {
            return this.feeCurrency;
        }
        return this.assetType === AssetType.MONEY ? this.moneyCurrency : this.currency;
    }

    // tslint:enable
}

export type TradeDialogData = {
    store: MainStore,
    router: VueRouter,
    tradeId?: string,
    editedMoneyTradeId?: string,
    tradeFields?: TradeFields,
    share?: Share,
    ticker?: string,
    shareId?: string,
    quantity?: number,
    date?: string,
    eventFields?: EventFields,
    operation?: Operation,
    assetType?: AssetType,
    moneyCurrency?: string
};
