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

import Decimal from "decimal.js";
import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {BigMoney} from "../types/bigMoney";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {BondPortfolioRow, Share, StockPortfolioRow} from "../types/types";

@Service("RebalancingService")
@Singleton
export class RebalancingService {

    readonly _001 = new Decimal("0.01");
    readonly ZERO = new Decimal("0.00");
    readonly ONE = new Decimal("1");
    readonly _100 = new Decimal("100.00");

    @Inject
    private http: Http;

    calculateRows(assetRows: RebalancingAggregateRow[], incomeAmountString: string, rowLimit: number = 5, onlyBuyTrades: boolean = true, type: RebalancingType): void {
        const totalAmount: Decimal = assetRows
            .reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), [])
            .map(row => row.currentCost.plus(row.amountForLots).mul(row.targetPercent === 0 ? this.ZERO : this.ONE))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        assetRows.forEach(assetRow => {
            const assetAmount = incomeAmountString ? new Decimal(incomeAmountString).mul(assetRow.targetPercent === "0" ? this.ZERO : this.ONE).mul(this._001) : this.ZERO;
            const assetCurrentCost = assetRow.currentCost ? new BigMoney(assetRow.currentCost).amount : this.ZERO;
            this.calculateAssetRows(assetRow.rows, assetAmount.toString(), assetCurrentCost, totalAmount, rowLimit, onlyBuyTrades, type);
        });
        const usedTotalAmount = assetRows.reduce((previousValue, currentValue) => currentValue.rows.concat(previousValue), [])
            .map(row => new Decimal(row.amountForLots))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        assetRows.forEach(assetRow => {
            this.calculateResultPercents(assetRow.rows, totalAmount.plus(usedTotalAmount));
        });
    }

    calculateAssetRows(rows: CalculateRow[], incomeAmountString: string, assetCurrentCost: Decimal, portfolioTotalAmount: Decimal, rowLimit: number = 5,
                       onlyBuyTrades: boolean = true, type: RebalancingType): void {
        this.resetRows(rows);
        const targetPercents = rows.map(row => new Decimal((type === RebalancingType.BY_PERCENT ? row.targetPercent : row.currentPercent) || "0.00"))
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"))
            .toDP(2, Decimal.ROUND_HALF_UP);
        if (!targetPercents.equals(this._100)) {
            throw Error("Сумма целевых долей должна составлять 100%");
        }
        const totalAmount = incomeAmountString ? new Decimal(incomeAmountString) : this.ZERO;
        this.calculateRowLimits(rows, totalAmount, assetCurrentCost, rowLimit, onlyBuyTrades, type);
        if (!this.isRebalancingAllowed(rows)) {
            throw Error("Попробуйте увеличить сумму внесения или допуск");
        }
        // считаем минимально допустмые размеры покупок
        for (const row of rows) {
            const price = new BigMoney(row.price).amount;
            const lotSize = new Decimal(row.lotSize);
            const minLots = row.min.div(row.lotPrice).floor();
            if (minLots.lessThan(this.ZERO) && onlyBuyTrades) {
                continue;
            }
            row.lots = minLots.toNumber();
            row.amountForLots = minLots.mul(row.lotPrice).toDP(2, Decimal.ROUND_HALF_UP).toString();
        }
        const currentAmounts = rows.map(row => new Decimal(row.amountForLots)).reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        // проверяем что минимальная сумма меньше или равна вносимой
        if (currentAmounts.greaterThan(totalAmount)) {
            throw Error("Попробуйте увеличить сумму внесения или допуск");
        }
        // доводим до оптимума размеры покупок
        let deltaTotalAmount = totalAmount.minus(currentAmounts);
        rows.sort((row1: CalculateRow, row2: CalculateRow): number => row2.lotPrice.comparedTo(row1.lotPrice));
        deltaTotalAmount = this.optimizeRebalancing(rows, "opt", deltaTotalAmount);
        // проверяем дальнейшую возможность оптимизации
        // остаток денег должен быть больше чем размер лота хотя бы по одной бумаге
        const continueRebalancing = rows.map(row => new Decimal(row.lotPrice)).some(lotPrice => lotPrice.lessThanOrEqualTo(deltaTotalAmount));
        if (continueRebalancing) {
            // если все еще остаток есть, доводим до максимума
            deltaTotalAmount = this.optimizeRebalancing(rows, "max", deltaTotalAmount);
        }
    }

    private optimizeRebalancing(rows: CalculateRow[], field: string, deltaTotalAmount: Decimal): Decimal {
        let deltaTotalAmountInner = deltaTotalAmount;
        rows.forEach(row => {
            // console.log("-------------------------------------- BEFORE", deltaTotalAmountInner.toString());
            if (deltaTotalAmountInner.lessThanOrEqualTo(this.ZERO)) {
                return;
            }
            let lots = (row as any)[field].minus(row.amountForLots).div(row.lotPrice).abs().toDP(0, Decimal.ROUND_DOWN);
            if (lots.greaterThan(this.ZERO)) {
                let amountForLots = lots.mul(row.lotPrice).toDP(2, Decimal.ROUND_HALF_UP);
                let newDeltaDiff = deltaTotalAmountInner.minus(amountForLots);
                // console.log(field, row.ticker, amountForLots.toString(), lots.toString());
                if (newDeltaDiff.greaterThanOrEqualTo(this.ZERO)) {
                    row.lots = Number(row.lots) + lots.toNumber();
                    row.amountForLots = new Decimal(row.amountForLots).plus(amountForLots).toString();
                    deltaTotalAmountInner = deltaTotalAmountInner.minus(amountForLots);
                } else if (newDeltaDiff.lessThan(this.ZERO) && deltaTotalAmountInner.greaterThan(this.ZERO)) {
                    // если размер оптимизанной покупки больше остатка, пробуем купить на остаток
                    lots = deltaTotalAmountInner.div(row.lotPrice).abs().toDP(0, Decimal.ROUND_DOWN);
                    if (lots.greaterThan(this.ZERO)) {
                        amountForLots = lots.mul(row.lotPrice).toDP(2, Decimal.ROUND_HALF_UP);
                        newDeltaDiff = deltaTotalAmountInner.minus(amountForLots);
                        if (newDeltaDiff.greaterThanOrEqualTo(this.ZERO)) {
                            row.lots = Number(row.lots) + lots.toNumber();
                            row.amountForLots = new Decimal(row.amountForLots).plus(amountForLots).toString();
                            deltaTotalAmountInner = deltaTotalAmountInner.minus(amountForLots);
                        }
                    }
                }
            }
            // console.log("-------------------------------------- AFTER", deltaTotalAmountInner.toString());
        });
        return deltaTotalAmountInner;
    }

    private calculateRowLimits(rows: CalculateRow[], totalAmount: Decimal, assetCurrentCost: Decimal, rowLimit: number = 5,
                               onlyBuyTrades: boolean = true, type: RebalancingType): void {
        const total = totalAmount.plus(assetCurrentCost);
        rows.forEach(row => {
            row.amountForLots = "0";
            row.lots = 0;
            const percent = new Decimal(type === RebalancingType.BY_PERCENT ? row.targetPercent : row.currentPercent);
            if (percent.equals(this.ZERO)) {
                const currentCost = new Decimal(row.currentCost).abs().negated();
                row.min = currentCost;
                row.opt = currentCost;
                row.max = currentCost;
                row.lotPrice = new BigMoney(row.price).amount.mul(new Decimal(row.lotSize));
                return;
            }
            row.min = total.mul(percent.minus(new Decimal(rowLimit))).mul(this._001).minus(row.currentCost).toDP(2, Decimal.ROUND_HALF_UP);
            row.opt = total.mul(percent).mul(this._001).minus(row.currentCost).toDP(2, Decimal.ROUND_HALF_UP);
            row.max = total.mul(percent.plus(new Decimal(rowLimit))).mul(this._001).minus(row.currentCost).toDP(2, Decimal.ROUND_HALF_UP);
            row.lotPrice = new BigMoney(row.price).amount.mul(new Decimal(row.lotSize));
        });
    }

    private calculateResultPercents(rows: CalculateRow[], portfolioTotalAmount: Decimal): void {
        if (rows.every(row => row.currentPercent === row.targetPercent)) {
            rows.forEach(row => {
                if (Math.abs(Number(row.amountForLots)) === 0) {
                    row.resultPercent = row.currentPercent;
                }
            });
        }
        for (const row of rows) {
            // if (row.targetPercent === 0) {
            //     row.resultPercent = 0;
            //     continue;
            // }
            const currentCost = row.currentCost.plus(new Decimal(row.amountForLots));
            row.resultPercent = currentCost.mul(this._100).div(portfolioTotalAmount).toDP(2, Decimal.ROUND_HALF_UP).toNumber();
        }
    }

    private resetRows(rows: CalculateRow[]): void {
        rows.forEach(row => {
            row.amountForLots = "0";
            row.lots = 0;
            row.min = this.ZERO;
            row.opt = this.ZERO;
            row.max = this.ZERO;
            row.lotPrice = this.ZERO;
            row.resultPercent = 0;
        });
    }

    private isRebalancingAllowed(rows: CalculateRow[]): boolean {
        return rows.every(row => {
            const lotMin = row.min.div(row.lotPrice).floor();
            const lotMax = row.max.div(row.lotPrice).floor();
            return lotMin.lessThanOrEqualTo(lotMax);
        });
    }
}

export interface CalculateRow {
    share: Share;
    /** Тикер */
    ticker: string;
    /** Тикер */
    name?: string;
    /** Идентификатор бумаги */
    shareId: string;
    /** Тип актива */
    assetType: string;
    /** Текущая стоимость */
    currentCost: Decimal;
    /** Текущая доля */
    currentPercent: number;
    /** Итоговая доля */
    resultPercent: number;
    /** Целевая доля */
    targetPercent: number;
    /** Размеро лота */
    lotSize: number;
    /** Текущая цена */
    price: string;
    /** Лотов для покупки */
    lots: number;
    /** Шт. для покупки */
    pieces: string;
    /** Сумма */
    amountForLots: string;
    /** Сумма */
    amountForPieces: string;
    /** Текущая стоимость актива */
    currentAmount: string;
    /** Процентная доля строки в от общей стоимости всех активов, входящих в портфель */
    percCurrShareInWholePortfolio: string;
    /** Минимальная доля внутри актива */
    minShare?: string;
    /** Максимальная доля внутри актива */
    maxShare?: string;
    /** Целевая доля во всем портфеле */
    targetShareInWholePortfolio?: string;
    /** Минимальная доля во всем портфеле */
    minShareInWholePortfolio?: string;
    /** Максимальная доля во всем портфеле */
    maxShareInWholePortfolio?: string;
    min?: Decimal;
    opt?: Decimal;
    max?: Decimal;
    lotPrice?: Decimal;
}

export interface RebalancingAggregateRow {
    assetType: PortfolioAssetType;
    rows: CalculateRow[];
    targetPercent: string;
    currentCost: string;
}

export type ShareRow = StockPortfolioRow | BondPortfolioRow;

@Enum("code")
export class RebalancingType extends (EnumType as IStaticEnum<RebalancingType>) {

    static readonly BY_AMOUNT = new RebalancingType("BY_AMOUNT", "Сохранить текущие доли");
    static readonly BY_PERCENT = new RebalancingType("BY_PERCENT", "Задать доли вручную");
    static readonly RULES = new RebalancingType("RULES", "Правила");

    private constructor(public code: string, public description: string) {
        super();
    }
}
