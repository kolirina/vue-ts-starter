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
import {CalculateRow, RebalancingService, RebalancingType} from "../services/rebalancingService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {CurrencyUnit, Pagination, Portfolio, StockPortfolioRow, TableHeader} from "../types/types";
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
            </v-tabs>
            <v-layout v-if="!emptyRows" wrap align-center row fill-height class="mt-3 ma-auto maxW1100">
                <v-flex xs12>
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

    private pagination: Pagination = {
        descending: false,
        sortBy: "date",
        rowsPerPage: -1
    };

    private moneyAmount = "";

    private calculateRows: { [key: string]: CalculateRow[] } = {
        [RebalancingType.BY_AMOUNT]: [],
        [RebalancingType.BY_PERCENT]: []
    };

    private currentTab: RebalancingType = RebalancingType.BY_AMOUNT;

    created(): void {
        this.initCalculatedRow();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        this.initCalculatedRow();
    }

    private initCalculatedRow(): void {
        this.calculateRows = {
            [RebalancingType.BY_AMOUNT]: [],
            [RebalancingType.BY_PERCENT]: []
        };
        this.portfolio.overview.stockPortfolio.rows.filter(row => Number(row.quantity) > 0).forEach(row => {
            const calculateRow = {
                amountForLots: "0",
                amountForPieces: "0",
                lotSize: Number(row.share.lotsize),
                price: row.currPrice,
                currentAmount: new BigMoney(row.currCost).amount.toString(),
                lots: 0,
                pieces: "0",
                currentPercent: row.percCurrShare,
                targetPercent: row.percCurrShare,
                amountAfterByLots: "0",
                amountAfterByPieces: "0",
                ticker: row.share.ticker
            };
            this.calculateRows[RebalancingType.BY_AMOUNT].push({...calculateRow});
            this.calculateRows[RebalancingType.BY_PERCENT].push({...calculateRow});
        });
    }

    private calculate(): void {
        this.rebalancingService.calculateRows(this.currentTypeRows, this.moneyAmount, this.onlyBuyTrades, this.currentTab);
    }

    private async onCurrencyChange(): Promise<void> {
        if (this.currency !== CurrencyUnit.RUB.code) {
            const res = await this.tradeService.getCurrencyFromTo(this.currency, CurrencyUnit.RUB.code, DateUtils.formatDayMonthYear(DateUtils.currentDate()));
        }
    }

    private setFreeBalanceAndCalculate(): void {
        this.moneyAmount = new BigMoney(this.freeBalance).amount.toString();
        this.calculate();
    }

    private customSort(items: CalculateRow[], index: string, isDesc: boolean): CalculateRow[] {
        return SortUtils.simpleSort<CalculateRow>(items, index, isDesc);
    }

    private currencyForPrice(row: CalculateRow): string {
        return TradeUtils.currencySymbolByAmount(row.price).toLowerCase();
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
        return this.calculateRows ? this.calculateRows[this.currentTab] : null;
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

export type RebalancingDialogData = {
    stockRows: StockPortfolioRow[],
};
