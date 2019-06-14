import dayjs from "dayjs";
import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {VueRouter} from "vue-router/types/router";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {CustomDialog} from "../../platform/dialogs/customDialog";
import {Client, ClientService} from "../../services/clientService";
import {DateTimeService} from "../../services/dateTimeService";
import {EventFields} from "../../services/eventService";
import {MarketHistoryService} from "../../services/marketHistoryService";
import {MarketService} from "../../services/marketService";
import {OverviewService} from "../../services/overviewService";
import {MoneyResiduals, PortfolioParams, PortfolioService} from "../../services/portfolioService";
import {TradeFields, TradeService} from "../../services/tradeService";
import {AssetType} from "../../types/assetType";
import {Operation} from "../../types/operation";
import {Tariff} from "../../types/tariff";
import {TradeDataHolder} from "../../types/trade/tradeDataHolder";
import {TradeMap} from "../../types/trade/tradeMap";
import {TradeValue} from "../../types/trade/tradeValue";
import {Bond, CurrencyUnit, ErrorInfo, Portfolio, Share, Stock} from "../../types/types";
import {CommonUtils} from "../../utils/commonUtils";
import {DateUtils} from "../../utils/dateUtils";
import {TradeUtils} from "../../utils/tradeUtils";
import {MainStore} from "../../vuex/mainStore";
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
                                <share-search :asset-type="assetType" :filtered-shares="filteredShares"
                                              placeholder="Тикер или название компании" class="required"
                                              @change="onShareSelect" @clear="onShareClear" autofocus></share-search>
                            </v-flex>

                            <!-- Дата сделки -->
                            <v-flex xs12 :class="moneyTrade ? portfolioProModeEnabled ? 'sm6' : '' : 'sm3'">
                                <v-menu ref="dateMenu" :close-on-content-click="false" v-model="dateMenuValue" :nudge-right="40" :return-value.sync="date"
                                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                                    <v-text-field name="date" slot="activator" v-model="date" label="Дата" v-validate="'required'"
                                                  :error-messages="errors.collect('date')" readonly class="required"></v-text-field>
                                    <v-date-picker v-model="date" :no-title="true" locale="ru" :first-day-of-week="1" @input="onDateSelected"></v-date-picker>
                                </v-menu>
                            </v-flex>

                            <!-- Время сделки -->
                            <v-flex v-if="portfolioProModeEnabled" xs12 :class="moneyTrade ? 'sm6' : 'sm3'">
                                <v-dialog ref="timeMenu" v-model="timeMenuValue" :return-value.sync="time" persistent lazy full-width width="290px">
                                    <v-text-field slot="activator" v-model="time" label="Время" readonly></v-text-field>
                                    <v-time-picker v-if="timeMenuValue" v-model="time" format="24hr" full-width>
                                        <v-spacer></v-spacer>
                                        <v-btn flat color="primary" @click="timeMenuValue = false">Отмена</v-btn>
                                        <v-btn flat color="primary" @click="$refs.timeMenu.save(time)">OK</v-btn>
                                    </v-time-picker>
                                </v-dialog>
                            </v-flex>

                            <!-- Цена -->
                            <v-flex v-if="shareAssetType" xs12 sm6>
                                <ii-number-field :label="priceLabel" v-model="price" class="required" name="price" v-validate="'required|min_value:0.000001'"
                                                 :error-messages="errors.collect('price')" @keyup="calculateFee">
                                </ii-number-field>
                            </v-flex>

                            <!-- Количество -->
                            <v-flex v-if="shareAssetType" xs12 sm6>
                                <ii-number-field label="Количество" v-model="quantity" @keyup="calculateFee" :hint="lotSizeHint"
                                                 persistent-hint name="quantity" :decimals="0"
                                                 v-validate="'required|min_value:1'" :error-messages="errors.collect('quantity')" class="required" browser-autocomplete="false">
                                </ii-number-field>
                            </v-flex>

                            <!-- Номинал -->
                            <v-flex v-if="bondTrade" xs12 sm3>
                                <ii-number-field label="Номинал" v-model="facevalue" @keyup="calculateFee" :decimals="2" name="facevalue"
                                                 v-validate="'required|min_value:0.01'" :error-messages="errors.collect('facevalue')" class="required">
                                </ii-number-field>
                            </v-flex>

                            <!-- НКД -->
                            <v-flex xs12 sm9>
                                <v-layout wrap>
                                    <v-flex v-if="bondTrade" xs12 lg6>
                                        <ii-number-field label="НКД" v-model="nkd" @keyup="calculateFee" :decimals="2" name="nkd"
                                                         v-validate="nkdValidationString" :error-messages="errors.collect('nkd')" class="required">
                                        </ii-number-field>
                                    </v-flex>
                                    <v-flex v-if="calculationAssetType || bondTrade" xs12 lg6>
                                        <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" top>
                                            <v-checkbox slot="activator" label="Начисление на одну бумагу" v-model="perOne"></v-checkbox>
                                            <span>Отключите если вносите сумму начисления</span>
                                        </v-tooltip>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <!-- Комиссия -->
                            <v-flex v-if="shareAssetType && !calculationAssetType" xs12>
                                <ii-number-field label="Комиссия" v-model="fee" :decimals="2"
                                                 hint="Для автоматического рассчета комиссии задайте значение в Настройках или введите значение суммарной комиссии">
                                </ii-number-field>
                            </v-flex>

                            <!-- Сумма денег (для денежной сделки) -->
                            <v-flex v-if="moneyTrade" xs12>
                                <v-layout wrap>
                                    <v-flex xs12 lg8>
                                        <ii-number-field label="Сумма" v-model="moneyAmount" :decimals="2" name="money_amount" v-validate="'required|min_value:0.01'"
                                                         :error-messages="errors.collect('money_amount')" class="required"></ii-number-field>
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
                                    class="fs14 bold">{{ moneyResidual | amount }}</span><span class="fs12-non-opacity pl-1">{{ getCurrency() }}</span></span>
                                <v-checkbox :disabled="keepMoneyDisabled" :label="keepMoneyLabel" v-model="keepMoney" hide-details></v-checkbox>
                            </v-flex>
                        </v-layout>
                    </v-container>
                    <small class="fs12">* обозначает обязательные поля</small>
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
    /** Информация о клиенте */
    private clientInfo: Client = null;
    /** Операции начислений */
    private readonly CALCULATION_OPERATIONS = [Operation.COUPON, Operation.DIVIDEND, Operation.AMORTIZATION];
    /** Выбранный портфель для добавления сделки. По умолчанию текущий */
    private portfolio: Portfolio = null;

    private assetTypes = AssetType.values();
    private Operation = Operation;

    private assetType = AssetType.STOCK;

    private operation = Operation.BUY;

    private currencyList = CurrencyUnit.values().map(c => c.code);

    private moneyCurrency = "RUB";

    private share: Share = null;

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

    private currency = "RUB";
    private processState = false;

    private moneyResiduals: MoneyResiduals = null;
    /** Признак доступности профессионального режима */
    private portfolioProModeEnabled = false;

    async mounted(): Promise<void> {
        this.clientInfo = await this.clientService.getClientInfo();
        await this.checkAllowedAddTrade();
        this.portfolio = (this.data.store as any).currentPortfolio;
        await this.setDialogParams();
    }

    private onAssetTypeChange(): void {
        if (this.data.operation === undefined) {
            this.operation = this.assetType.operations[0];
        } else {
            this.operation = this.data.operation;
        }
        this.clearFields();
    }

    private async setDialogParams(): Promise<void> {
        this.assetType = this.data.assetType || AssetType.STOCK;
        this.moneyCurrency = this.data.moneyCurrency || "RUB";
        this.share = this.data.share || null;
        this.operation = this.data.operation || Operation.BUY;
        await this.updatePortfolioInfo();
        if (this.data.quantity) {
            this.quantity = this.data.quantity;
        }
        if (this.data.ticker) {
            await this.setShareFromTicker(this.data.ticker);
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
        await this.fillFields();
    }

    /**
     * Заполняем поля диалога на основе информации бумаги.
     * Ничего не делаем, если у нас событие, все поля уже заполнены и их перезатирать не нужно
     */
    private async fillFields(): Promise<void> {
        if (!this.date || !this.share || this.processShareEvent) {
            return;
        }
        const date = DateUtils.parseDate(this.date);
        // если дата текущая заполняем поля диалога из бумаги
        // иначе пробуем получить данных за прошлые даты
        if (DateUtils.isCurrentDate(date)) {
            this.fillFieldsFromShare();
        } else if (DateUtils.isBefore(date)) {
            const calculationOperation = this.CALCULATION_OPERATIONS.includes(this.operation);
            if (calculationOperation) {
                await this.fillFromSuggestedInfo();
                return;
            }
            if (this.assetType === AssetType.STOCK) {
                const stock = (await this.marketHistoryService.getStockHistory(this.share.ticker, dayjs(this.date).format("DD.MM.YYYY")));
                this.fillFieldsFromStock(stock);
            } else if (this.assetType === AssetType.BOND) {
                const bond = (await this.marketHistoryService.getBondHistory(this.share.ticker, dayjs(this.date).format("DD.MM.YYYY")));
                this.fillFieldsFromBond(bond);
            }
        }
    }

    private async fillFromSuggestedInfo(): Promise<void> {
        const suggestedInfo = await this.tradeService.getSuggestedInfo(this.portfolio.id, this.assetType.enumName,
            this.operation.enumName, this.share.ticker, this.date);
        if (suggestedInfo) {
            this.quantity = suggestedInfo.quantity;
            this.price = suggestedInfo.amount || this.price;
        }
    }

    private calculateFee(): void {
        const fixFee = this.portfolio.portfolioParams.fixFee ? new Decimal(this.portfolio.portfolioParams.fixFee) : null;
        if (fixFee && !fixFee.isZero() && this.assetType !== AssetType.MONEY) {
            const totalNkd = this.getNkd() && this.getQuantity() ? new Decimal(this.getNkd()).mul(new Decimal(this.isPerOne() ? this.getQuantity() : 1)) :
                new Decimal(0);
            this.fee = this.totalWithoutFee ? new Decimal(this.totalWithoutFee).sub(totalNkd).mul(fixFee)
                .dividedBy(100).toDP(2, Decimal.ROUND_HALF_UP).toString() : this.fee;
        }
    }

    private async onDateSelected(date: string): Promise<void> {
        this.$refs.dateMenu.save(date);
        await this.onTickerOrDateChange();
    }

    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        this.fillFieldsFromShare();
        await this.onTickerOrDateChange();
    }

    private fillFieldsFromShare(): void {
        // при очистке поля автокомплита
        if (!this.share) {
            return;
        }
        this.currency = this.share.currency;
        if (this.assetType === AssetType.STOCK) {
            this.fillFieldsFromStock(this.share as Stock);
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
            currency: this.getCurrency()
        };
        this.processState = true;
        try {
            if (this.editMode) {
                await this.editTrade(tradeFields);
            } else {
                await this.saveTrade(tradeFields);
            }

            this.$snotify.info(`Сделка успешно ${this.editMode ? "отредактирована" : "добавлена"}`);
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

    private async saveTrade(tradeFields: TradeFields): Promise<void> {
        return this.tradeService.saveTrade({
            portfolioId: this.portfolio.id,
            asset: this.assetType.enumName,
            operation: this.operation.enumName,
            createLinkedTrade: this.isKeepMoney(),
            eventDate: this.eventDate,
            eventPeriod: this.eventPeriod,
            processShareEvent: this.processShareEvent,
            fields: tradeFields
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
            fields: tradeFields
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

    private fillFieldsFromStock(stock: Stock): void {
        this.price = this.CALCULATION_OPERATIONS.includes(this.operation) ? "" : TradeUtils.decimal(stock.price);
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
            default:
                this.price = bond.prevprice;
                this.facevalue = facevalue;
                this.nkd = nkd;
        }
    }

    private clearFields(): void {
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
    }

    private onShareClear(): void {
        this.price = "";
        this.nkd = "";
        this.facevalue = "";
        this.filteredShares = [];
    }

    private async setTradeFields(): Promise<void> {
        await this.setShareFromTicker(this.data.tradeFields.ticker);
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
        this.fee = TradeUtils.decimal(this.data.tradeFields.fee);
        this.note = this.data.tradeFields.note;
        this.keepMoney = this.data.tradeFields.keepMoney;
        this.moneyAmount = TradeUtils.decimal(this.data.tradeFields.moneyAmount, true);
        this.currency = this.data.tradeFields.currency;
    }

    private async setShareFromTicker(ticker: string): Promise<void> {
        if (this.assetType === AssetType.STOCK) {
            this.share = (await this.marketService.getStockInfo(ticker)).stock;
        } else if (this.assetType === AssetType.BOND) {
            this.share = (await this.marketService.getBondInfo(ticker)).bond;
        }
    }

    private async setEventFields(): Promise<void> {
        // при погашении нет НКД и комиссий, цена всегда 100%
        if (this.operation === Operation.REPAYMENT) {
            this.price = "100.00";
            this.facevalue = TradeUtils.decimal(this.data.eventFields.amount);
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

    private get shareTicker(): string {
        switch (this.assetType) {
            case AssetType.STOCK:
                return this.share ? this.share.ticker : null;
            case AssetType.BOND:
                return this.share ? (this.share as Bond).isin : null;
        }
        return null;
    }

    private get shareAssetType(): boolean {
        return this.assetType === AssetType.STOCK || this.assetType === AssetType.BOND;
    }

    private get bondTrade(): boolean {
        return this.assetType === AssetType.BOND && this.operation !== Operation.COUPON && this.operation !== Operation.AMORTIZATION;
    }

    private get moneyTrade(): boolean {
        return this.assetType === AssetType.MONEY;
    }

    private get calculationAssetType(): boolean {
        return [Operation.DIVIDEND, Operation.COUPON, Operation.AMORTIZATION].includes(this.operation);
    }

    private get total(): string {
        if (!this.isValid) {
            return null;
        }
        const total = TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL](this);
        return total;
    }

    private get totalWithoutFee(): string {
        if (!this.isValid) {
            return null;
        }
        const total = TradeMap.TRADE_CLASSES[this.assetType.enumName][this.operation.enumName][TradeValue.TOTAL_WF](this);
        return total;
    }

    private get isValid(): boolean {
        const noteValid = CommonUtils.isBlank(this.getNote()) || this.note.length <= 160;
        if (!noteValid) {
            return false;
        }
        switch (this.assetType) {
            case AssetType.STOCK:
                return this.share && this.date && this.price && this.quantity > 0;
            case AssetType.BOND:
                return this.share && this.date && this.price && (!!this.facevalue || [Operation.COUPON, Operation.AMORTIZATION].includes(this.operation)) && this.quantity > 0;
            case AssetType.MONEY:
                return !!this.date && !!this.moneyAmount;
        }
        return false;
    }

    private get keepMoneyLabel(): string {
        const toPort = "Зачислить деньги";
        const fromPort = "Списать деньги";
        return Operation.BUY === this.operation || Operation.WITHDRAW === this.operation || Operation.LOSS === this.operation ? fromPort : toPort;
    }

    private get lotSizeHint(): string {
        return "указывается в штуках." + (this.share && this.assetType === AssetType.STOCK ? " 1 лот = " + this.share.lotsize + " шт." : "");
    }

    private get priceLabel(): string {
        return [Operation.AMORTIZATION, Operation.COUPON, Operation.DIVIDEND].includes(this.operation) ? "Начисление" : "Цена";
    }

    private get moneyResidual(): string {
        return (this.moneyResiduals as any)[this.getCurrency()];
    }

    private get keepMoneyDisabled(): boolean {
        return this.assetType === AssetType.MONEY && [Operation.DEPOSIT, Operation.WITHDRAW].includes(this.operation);
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

    /**
     * Проверяет тариф на активность
     */
    private async checkAllowedAddTrade(): Promise<void> {
        const tariffExpired = this.clientInfo.tariff !== Tariff.FREE && DateUtils.parseDate(this.clientInfo.paidTill).isBefore(dayjs());
        if (tariffExpired) {
            this.close();
            await new TariffExpiredDialog().show(this.data.router);
        }
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
    quantity?: number,
    eventFields?: EventFields,
    operation?: Operation,
    assetType?: AssetType,
    moneyCurrency?: string
};
