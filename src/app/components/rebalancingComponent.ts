/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Decimal} from "decimal.js";
import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class";
import {Component, UI, Watch} from "../app/ui";
import {OverviewService} from "../services/overviewService";
import {CalculateRow, RebalancingService, RebalancingType} from "../services/rebalancingService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {CurrencyUnit, InstrumentRebalancingModel, Pagination, Portfolio, RebalancingModel, TableHeader} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {SortUtils} from "../utils/sortUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {StoreType} from "../vuex/storeType";
import {EmptyPortfolioStub} from "./emptyPortfolioStub";

const MainStore = namespace(StoreType.MAIN);

/**
 * Диалог получения кода для встраиваемого блока
 */
@Component({
    // language=Vue
    template: `
        <expanded-panel :value="$uistate.rebalancingPanel" :withMenu="false" :state="$uistate.REBALANCING_PANEL">
            <template #header>Ребалансировка портфеля</template>
            <v-tabs v-if="!emptyRows" fixed-tabs v-model="currentTab">
                <v-tab :key="0">
                    По сумме
                </v-tab>
                <v-tab :key="1">
                    По доле
                </v-tab>
                <v-tab :key="2">
                    Правила
                </v-tab>
            </v-tabs>

            <v-layout v-if="!emptyRows" wrap align-center row fill-height class="mt-3 ma-auto maxW1100">
                <v-flex v-if="currentTab !== 2" xs12>
                    <v-layout wrap align-center row fill-height>
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
                                    <span class="fs12-opacity mt-1">
                                        Сумма свободных денежных средств в портфеле: {{ freeBalance | amount(true) }} {{ freeBalance | currencySymbol }}
                                    </span>
                                    <a class="fs12" @click="setFreeBalanceAndCalculate" title="Распределить"> Распределить?</a>
                                </span>
                            </div>
                        </v-flex>
                        <v-flex xs12 sm6>
                            <v-layout align-center justify-center row fill-height>
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

                                <v-switch v-if="currentTab === 1" v-model="onlyBuyTrades" @change="calculate" class="ml-3">
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
                        </v-flex>
                    </v-layout>
                </v-flex>

                <v-flex xs12>
                    <v-window v-model="currentTab">
                        <v-window-item :value="0">
                            <v-card flat>
                                <v-card-text>
                                    <v-data-table :headers="headersByAmount" :items="currentTypeRows" item-key="id"
                                                  :custom-sort="customSort" :pagination.sync="pagination" class="data-table" hide-actions must-sort>
                                        <template #headerCell="props">
                                        <span>
                                            <span v-if="props.header.value === 'lots'">
                                                <span v-if="calculationsInLots">Лотов для покупки</span>
                                                <span v-else class="pl-1">Штук для покупки</span>
                                            </span>
                                            <span v-else>{{ props.header.text }}</span>
                                        </span>
                                        </template>
                                        <template #items="props">
                                            <tr class="selectable">
                                                <td class="text-xs-left">{{ props.item.ticker }}</td>
                                                <td class="text-xs-right">
                                                    <ii-number-field :value="props.item.currentPercent" :decimals="2" maxLength="5" readonly></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">{{ props.item.lotSize }}</td>
                                                <td class="text-xs-right ii-number-cell">
                                                    {{ props.item.price | amount }}&nbsp;<span class="second-value">{{ currencyForPrice(props.item) }}</span>
                                                </td>
                                                <td class="text-xs-right">
                                                    <span v-if="calculationsInLots">{{ props.item.lots }}</span>
                                                    <span v-else>{{ props.item.pieces }}</span>
                                                </td>
                                                <td class="text-xs-right">
                                                    <span v-if="calculationsInLots">{{ props.item.amountForLots | number }}</span>
                                                    <span v-else>{{ props.item.amountForPieces | number }}</span>
                                                </td>
                                            </tr>
                                        </template>

                                        <template #footer>
                                            <tr>
                                                <td colspan="2">
                                                    <v-layout align-center justify-end row fill-height>
                                                    <span class="pr-2">
                                                        Итого: <b>{{ totalCurrentPercent | number }} %</b>
                                                    </span>
                                                    </v-layout>
                                                </td>
                                                <td colspan="4">
                                                    <v-layout align-center justify-end row fill-height>
                                                    <span>
                                                        Итоговая сумма покупок: <b>{{ totalAmount | number }}</b>
                                                    </span>
                                                    </v-layout>
                                                </td>
                                            </tr>
                                        </template>
                                    </v-data-table>

                                    <v-layout class="action-btn">
                                        <v-spacer></v-spacer>
                                        <v-btn @click="calculate" color="primary" class="btn">
                                            Сформировать
                                        </v-btn>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-window-item>

                        <v-window-item :value="1">
                            <v-card flat>
                                <v-card-text>
                                    <v-data-table :headers="headersByPercent" :items="currentTypeRows" item-key="id"
                                                  :custom-sort="customSort" :pagination.sync="pagination" class="data-table" hide-actions must-sort>
                                        <template #headerCell="props">
                                        <span>
                                            <span v-if="props.header.value === 'lots'">
                                                <span v-if="calculationsInLots">Лотов для покупки</span>
                                                <span v-else class="pl-1">Штук для покупки</span>
                                            </span>
                                            <span v-else>{{ props.header.text }}</span>
                                        </span>
                                        </template>
                                        <template #items="props">
                                            <tr class="selectable">
                                                <td class="text-xs-left">{{ props.item.ticker }}</td>
                                                <td class="text-xs-right">{{ props.item.currentPercent }}</td>
                                                <td class="text-xs-right">
                                                    <ii-number-field v-model="props.item.targetPercent" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">{{ props.item.lotSize }}</td>
                                                <td class="text-xs-right ii-number-cell">
                                                    {{ props.item.price | amount }}&nbsp;<span class="second-value">{{ currencyForPrice(props.item) }}</span>
                                                </td>
                                                <td class="text-xs-right">
                                                    <span v-if="calculationsInLots">{{ props.item.lots }}</span>
                                                    <span v-else>{{ props.item.pieces }}</span>
                                                </td>
                                                <td class="text-xs-right">{{ props.item.currentAmount | number }}</td>
                                                <td class="text-xs-right">
                                                    <span v-if="calculationsInLots">{{ props.item.amountForLots | number }}</span>
                                                    <span v-else>{{ props.item.amountForPieces | number }}</span>
                                                </td>
                                                <td class="text-xs-right">
                                                    <span v-if="calculationsInLots">{{ props.item.amountAfterByLots | number }}</span>
                                                    <span v-else>{{ props.item.amountAfterByPieces | number }}</span>
                                                </td>
                                            </tr>
                                        </template>

                                        <template #footer>
                                            <tr>
                                                <td colspan="2" class="text-xs-right">
                                                    <span class="pr-2">
                                                        Итого: <b>{{ totalCurrentPercent | number }} %</b>
                                                    </span>
                                                </td>
                                                <td>
                                                    <span class="pl-2">
                                                        <b>{{ totalTargetPercent | number }} %</b>
                                                    </span>
                                                </td>
                                                <td colspan="5" class="text-xs-right pr-2">
                                                    <span>
                                                        Итоговая сумма сделок: <b>{{ totalAmount | number }}</b>
                                                    </span>
                                                </td>
                                                <td></td>
                                            </tr>
                                        </template>
                                    </v-data-table>

                                    <v-layout class="action-btn">
                                        <v-spacer></v-spacer>
                                        <v-btn @click="calculate" color="primary" class="btn">
                                            Сформировать
                                        </v-btn>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-window-item>

                        <v-window-item :value="2">
                            <v-card flat>
                                <v-card-text>
                                    <v-data-table :headers="headersByRule" :items="currentTypeRows" item-key="id"
                                                  :custom-sort="customSort" :pagination.sync="pagination" class="data-table" hide-actions must-sort>
                                        <template #headerCell="props">
                                        <span>
                                            <span v-html="props.header.text"></span>
                                        </span>
                                        </template>
                                        <template #items="props">
                                            <tr class="selectable">
                                                <td class="text-xs-center">
                                                     <v-tooltip v-if="isRebalancingNotEmpty(props.item) && !!getRuleText(props.item)" content-class="custom-tooltip-wrap" bottom>
                                                        <v-icon slot="activator" :color="isRuleApplied(props.item) ? 'green' : 'red'" class="pointer-cursor">
                                                            {{ getRuleIcon(props.item) }}
                                                        </v-icon>
                                                        <span v-html="getRuleText(props.item)"></span>
                                                    </v-tooltip>
                                                </td>
                                                <td class="text-xs-left">
                                                    <span>{{ props.item.ticker }}</span>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field :value="props.item.currentPercent" :decimals="2" maxLength="5" readonly></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field :value="props.item.percCurrShareInWholePortfolio" :decimals="2" maxLength="5" readonly></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field v-model="props.item.minShare" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field v-model="props.item.minShareInWholePortfolio" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field v-model="props.item.maxShare" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                                <td class="text-xs-right">
                                                    <ii-number-field v-model="props.item.maxShareInWholePortfolio" :decimals="2" maxLength="5"></ii-number-field>
                                                </td>
                                            </tr>
                                        </template>
                                    </v-data-table>

                                    <v-layout class="action-btn mt-4">
                                        <v-spacer></v-spacer>
                                        <v-btn @click="saveRules" color="primary" class="btn">
                                            Сохранить
                                        </v-btn>
                                    </v-layout>
                                </v-card-text>
                            </v-card>
                        </v-window-item>
                    </v-window>
                </v-flex>
            </v-layout>

            <empty-portfolio-stub v-else></empty-portfolio-stub>
        </expanded-panel>
    `,
    components: {EmptyPortfolioStub}
})
export class RebalancingComponent extends UI {

    readonly ZERO = new Decimal("0.00");
    @Inject
    private rebalancingService: RebalancingService;
    @Inject
    private tradeService: TradeService;
    @Inject
    private overviewService: OverviewService;
    private rebalancingModel: RebalancingModel = null;

    @MainStore.Getter
    private portfolio: Portfolio;
    private calculationsInLots = true;
    private onlyBuyTrades = true;
    /** Список валют */
    private currencyList = CurrencyUnit.values().map(c => c.code);

    private currency = CurrencyUnit.RUB.code;

    private headersByAmount: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "100"},
        {text: "Доля", align: "right", value: "currentPercent", width: "120"},
        {text: "Размер лота", align: "right", value: "lotSize", sortable: true, width: "40"},
        {text: "Тек. цена", align: "right", value: "price", sortable: true, width: "50"},
        {text: "Лотов для покупки", align: "right", value: "lots", width: "50"},
        {text: "Сумма", align: "right", value: "amountForLots"}
    ];

    private headersByPercent: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "100"},
        {text: "Текущая доля", align: "right", value: "currentPercent", width: "120"},
        {text: "Целевая доля", align: "right", value: "targetPercent", width: "120"},
        {text: "Размер лота", align: "right", value: "lotSize", sortable: true, width: "40"},
        {text: "Тек. цена", align: "right", value: "price", sortable: true, width: "50"},
        {text: "Лотов", align: "right", value: "lots", width: "50"},
        {text: "Тек. ст-ть", align: "right", value: "currentAmount", sortable: true, width: "50"},
        {text: "Сумма", align: "right", value: "amountForLots"},
        {text: "Итоговая ст-ть", align: "right", value: "amountAfterByLots", sortable: true, width: "50"},
    ];

    private headersByRule: TableHeader[] = [
        {text: "", align: "center", value: "", width: "20", sortable: false},
        {text: "Тикер", align: "left", value: "ticker", width: "110"},
        {text: "Текущая<br/> доля", align: "right", value: "currentPercent", width: "120"},
        {text: "Текущая доля<br/> (В портфеле)", align: "right", value: "percCurrShareInWholePortfolio", width: "120"},
        {text: "Минимальная<br/> доля", align: "right", value: "minShare", width: "120"},
        {text: "Минимальная доля<br/> (В портфеле)", align: "right", value: "minShareInWholePortfolio", width: "120"},
        {text: "Максимальная<br/> доля", align: "right", value: "maxShare", width: "120"},
        {text: "Максимальная доля<br/> (В портфеле)", align: "right", value: "maxShareInWholePortfolio", width: "120"},
    ];

    private pagination: Pagination = {
        descending: false,
        sortBy: "date",
        rowsPerPage: -1
    };

    private moneyAmount = "";

    private calculateRows: { [key: string]: CalculateRow[] } = {
        [RebalancingType.BY_AMOUNT.code]: [],
        [RebalancingType.BY_PERCENT.code]: [],
        [RebalancingType.RULES.code]: [],
    };

    private currentTab: RebalancingType = RebalancingType.BY_AMOUNT;

    async created(): Promise<void> {
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadRebalancingModel();
        this.initCalculatedRow();
    }

    private initCalculatedRow(): void {
        this.calculateRows = {
            [RebalancingType.BY_AMOUNT.code]: [],
            [RebalancingType.BY_PERCENT.code]: [],
            [RebalancingType.RULES.code]: []
        };
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
                shareId: String(row.share.id),
                assetType: row.share.shareType,
                percCurrShareInWholePortfolio: row.percCurrShareInWholePortfolio
            };
            const rebalanceItem = this.findRebalancingItem(calculateRow);
            if (rebalanceItem) {
                calculateRow.targetPercent = rebalanceItem.targetShare;
                calculateRow.minShare = rebalanceItem.minShare;
                calculateRow.minShareInWholePortfolio = rebalanceItem.minShareInWholePortfolio;
                calculateRow.maxShare = rebalanceItem.maxShare;
                calculateRow.maxShareInWholePortfolio = rebalanceItem.maxShareInWholePortfolio;
            }
            this.calculateRows[RebalancingType.BY_AMOUNT.code].push({...calculateRow});
            this.calculateRows[RebalancingType.BY_PERCENT.code].push({...calculateRow});
            this.calculateRows[RebalancingType.RULES.code].push({...calculateRow});
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
        this.rebalancingService.calculateRows(this.currentTypeRows, this.moneyAmount, this.onlyBuyTrades, this.currentTab);
        await this.saveRebalancing(this.currentTypeRows);
    }

    private async saveRules(): Promise<void> {
        await this.saveRebalancing(this.currentTypeRows);
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

    private async onCurrencyChange(): Promise<void> {
        if (this.currency !== CurrencyUnit.RUB.code) {
            const res = await this.tradeService.getCurrencyFromTo(this.currency, CurrencyUnit.RUB.code, DateUtils.formatDayMonthYear(DateUtils.currentDate()));
        }
    }

    private async setFreeBalanceAndCalculate(): Promise<void> {
        this.moneyAmount = new BigMoney(this.freeBalance).amount.toString();
        await this.calculate();
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

    private isRebalancingNotEmpty(row: CalculateRow): boolean {
        return !!row.maxShare || !!row.minShare || !!row.minShareInWholePortfolio || !!row.maxShareInWholePortfolio;
    }

    private isRuleApplied(row: CalculateRow): boolean {
        return Number(row.currentPercent) > Number(row.minShare) &&
            Number(row.currentPercent) < Number(row.maxShare) &&
            Number(row.percCurrShareInWholePortfolio) > Number(row.minShareInWholePortfolio) &&
            Number(row.percCurrShareInWholePortfolio) < Number(row.maxShareInWholePortfolio);
    }

    private getRuleIcon(row: CalculateRow): string {
        return this.isRuleApplied(row) ? "fas fa-check" : "fas fa-times";
    }

    private getRuleText(row: CalculateRow): string {
        if (this.isRuleApplied(row)) {
            return "Все правила по бумаге выполняются";
        } else {
            const inShareType = row.assetType;
            const result: string[] = [];
            if (Number(row.minShare) !== 0 && Number(row.currentPercent) < Number(row.minShare)) {
                result.push(`Текущая доля <b>${row.ticker}</b> в ${this.getAssetName(row.assetType)} меньше допустимой`);
            }
            if (Number(row.maxShare) !== 0 && Number(row.currentPercent) > Number(row.maxShare)) {
                result.push(`Текущая доля <b>${row.ticker}</b> в ${this.getAssetName(row.assetType)} больше допустимой`);
            }
            if (Number(row.minShareInWholePortfolio) !== 0 && Number(row.percCurrShareInWholePortfolio) < Number(row.minShareInWholePortfolio)) {
                result.push(`Текущая доля <b>${row.ticker}</b> в портфеле меньше допустимой`);
            }
            if (Number(row.maxShareInWholePortfolio) !== 0 && Number(row.percCurrShareInWholePortfolio) > Number(row.maxShareInWholePortfolio)) {
                result.push(`Текущая доля <b>${row.ticker}</b> в портфеле больше допустимой`);
            }
            return result.join("<br/>");
        }
    }

    private getAssetName(assetType: string): string {
        switch (assetType) {
            case AssetType.STOCK.enumName:
                return "Акциях";
            case AssetType.BOND.enumName:
                return "Облигациях";
            case AssetType.ASSET.enumName:
                return "Активах";
            default:
                return "";
        }
    }

    private get totalAmount(): string {
        return this.currentTypeRows.map(row => new Decimal(this.calculationsInLots ? row.amountForLots : row.amountForPieces))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0")).toString();
    }

    private get totalCurrentPercent(): string {
        return this.currentTypeRows.map(row => new Decimal(row.currentPercent)).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private get totalTargetPercent(): string {
        return this.currentTypeRows.map(row => new Decimal(row.targetPercent || "0.00"))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP).toString();
    }

    private get currentTypeRows(): CalculateRow[] {
        return this.calculateRows ? this.calculateRows[this.currentTab.code] : null;
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
        return this.currentTypeRows.length === 0;
    }

    private get required(): string {
        return this.currentTab === RebalancingType.BY_PERCENT ? "" : "required";
    }
}