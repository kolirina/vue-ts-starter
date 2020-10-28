import {Decimal} from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component, namespace, UI, Watch} from "../app/ui";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {Filters} from "../platform/filters/Filters";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {CalculateRow, RebalancingAggregateRow, RebalancingService, RebalancingType, ShareRow} from "../services/rebalancingService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Currency, CurrencyUnit} from "../types/currency";
import {EventType} from "../types/eventType";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {InstrumentRebalancingModel, InstrumentRebalancingRow, Pagination, Portfolio, RebalancingModel, Share, ShareType, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {StoreType} from "../vuex/storeType";
import {PortfolioBasedPage} from "./portfolioBasedPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container class="rebalancing">
            <div class="section-title">Ребалансировка</div>
            <v-card v-if="!emptyRows">
                <div class="section-padding">
                    <div v-if="isStepVisible(0)" class="info-block">
                        <b>Ребалансировка</b> - это процедура, позволяющаяя увеличить доходность портфеля.
                        Вы продаете подорожавшие активы и покупаете подешевевшие.<br/>
                        Сохраняя при этом заранее выбранные доли в портфеле.
                        <br/><br/>
                        Возможна также только покупка активов для выправления долей,
                        если вы не хотите продавать активы, а только распределить денежные средства.
                        <br/>
                        Следуйте инструкциям на экране для ребанасировки вашего портфеля акций.
                    </div>
                    <div v-if="isStepVisible(0)" class="dividing-line"></div>

                    <v-flex v-if="isStepVisible(0)" xs12>
                        <v-card-title class="paddT0 paddL0">
                            <span>Свободные денежные средства</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Вы можете распределить сумму свободных денежных средств в портфеле
                                    как целиком, так и частично. Если хотите распределить больше или
                                    просто узнать сколько вам необходимо купить, введите свое значение.
                                </span>
                            </v-tooltip>
                        </v-card-title>
                        <v-layout wrap align-center row fill-height>
                            <v-flex xs12>
                                <v-layout row fill-height>
                                    <v-flex class="sumField">
                                        <ii-number-field label="Сумма" v-model="moneyAmount" :decimals="2" name="money_amount" :error-messages="errors.collect('money_amount')"
                                                         key="money-amount" maxLength="18"></ii-number-field>
                                    </v-flex>
                                    <div class="w100 pl-2">
                                        <v-text-field :value="currency" label="Валюта" disabled class="currencyField"></v-text-field>
                                    </div>
                                    <v-btn v-if="!isStepVisible(1)" @click="nextStep" color="primary" class="btn margL16">
                                        Далее
                                    </v-btn>
                                </v-layout>
                                <div>
                                    <span v-if="showFreeBalanceHint" class="margL16">
                                        <span class="fs12-opacity mt-1">В портфеле сейчас:</span>
                                        <a class="fs12" @click="setFreeBalance"
                                           title="Распределить">{{ freeBalance | amount(true) }} {{ freeBalance | currencySymbol }}</a>
                                    </span>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-flex>
                    <div v-if="isStepVisible(1)" class="dividing-line"></div>

                    <v-fade-transition>
                        <v-flex v-if="isStepVisible(1)" xs12>
                            <v-card-title class="paddT0 paddL0">
                                <span>Распределение долей</span>
                                <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                        Вы можете оставить текущие доли в портфеле или же задать целевые доли,
                                        к которым хотите привести активы.
                                    </span>
                                </v-tooltip>
                            </v-card-title>
                            <v-flex xs12 sm6>
                                <v-radio-group v-model="rebalancingType" class="margT0">
                                    <v-radio v-for="type in [RebalancingType.BY_AMOUNT, RebalancingType.BY_PERCENT]" :key="type.code" :label="type.description"
                                             :value="type" @change="onRebalancingTypeChange"></v-radio>
                                </v-radio-group>
                            </v-flex>
                            <v-btn v-if="!isStepVisible(2)" @click="nextStep" color="primary" class="btn">
                                Далее
                            </v-btn>
                        </v-flex>
                    </v-fade-transition>
                </div>

                <v-fade-transition>
                    <v-flex v-if="isStepVisible(2)" xs12 class="rebalancingTbl">
                        <p class="text-xs-right fs14 margR28">
                            <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="100" :nudge-bottom="25" bottom>
                                <a slot="activator">Расширенные настройки</a>

                                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                                    <v-layout justify-center column fill-height>
                                        <v-switch v-model="onlyBuyTrades" @change="calculate" class="ml-3">
                                            <template #label>
                                                <span>Только покупки</span>
                                                <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                                                    <sup class="custom-tooltip" slot="activator">
                                                        <v-icon>fas fa-info-circle</v-icon>
                                                    </sup>
                                                    <span>
                                                        Включите, если хотите чтобы ребалансировка произвоидалась только с учетом сделок на покупку
                                                    </span>
                                                </v-tooltip>
                                            </template>
                                        </v-switch>

                                        <div class="mt-3">
                                            <ii-number-field label="Отклонение целевой доли в %" v-model="rowLimit" :decimals="2" maxLength="5"></ii-number-field>
                                        </div>
                                    </v-layout>
                                </v-card>
                            </v-menu>
                        </p>
                        <table class="v-datatable v-table theme--light">
                            <thead>
                            <tr>
                                <th role="columnheader" scope="col" v-for="header in getHeaders" :class="['column', 'sortable', 'text-sx-' + header.align]" :width="header.width">
                                    {{ header.text }}
                                </th>
                            </tr>
                            </thead>

                            <tbody>
                            <template v-for="assetRow in aggregateRows">
                                <tr v-for="(row, index) in assetRow.rows" :key="row.ticker">
                                    <td v-if="index === 0" :rowspan="assetRow.rows.length">{{ assetRow.assetType.description }}</td>
                                    <td v-if="index === 0" :rowspan="assetRow.rows.length">
                                        <ii-number-field v-model="assetRow.targetPercent" :decimals="2" maxLength="5"></ii-number-field>
                                    </td>
                                    <td class="text-xs-left">{{ row.name }} ({{ row.ticker }})</td>
                                    <td class="text-xs-right ii-number-cell">
                                        <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                            <template #activator="{ on }">
                                                <span class="data-table__header-with-tooltip" v-on="on">
                                                    <span>{{ row.price | amount(true, null, true, false) }}</span>
                                                    <span class="second-value">{{ currencyForPrice(row) }}</span>
                                                </span>
                                            </template>
                                            <span>
                                                <template v-if="row.share.shareType === 'BOND'">
                                                    Стоимость одного лота: {{ row.lotPrice | number }}
                                                    <span class="second-value">{{ currencyForPrice(row) }}</span>
                                                </template>
                                                <template v-else>
                                                    Стоимость одного лота: {{ row.lotPrice | number }}
                                                    <span class="second-value">{{ currencyForPrice(row) }}</span>
                                                </template>
                                            </span>
                                        </v-tooltip>
                                    </td>
                                    <td class="text-xs-right">{{ row.currentPercent }}</td>
                                    <td v-if="showTargetColumn" class="text-xs-right">
                                        <ii-number-field v-model="row.targetPercent" :decimals="2" maxLength="5"></ii-number-field>
                                    </td>
                                    <td class="text-xs-left">
                                        <span class="ml-2" v-html="getAction(row)"></span>
                                    </td>
                                    <td class="text-xs-right">
                                        {{ row.resultPercent }}
                                    </td>
                                </tr>
                                <tr class="fs14">
                                    <td class="text-xs-left"><b>Итого:</b></td>
                                    <td colspan="4" class="text-xs-right pr-0">
                                        <span class="pr-1">
                                            <b>{{ totalCurrentPercent(assetRow.assetType) | number }} %</b>
                                        </span>
                                    </td>
                                    <td v-if="showTargetColumn" class="text-xs-left">
                                        <span><b>{{ totalTargetPercent(assetRow.assetType) | number }} %</b></span>
                                    </td>
                                    <td colspan="3" class="text-xs-left"></td>
                                </tr>
                            </template>
                            </tbody>
                            <tfoot>
                            <tr class="fs14">
                                <td class="text-xs-left"><b>Итого:</b></td>
                                <td class="text-xs-right pr-0">
                                    <span class="pr-1">
                                        <b>{{ totalCurrentPercentByAssets | number }} %</b>
                                    </span>
                                </td>
                                <td colspan="3" class="text-xs-right pr-0"></td>
                                <td v-if="showTargetColumn" class="text-xs-right pr-3"></td>
                                <td colspan="3" class="text-xs-left pl-2">
                                    <div class="totalInfo">
                                        <div>
                                            <div>Сумма продаж</div>
                                            <div><b>{{ sell | number }}</b> <span class="currency">{{ currency }}</span></div>
                                        </div>
                                        <div>
                                            <div>Сумма покупок</div>
                                            <div><b>{{ buy | number }}</b> <span class="currency">{{ currency }}</span></div>
                                        </div>
                                        <div>
                                            <div>Использованные средства</div>
                                            <div><b>{{ totalAmount | number }}</b> <span class="currency">{{ currency }}</span></div>
                                        </div>
                                    </div>
                                </td>
                            </tr>
                            </tfoot>
                        </table>

                        <v-layout align-center justify-center row fill-heigh class="mt-3 mb-4">
                            <v-btn @click="calculate" color="primary" class="btn">
                                Сформировать
                            </v-btn>
                        </v-layout>
                    </v-flex>
                </v-fade-transition>
            </v-card>

            <empty-portfolio-stub v-else @openCombinedDialog="showDialogCompositePortfolio"></empty-portfolio-stub>
        </v-container>
    `
})
export class RebalancingPage extends PortfolioBasedPage {

    readonly ZERO = new Decimal("0.00");
    @Inject
    protected overviewService: OverviewService;
    @Inject
    protected rebalancingService: RebalancingService;
    @Inject
    protected tradeService: TradeService;

    @MainStore.Getter
    protected portfolio: Portfolio;
    @MainStore.Getter
    protected clientInfo: ClientInfo;
    /** Признак рассчетов в лотах */
    private calculationsInLots = true;
    /** Только покупки */
    private onlyBuyTrades = true;
    /** Модель ребалансировки */
    private rebalancingModel: RebalancingModel = null;
    /** Валюта */
    private currency: string = Currency.RUB;
    /** Тип ребалансировки */
    private rebalancingType: RebalancingType = RebalancingType.BY_AMOUNT;
    /** Типы ребалансировок */
    private RebalancingType = RebalancingType;
    /** Шаги */
    private passedSteps: Step[] = [Step.FIRST];
    /** Признак меню */
    private menu = false;

    private headers: TableHeader[] = [
        {text: "Тип", align: "left", value: "name", width: "120"},
        {text: "Доля", align: "left", value: "name", width: "120"},
        {text: "Бумага", align: "left", value: "name", width: "320"},
        {text: "Цена", align: "right", value: "price", sortable: true, width: "120"},
        {text: "Текущая доля", align: "right", value: "currentPercent", width: "120", sortable: true},
        {text: "Действие", align: "center", value: "action", sortable: false},
        {text: "Итоговая доля", align: "right", value: "resultPercent", width: "120", sortable: true},
    ];

    private targetPercentHeader = {text: "Целевая доля", align: "right", value: "targetPercent", width: "120", sortable: true};

    private pagination: Pagination = {
        descending: false,
        sortBy: "currentPercent",
        rowsPerPage: -1
    };

    private moneyAmount = "";

    private aggregateRows: RebalancingAggregateRow[] = [];

    /** Максимальное отклонение доли от заданного значения */
    private rowLimit: string = "1";

    async created(): Promise<void> {
        this.currency = this.portfolio.portfolioParams.viewCurrency;
        await this.loadRebalancingModel();
        this.initCalculatedRow();
        UI.on(EventType.TRADE_CREATED, async () => {
            await this.reloadPortfolio();
            this.initCalculatedRow();
        });
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    @Watch("portfolio")
    @DisableConcurrentExecution
    private async onPortfolioChange(): Promise<void> {
        this.currency = this.portfolio.portfolioParams.viewCurrency;
        this.passedSteps = [Step.FIRST];
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    private onRebalancingTypeChange(newType: RebalancingType): void {
        this.rebalancingType = newType;
        this.onlyBuyTrades = this.rebalancingType === RebalancingType.BY_AMOUNT;
        this.initCalculatedRow();
    }

    private initCalculatedRow(): void {
        this.aggregateRows = [];
        if (this.portfolio.overview.stockPortfolio.rows.length) {
            this.aggregateRows.push({
                assetType: PortfolioAssetType.STOCK,
                // @ts-ignore
                rows: this.portfolio.overview.stockPortfolio.rows.filter(row => Number(row.quantity) > 0).map(row => this.makeRow(row, row.share)),
                targetPercent: this.portfolio.overview.assetRows.find(row => row.type === PortfolioAssetType.STOCK.enumName)?.percCurrShare,
                currentCost: this.portfolio.overview.stockPortfolio.sumRow.currCost
            });
        }
        if (this.portfolio.overview.bondPortfolio.rows.length) {
            this.aggregateRows.push({
                assetType: PortfolioAssetType.BOND,
                // @ts-ignore
                rows: this.portfolio.overview.bondPortfolio.rows.filter(row => Number(row.quantity) > 0).map(row => this.makeRow(row, row.share)),
                targetPercent: this.portfolio.overview.assetRows.find(row => row.type === PortfolioAssetType.BOND.enumName)?.percCurrShare,
                currentCost: this.portfolio.overview.bondPortfolio.sumRow.currCost
            });
        }
        if (this.portfolio.overview.etfPortfolio.rows.length) {
            this.aggregateRows.push({
                assetType: PortfolioAssetType.ETF,
                // @ts-ignore
                rows: this.portfolio.overview.etfPortfolio.rows.filter(row => Number(row.quantity) > 0).map(row => this.makeRow(row, row.share)),
                targetPercent: this.portfolio.overview.assetRows.find(row => row.type === PortfolioAssetType.ETF.enumName)?.percCurrShare,
                currentCost: this.portfolio.overview.etfPortfolio.sumRow.currCost
            });
        }
        if (this.portfolio.overview.assetPortfolio.rows.length) {
            this.aggregateRows.push({
                assetType: PortfolioAssetType.OTHER,
                // @ts-ignore
                rows: this.portfolio.overview.assetPortfolio.rows.filter(row => Number(row.quantity) > 0).map(row => this.makeRow(row, row.share)),
                targetPercent: this.portfolio.overview.assetRows.find(row => row.type === PortfolioAssetType.OTHER.enumName)?.percCurrShare,
                currentCost: this.portfolio.overview.assetPortfolio.sumRow.currCost
            });
        }
        if (this.rebalancingModel) {
            const rebalancingModelsByAssetAndShare: { [key: string]: { targetPercent?: string, rows?: { [key: string]: number } } } = {};
            this.rebalancingModel.instrumentRebalancingModels.forEach(model => {
                const result: { targetPercent?: string, rows?: { [key: string]: number } } = {};
                const byShare: { [key: string]: number } = {};
                model.rows.forEach(row => {
                    byShare[row.shareId] = Number(row.targetShare);
                });
                result.targetPercent = model.targetPercent;
                result.rows = byShare;
                rebalancingModelsByAssetAndShare[model.assetType] = result;
            });
            this.aggregateRows.forEach(assetRow => {
                const rebalanceItem = rebalancingModelsByAssetAndShare[assetRow.assetType.enumName];
                assetRow.targetPercent = rebalanceItem?.targetPercent;
                assetRow.rows.forEach(row => {
                    const rowItem = (rebalanceItem?.rows || {})[row.shareId];
                    if (rowItem) {
                        row.targetPercent = rowItem;
                    }
                });
            });
        }
    }

    private makeRow(row: ShareRow, share: Share): CalculateRow {
        return {
            share: share,
            amountForLots: "0",
            amountForPieces: "0",
            lotSize: Number(share.lotsize || 1),
            // @ts-ignore
            price: share.shareType === ShareType.BOND ? row.absolutePrice : row.currPrice,
            currentAmount: new BigMoney(row.currCost).amount.toString(),
            lots: 0,
            pieces: "0",
            currentPercent: Number(row.percCurrShare),
            currentCost: new BigMoney(row.currCost).amount,
            targetPercent: Number(row.percCurrShare),
            resultPercent: 0,
            ticker: share.ticker,
            name: share.name,
            shareId: String(share.id),
            assetType: share.shareType,
            percCurrShareInWholePortfolio: row.percCurrShareInWholePortfolio
        };
    }

    private async loadRebalancingModel(): Promise<void> {
        if (!this.portfolio.id) {
            return;
        }
        this.rebalancingModel = await this.overviewService.getPortfolioRebalancing(this.portfolio.id);
        if (!this.rebalancingModel) {
            this.rebalancingModel = {
                instrumentRebalancingModels: [],
                maxShare: "",
                minShare: ""
            };
        }
    }

    private async calculate(): Promise<void> {
        const filteredRows = [...this.portfolio.overview.stockPortfolio.rows, ...this.portfolio.overview.bondPortfolio.rows,
            ...this.portfolio.overview.etfPortfolio.rows, ...this.portfolio.overview.assetPortfolio.rows].filter(row => Number(row.quantity) > 0);
        const totalCurrAmount = filteredRows.map(row => new BigMoney(row.currCost).amount).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        if (this.rebalancingType === RebalancingType.BY_PERCENT && totalCurrAmount.comparedTo(new Decimal("0.00")) === 0 &&
            this.aggregateRows.reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), []).every(row => row.currentPercent === row.targetPercent)) {
            this.$snotify.info("Изменения не требуются");
            return;
        }
        this.rebalancingService.calculateRows(this.aggregateRows, this.moneyAmount, Number(this.rowLimit), this.onlyBuyTrades, this.rebalancingType);
        await this.saveRebalancing(this.aggregateRows);
        if (this.buy === "0" && this.sell === "0" && this.totalAmount === "0") {
            this.$snotify.info("Изменения не требуются");
        }
    }

    private async saveRebalancing(aggregateRows: RebalancingAggregateRow[]): Promise<void> {
        if (!this.portfolio.id) {
            this.$snotify.warning("Сохранение настроек для составного портфеля недоступно");
            return;
        }
        this.rebalancingModel.instrumentRebalancingModels = [];
        aggregateRows.forEach(assetRow => {
            this.rebalancingModel.instrumentRebalancingModels.push({
                assetType: assetRow.assetType.enumName,
                targetPercent: assetRow.targetPercent,
                rows: assetRow.rows.map(row => {
                    return {
                        shareId: row.shareId,
                        assetType: row.assetType,
                        targetShare: String(row.targetPercent),
                        minShare: row.minShare,
                        minShareInWholePortfolio: row.minShareInWholePortfolio,
                        maxShare: row.maxShare,
                        maxShareInWholePortfolio: row.maxShareInWholePortfolio
                    } as InstrumentRebalancingRow;
                })
            } as InstrumentRebalancingModel);
        });
        await this.overviewService.saveOrUpdatePortfolioRebalancing(this.portfolio.id, this.rebalancingModel);
        await this.loadRebalancingModel();
    }

    /**
     * Устанавливает текущий баланс денег в сумму
     */
    private async setFreeBalance(): Promise<void> {
        this.moneyAmount = new BigMoney(this.freeBalance).amount.toString();
    }

    private nextStep(): void {
        const lastStep = this.passedSteps.pop();
        this.passedSteps.push(lastStep);
        this.passedSteps.push(lastStep + 1);
    }

    private customSort(items: CalculateRow[], index: string, isDesc: boolean): CalculateRow[] {
        return SortUtils.simpleSort<CalculateRow>(items, index, isDesc);
    }

    private currencyForPrice(row: CalculateRow): string {
        if (row.assetType === ShareType.BOND) {
            return Filters.currencySymbolByCurrency(row.share.currency);
        } else {
            return TradeUtils.currencySymbolByAmount(row.price).toLowerCase();
        }
    }

    private isStepVisible(step: Step): boolean {
        return this.passedSteps.includes(step);
    }

    private getAction(row: CalculateRow, assetType: PortfolioAssetType): string {
        const zero = new Decimal("0");
        if (row.lots === 0 && this.calculationsInLots || new Decimal(row.pieces).comparedTo(zero) === 0 && !this.calculationsInLots) {
            return "";
        }
        if (TariffUtils.isTariffExpired(this.clientInfo.user) && this.aggregateRows.find(assetRow => assetRow.assetType === assetType)?.rows.indexOf(row) % 2 === 0) {
            return "Ваш тариф истек. Пожалуйста, продлите подписку, чтобы увидеть все данные";
        }
        const isBuyAction = Number(this.calculationsInLots ? row.lots : row.pieces) > 0;
        const result: string[] = [`<span class="${isBuyAction ? "green--text" : "red--text"}">`];
        result.push(new Decimal(row.amountForLots).comparedTo(zero) > 0 ? "Покупка" : "Продажа");
        result.push("<b>");
        result.push(String(Math.abs(Number(this.calculationsInLots ? row.lots : row.pieces))));
        result.push("</b>");
        if (this.calculationsInLots) {
            result.push(Filters.declension(Math.abs(row.lots), "лота", "лотов", "лотов"));
            const quantity = row.lotSize * row.lots;
            result.push(` (${quantity} `);
            result.push(`${Filters.declension(Math.abs(quantity), "шутка", "штуки", "штук")})`);
        } else {
            result.push(Filters.declension(new BigMoney(row.price).amount.abs().toNumber(), "штуки", "штук", "штук"));
        }
        result.push("на сумму:");
        result.push("<b>");
        result.push(Filters.formatNumber(this.calculationsInLots ? new Decimal(row.amountForLots).abs().toString() : row.amountForPieces));
        result.push("</b>");
        result.push(this.viewCurrency.symbol);
        result.push("<span>");
        return result.join(" ");
    }

    private get getHeaders(): TableHeader[] {
        if (this.rebalancingType === RebalancingType.BY_AMOUNT) {
            return [...this.headers];
        }
        const headers = [...this.headers];
        headers.splice(3, 0, this.targetPercentHeader);
        return headers;
    }

    private get sell(): string {
        return this.aggregateRows.reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), [])
            .map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isNegative())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).abs().toString();
    }

    private get buy(): string {
        return this.aggregateRows.reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), [])
            .map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isPositive())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
    }

    private get totalAmount(): string {
        return this.aggregateRows.reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), [])
            .map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
    }

    private totalCurrentPercent(assetType: PortfolioAssetType): string {
        return this.aggregateRows.find(assetRow => assetRow.assetType === assetType)?.rows
            .map(row => new Decimal(row.currentPercent)).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private get totalCurrentPercentByAssets(): string {
        return this.aggregateRows.map(row => new Decimal(row.targetPercent || "0.00"))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private totalTargetPercent(assetType: PortfolioAssetType): string {
        return this.aggregateRows.find(assetRow => assetRow.assetType === assetType)?.rows
            .map(row => new Decimal(row.targetPercent || "0.00"))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private get freeBalance(): string {
        if (!this.portfolio) {
            return null;
        }
        const freeBalanceRow = this.portfolio ? this.portfolio.overview.assetRows.find(row => {
            const type = PortfolioAssetType.valueByName(row.type);
            if (type.assetType === AssetType.MONEY && type.currency === this.viewCurrency) {
                return row;
            }
            return null;
        }) : null;
        return freeBalanceRow ? freeBalanceRow.currCost : null;
    }

    private get viewCurrency(): CurrencyUnit {
        return CurrencyUnit.valueByName(this.portfolio.portfolioParams.viewCurrency);
    }

    private get showFreeBalanceHint(): boolean {
        return this.freeBalance && !new BigMoney(this.freeBalance).amount.isZero();
    }

    private get emptyRows(): boolean {
        return this.aggregateRows.every(row => row.rows.length === 0);
    }

    private get showTargetColumn(): boolean {
        return this.rebalancingType === RebalancingType.BY_PERCENT;
    }

    private get stocksCount(): number {
        return this.portfolio.overview.stockPortfolio.rows.length;
    }

    private get bondsCount(): number {
        return this.portfolio.overview.bondPortfolio.rows.length;
    }

    private get etfCount(): number {
        return this.portfolio.overview.etfPortfolio.rows.length;
    }

    private get assetsCount(): number {
        return this.portfolio.overview.assetPortfolio.rows.length;
    }
}

enum Step {
    FIRST,
    SECOND,
    THIRD
}
