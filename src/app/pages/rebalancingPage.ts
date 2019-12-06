import {Decimal} from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component, namespace, UI, Watch} from "../app/ui";
import {EmptyPortfolioStub} from "../components/emptyPortfolioStub";
import {RebalancingComponent} from "../components/rebalancingComponent";
import {Filters} from "../platform/filters/Filters";
import {OverviewService} from "../services/overviewService";
import {CalculateRow, RebalancingService, RebalancingType} from "../services/rebalancingService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {CurrencyUnit, InstrumentRebalancingModel, Pagination, Portfolio, RebalancingModel, TableHeader} from "../types/types";
import {SortUtils} from "../utils/sortUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container class="adviser-wrap">
            <expanded-panel :value="$uistate.rebalancingPanel" :withMenu="false" :state="$uistate.REBALANCING_PANEL">
                <template #header>Ребалансировка портфеля</template>

                <v-layout v-if="!emptyRows" wrap align-center row fill-height class="mt-3 ma-auto maxW1100">
                    <v-flex v-if="isStepVisible(0)" xs12 class="mt-4 mb-5 fs14">
                        <b>Ребалансировка</b> - это процедура, позволяющаяя увеличить доходность портфеля.
                        Вы продаете подорожавшие активы и покупаете подешевевшие.<br/>
                        Сохраняя при этом заранее выбранные доли в портфеле.
                        <br/>
                        Возможна также только покупка активов для выправления долей,
                        если вы не хотите продавать активы, а только распределить денежные средства.
                        <br/>
                        Следуйте инструкциям на экране для ребанасировки вашего портфеля акций.
                    </v-flex>

                    <v-flex v-if="isStepVisible(0)" xs12>
                        <v-layout wrap align-center row fill-height>
                            <v-flex xs12 sm3>
                                <span class="fs14">Свободные денежные средства</span>
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
                            </v-flex>

                            <v-flex xs12 sm6>
                                <v-layout align-center justify-center row fill-height>
                                    <v-flex xs12 sm10>
                                        <ii-number-field label="Сумма" v-model="moneyAmount" :decimals="2" name="money_amount" v-validate="required + '|min_value:0.01'"
                                                         :error-messages="errors.collect('money_amount')" :class="required" key="money-amount" maxLength="18"></ii-number-field>
                                    </v-flex>
                                    <v-flex xs12 sm2 class="pl-2">
                                        <v-text-field :value="currency" label="Валюта" disabled></v-text-field>
                                    </v-flex>
                                </v-layout>
                                <div>
                            <span v-if="showFreeBalanceHint">
                                <span class="fs12-opacity mt-1">В портфеле сейчас:</span>
                                <a class="fs12" @click="setFreeBalanceAndCalculate" title="Распределить">{{ freeBalance | amount(true) }} {{ freeBalance | currencySymbol }}</a>
                            </span>
                                </div>
                            </v-flex>
                        </v-layout>
                    </v-flex>

                    <v-fade-transition>
                        <v-flex v-if="isStepVisible(1)" xs12>
                            <v-layout wrap align-center row fill-height>
                                <v-flex xs12 sm3>
                                    <span class="fs14">Распределение долей</span>
                                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                        <sup class="custom-tooltip" slot="activator">
                                            <v-icon>fas fa-info-circle</v-icon>
                                        </sup>
                                        <span>
                                        Вы можете оставить текущие доли в портфеле или же задать целевые доли,
                                        к которым хотите привести активы.
                                    </span>
                                    </v-tooltip>
                                </v-flex>

                                <v-flex xs12 sm6>
                                    <v-radio-group v-model="rebalancingType">
                                        <v-radio v-for="type in [RebalancingType.BY_AMOUNT, RebalancingType.BY_PERCENT]" :key="type.code" :label="type.description"
                                                 :value="type"></v-radio>
                                    </v-radio-group>
                                </v-flex>
                            </v-layout>
                        </v-flex>
                    </v-fade-transition>

                    <v-layout v-if="(isStepVisible(0) || isStepVisible(1)) && !isStepVisible(2)" align-center justify-center row fill-heigh class="mt-3 mb-4">
                        <v-btn @click="nextStep" color="primary" class="btn">
                            Далее
                        </v-btn>
                    </v-layout>

                    <v-fade-transition>
                        <v-flex v-if="isStepVisible(2)" xs12>
                            <v-card flat>
                                <v-card-text class="pa-0">
                                    <p class="text-xs-right fs14">
                                        <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="80" :nudge-bottom="25" bottom>
                                            <a slot="activator">Расширенные настройки</a>

                                            <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                                                <v-layout justify-center column fill-height>
                                                    <v-switch v-model="calculationsInLots" class="ml-3">
                                                        <template #label>
                                                            <span>Расчеты в лотах</span>
                                                            <v-tooltip content-class="custom-tooltip-wrap modal-tooltip" bottom>
                                                                <sup class="custom-tooltip" slot="activator">
                                                                    <v-icon>fas fa-info-circle</v-icon>
                                                                </sup>
                                                                <span>
                                                                    Включите, если хотите чтобы количество расчитывалось в лотах, а не в штуках.
                                                                </span>
                                                            </v-tooltip>
                                                        </template>
                                                    </v-switch>

                                                    <v-switch v-if="showTargetColumn" v-model="onlyBuyTrades" @change="calculate" class="ml-3">
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
                                                </v-layout>
                                            </v-card>
                                        </v-menu>
                                    </p>
                                    <v-data-table :headers="getHeaders" :items="calculateRows" item-key="id"
                                                  :custom-sort="customSort" :pagination.sync="pagination" class="data-table" hide-actions must-sort>
                                        <template #headerCell="props">
                                            <span>{{ props.header.text }}</span>
                                        </template>
                                        <template #items="props">
                                            <tr class="selectable">
                                                <td class="text-xs-left">{{ props.item.name }}</td>
                                                <td class="text-xs-right ii-number-cell">
                                                    {{ props.item.price | amount }}&nbsp;<span class="second-value">{{ currencyForPrice(props.item) }}</span>
                                                </td>
                                                <td class="text-xs-right">{{ props.item.currentPercent }}</td>
                                                <td v-if="showTargetColumn" class="text-xs-right">
                                                    <ii-number-field v-model="props.item.targetPercent" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                                <td class="text-xs-left">
                                                    <span class="ml-2" v-html="getAction(props.item)"></span>
                                                </td>
                                            </tr>
                                        </template>

                                        <template #footer>
                                            <tr class="fs14">
                                                <td colspan="3" class="text-xs-right">
                                                    <span class="pr-1">
                                                        Итого: <b>{{ totalCurrentPercent | number }} %</b>
                                                    </span>
                                                </td>
                                                <td v-if="showTargetColumn" class="text-xs-right">
                                                    <span>
                                                        <b>{{ totalTargetPercent | number }} %</b>
                                                    </span>
                                                </td>
                                                <td class="text-xs-left pl-2" style="padding-left: 16px !important;">
                                                    <span v-html="totalInfo"></span>
                                                </td>
                                            </tr>
                                        </template>
                                    </v-data-table>

                                    <v-layout align-center justify-center row fill-heigh class="mt-3 mb-4">
                                        <v-btn @click="calculate" color="primary" class="btn">
                                            Сформировать
                                        </v-btn>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-flex>
                    </v-fade-transition>
                </v-layout>

                <empty-portfolio-stub v-else></empty-portfolio-stub>
            </expanded-panel>
        </v-container>
    `,
    components: {RebalancingComponent, EmptyPortfolioStub}
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
    private calculationsInLots = true;
    private onlyBuyTrades = true;

    private rebalancingModel: RebalancingModel = null;
    private currency = CurrencyUnit.RUB.code;

    private rebalancingType: RebalancingType = RebalancingType.BY_AMOUNT;

    private RebalancingType = RebalancingType;

    private passedSteps: Step[] = [Step.FIRST];

    private menu = false;

    private headers: TableHeader[] = [
        {text: "Бумага", align: "left", value: "name", width: "240"},
        {text: "Цена", align: "right", value: "price", sortable: true, width: "50"},
        {text: "Текущая доля", align: "right", value: "currentPercent", width: "120", sortable: true},
        {text: "Действие", align: "center", value: "action", sortable: false}
    ];

    private targetPercentHeader = {text: "Целевая доля", align: "right", value: "targetPercent", width: "120", sortable: true};

    private pagination: Pagination = {
        descending: false,
        sortBy: "date",
        rowsPerPage: -1
    };

    private moneyAmount = "";

    private calculateRows: CalculateRow[] = [];

    async created(): Promise<void> {
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.passedSteps = [Step.FIRST];
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    private initCalculatedRow(): void {
        this.calculateRows = [];
        this.portfolio.overview.stockPortfolio.rows.filter(row => Number(row.quantity) > 0).forEach(row => {
            const calculateRow: CalculateRow = {
                amountForLots: "0",
                amountForPieces: "0",
                lotSize: Number(row.share.lotsize) || 1,
                price: row.currPrice,
                currentAmount: new BigMoney(row.currCost).amount.toString(),
                lots: 0,
                pieces: "0",
                currentPercent: row.percCurrShare,
                targetPercent: row.percCurrShare,
                amountAfterByLots: "0",
                amountAfterByPieces: "0",
                ticker: row.share.ticker,
                name: row.share.name,
                shareId: String(row.share.id),
                assetType: row.share.shareType,
                percCurrShareInWholePortfolio: row.percCurrShareInWholePortfolio
            };
            const rebalanceItem = this.findRebalancingItem(calculateRow);
            if (rebalanceItem) {
                calculateRow.targetPercent = rebalanceItem.targetShare;
            }
            this.calculateRows.push(calculateRow);
        });
    }

    private async loadRebalancingModel(): Promise<void> {
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
        this.rebalancingService.calculateRows(this.calculateRows, this.moneyAmount, this.onlyBuyTrades, this.rebalancingType);
        await this.saveRebalancing(this.calculateRows);
    }

    private async saveRules(): Promise<void> {
        await this.saveRebalancing(this.calculateRows);
        this.$snotify.info("Правила успешно сохранены");
    }

    private async saveRebalancing(calculateRow: CalculateRow[]): Promise<void> {
        this.rebalancingModel.instrumentRebalancingModels = [];
        calculateRow.forEach(row => {
            this.rebalancingModel.instrumentRebalancingModels.push({
                shareId: row.shareId,
                assetType: row.assetType,
                targetShare: row.targetPercent,
                minShare: row.minShare,
                minShareInWholePortfolio: row.minShareInWholePortfolio,
                maxShare: row.maxShare,
                maxShareInWholePortfolio: row.maxShareInWholePortfolio
            });
        });
        await this.overviewService.saveOrUpdatePortfolioRebalancing(this.portfolio.id, this.rebalancingModel);
        await this.loadRebalancingModel();
    }

    private async setFreeBalanceAndCalculate(): Promise<void> {
        this.moneyAmount = new BigMoney(this.freeBalance).amount.toString();
        await this.calculate();
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
        const isBuyAction = Number(this.calculationsInLots ? row.lots : row.pieces) > 0;
        const result: string[] = [`<span class="${isBuyAction ? "green--text" : "red--text"}">`];
        result.push(new Decimal(row.amountForLots).comparedTo(zero) > 0 ? "Покупка" : "Продажа");
        result.push("<b>");
        result.push(String(Math.abs(Number(this.calculationsInLots ? row.lots : row.pieces))));
        result.push("</b>");
        if (this.calculationsInLots) {
            result.push(Filters.declension(row.lots, "лота", "лотов", "лотов"));
        } else {
            result.push(Filters.declension(new BigMoney(row.price).amount.toNumber(), "штуки", "штук", "штук"));
        }
        result.push("на сумму:");
        result.push("<b>");
        result.push(Filters.formatNumber(this.calculationsInLots ? row.amountForLots : row.amountForPieces));
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

    private get totalInfo(): string {
        const buy = this.calculateRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isPositive())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
        const sell = this.calculateRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .filter(amount => amount.isNegative())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).abs().toString();
        return `<b>${Filters.formatNumber(buy)}</b> - сумма покупок<br/>
        <b>${Filters.formatNumber(sell)}</b> - сумма продаж<br/>
        <b>${Filters.formatNumber(this.totalAmount)}</b> - использованные денежные средства`;
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

    private get required(): string {
        return this.rebalancingType === RebalancingType.BY_PERCENT ? "" : "required";
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
