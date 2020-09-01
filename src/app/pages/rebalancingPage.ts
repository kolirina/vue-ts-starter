import {Decimal} from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component, namespace, UI, Watch} from "../app/ui";
import {Filters} from "../platform/filters/Filters";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {CalculateRow, RebalancingService, RebalancingType} from "../services/rebalancingService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Currency, CurrencyUnit} from "../types/currency";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {InstrumentRebalancingModel, Pagination, Portfolio, RebalancingModel, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {StoreType} from "../vuex/storeType";

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
                        <v-data-table :headers="getHeaders" :items="calculateRows" item-key="name"
                                      :custom-sort="customSort" :pagination.sync="pagination" class="data-table" hide-actions must-sort>
                            <template #headerCell="props">
                                <span>{{ props.header.text }}</span>
                            </template>
                            <template #items="props">
                                <tr class="selectable">
                                    <td class="text-xs-left">{{ props.item.name }} ({{ props.item.ticker }})</td>
                                    <td class="text-xs-right ii-number-cell">
                                        <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                            <template #activator="{ on }">
                                                <span class="data-table__header-with-tooltip" v-on="on">
                                                    <span>{{ props.item.price | amount }}</span>
                                                    <span class="second-value">{{ currencyForPrice(props.item) }}</span>
                                                </span>
                                            </template>
                                            <span>
                                                Стоимость одного лота: {{ props.item.lotPrice | number }}
                                                <span class="second-value">{{ currencyForPrice(props.item) }}</span>
                                            </span>
                                        </v-tooltip>
                                    </td>
                                    <td class="text-xs-right">{{ props.item.currentPercent }}</td>
                                    <td v-if="showTargetColumn" class="text-xs-right">
                                        <ii-number-field v-model="props.item.targetPercent" :decimals="2" maxLength="5"></ii-number-field>
                                    </td>
                                    <td class="text-xs-left">
                                        <span class="ml-2" v-html="getAction(props.item)"></span>
                                    </td>
                                    <td class="text-xs-right">
                                        {{ props.item.resultPercent }}
                                    </td>
                                </tr>
                            </template>

                            <template #footer>
                                <tr class="fs14">
                                    <td class="text-xs-left"><b>Итого:</b></td>
                                    <td colspan="2" class="text-xs-right pr-0">
                                        <span class="pr-1">
                                            <b>{{ totalCurrentPercent | number }} %</b>
                                        </span>
                                    </td>
                                    <td v-if="showTargetColumn" class="text-xs-right pr-3">
                                        <span>
                                            <b>{{ totalTargetPercent | number }} %</b>
                                        </span>
                                    </td>
                                    <td colspan="2" class="text-xs-left pl-2">
                                        <div class="totalInfo">
                                            <div>
                                                <div>Cумма продаж</div>
                                                <div><b>{{ sell | number }}</b> <span class="currency">{{ currency }}</span></div>
                                            </div>
                                            <div>
                                                <div>Cумма покупок</div>
                                                <div><b>{{ buy | number }}</b> <span class="currency">{{ currency }}</span></div>
                                            </div>
                                            <div>
                                                <div>Использованные средства</div>
                                                <div><b>{{ totalAmount | number }}</b> <span class="currency">{{ currency }}</span></div>
                                            </div>
                                        </div>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>

                        <v-layout align-center justify-center row fill-heigh class="mt-3 mb-4">
                            <v-btn @click="calculate" color="primary" class="btn">
                                Сформировать
                            </v-btn>
                        </v-layout>
                    </v-flex>
                </v-fade-transition>
            </v-card>

            <empty-portfolio-stub v-else></empty-portfolio-stub>
        </v-container>
    `
})
export class RebalancingPage extends UI {

    readonly ZERO = new Decimal("0.00");
    @Inject
    private rebalancingService: RebalancingService;
    @Inject
    private tradeService: TradeService;
    @Inject
    private overviewService: OverviewService;

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    private calculationsInLots = true;
    private onlyBuyTrades = true;

    private rebalancingModel: RebalancingModel = null;
    private currency: string = Currency.RUB;

    private rebalancingType: RebalancingType = RebalancingType.BY_AMOUNT;

    private RebalancingType = RebalancingType;

    private passedSteps: Step[] = [Step.FIRST];

    private menu = false;

    private headers: TableHeader[] = [
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
    private totalCurrAmount: Decimal = new Decimal("0");

    private calculateRows: CalculateRow[] = [];

    /** Максимальное отклонение доли от заданного значения */
    private rowLimit: string = "1";

    async created(): Promise<void> {
        this.currency = this.portfolio.portfolioParams.viewCurrency;
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    @Watch("portfolio")
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
        this.calculateRows = [];
        const filteredRows = this.portfolio.overview.stockPortfolio.rows.filter(row => Number(row.quantity) > 0);
        filteredRows.forEach(row => {
            const calculateRow: CalculateRow = {
                amountForLots: "0",
                amountForPieces: "0",
                lotSize: Number(row.share.lotsize) || 1,
                price: row.currPrice,
                currentAmount: new BigMoney(row.currCost).amount.toString(),
                lots: 0,
                pieces: "0",
                currentPercent: Number(row.percCurrShare),
                currentCost: new BigMoney(row.currCost).amount,
                targetPercent: Number(row.percCurrShare),
                resultPercent: 0,
                ticker: row.share.ticker,
                name: row.share.name,
                shareId: String(row.share.id),
                assetType: row.share.shareType,
                percCurrShareInWholePortfolio: row.percCurrShareInWholePortfolio
            };
            const rebalanceItem = this.findRebalancingItem(calculateRow);
            if (rebalanceItem) {
                calculateRow.targetPercent = Number(rebalanceItem.targetShare);
            }
            this.calculateRows.push(calculateRow);
        });
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
        const filteredRows = this.portfolio.overview.stockPortfolio.rows.filter(row => Number(row.quantity) > 0);
        this.totalCurrAmount = filteredRows.map(row => new BigMoney(row.currCost).amount).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        if (this.rebalancingType === RebalancingType.BY_PERCENT && this.totalCurrAmount.comparedTo(new Decimal("0.00")) === 0 &&
            this.calculateRows.every(row => row.currentPercent === row.targetPercent)) {
            this.$snotify.info("Изменения не требуются");
            return;
        }
        this.rebalancingService.calculateRows(this.calculateRows, this.moneyAmount, this.totalCurrAmount, Number(this.rowLimit), this.onlyBuyTrades, this.rebalancingType);
        await this.saveRebalancing(this.calculateRows);
        if (this.buy === "0" && this.sell === "0" && this.totalAmount === "0") {
            this.$snotify.info("Изменения не требуются");
        }
    }

    private async saveRules(): Promise<void> {
        await this.saveRebalancing(this.calculateRows);
        this.$snotify.info("Правила успешно сохранены");
    }

    private async saveRebalancing(calculateRow: CalculateRow[]): Promise<void> {
        if (!this.portfolio.id) {
            return;
        }
        this.rebalancingModel.instrumentRebalancingModels = [];
        calculateRow.forEach(row => {
            this.rebalancingModel.instrumentRebalancingModels.push({
                shareId: row.shareId,
                assetType: row.assetType,
                targetShare: String(row.targetPercent),
                minShare: row.minShare,
                minShareInWholePortfolio: row.minShareInWholePortfolio,
                maxShare: row.maxShare,
                maxShareInWholePortfolio: row.maxShareInWholePortfolio
            });
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
        return TradeUtils.currencySymbolByAmount(row.price).toLowerCase();
    }

    private findRebalancingItem(row: CalculateRow): InstrumentRebalancingModel {
        return this.rebalancingModel?.instrumentRebalancingModels?.find(item => item.shareId === row.shareId && item.assetType === row.assetType);
    }

    private isStepVisible(step: Step): boolean {
        return this.passedSteps.includes(step);
    }

    private getAction(row: CalculateRow): string {
        const zero = new Decimal("0");
        if (row.lots === 0 && this.calculationsInLots || new Decimal(row.pieces).comparedTo(zero) === 0 && !this.calculationsInLots) {
            return "";
        }
        if (TariffUtils.isTariffExpired(this.clientInfo.user) && this.calculateRows.indexOf(row) % 2 === 0) {
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
        return this.calculateRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isNegative())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).abs().toString();
    }

    private get buy(): string {
        return this.calculateRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isPositive())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
    }

    private get totalAmount(): string {
        return this.calculateRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
    }

    private get totalCurrentPercent(): string {
        return this.calculateRows.map(row => new Decimal(row.currentPercent)).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private get totalTargetPercent(): string {
        return this.calculateRows.map(row => new Decimal(row.targetPercent || "0.00"))
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
        return this.calculateRows.length === 0;
    }

    private get showTargetColumn(): boolean {
        return this.rebalancingType === RebalancingType.BY_PERCENT;
    }
}

enum Step {
    FIRST,
    SECOND,
    THIRD
}
