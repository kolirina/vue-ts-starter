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
import {Http} from "../platform/services/http";
import {BigMoney} from "../types/bigMoney";

@Service("RebalancingService")
@Singleton
export class RebalancingService {

    readonly _001 = new Decimal("0.01");
    readonly ZERO = new Decimal("0.00");

    @Inject
    private http: Http;

    calculateRows(rows: CalculateRow[], totalAmountString: string, onlyBuyTrades: boolean = true, type: RebalancingType): void {
        switch (type) {
            case RebalancingType.BY_AMOUNT:
                this.calculateByAmount(rows, totalAmountString);
                break;
            case RebalancingType.BY_PERCENT:
                this.calculateByPercent(rows, totalAmountString, onlyBuyTrades);
                break;
        }
    }

    private calculateByAmount(rows: CalculateRow[], totalAmountString: string): void {
        const totalAmount = totalAmountString ? new Decimal(totalAmountString) : this.ZERO;
        rows.forEach(row => {
            const currentPercent = row.currentPercent ? new Decimal(row.currentPercent) : this.ZERO;
            const amount = totalAmount.mul(currentPercent).mul(this._001).toDP(2, Decimal.ROUND_HALF_UP);
            const price = new BigMoney(row.price).amount;
            const lotSize = new Decimal(row.lotSize);
            const lots = amount.dividedBy(price.mul(lotSize)).toDP(0, Decimal.ROUND_FLOOR);
            const pieces = amount.dividedBy(price.mul(lotSize)).mul(lotSize).toDP(0, Decimal.ROUND_FLOOR);
            const amountForLots = lots.mul(price).mul(lotSize).toDP(2, Decimal.ROUND_HALF_UP);
            const amountForPieces = pieces.mul(price).toDP(2, Decimal.ROUND_HALF_UP);

            row.pieces = pieces.toString();
            row.lots = lots.toNumber();
            row.amountForLots = amountForLots.toString();
            row.amountForPieces = amountForPieces.toString();
            row.targetPercent = this.ZERO.toString();
            row.amountAfterByLots = this.ZERO.toString();
            row.amountAfterByPieces = this.ZERO.toString();
        });
    }

    private calculateByPercent(rows: CalculateRow[], totalAmountString: string, onlyBuyTrades: boolean = true): void {
        const totalAmount = totalAmountString ? new Decimal(totalAmountString) : this.ZERO;
        // общая сумма по всем бумагам в расчете
        const rowsTotalAmount = rows.map(row => new Decimal(row.currentAmount)).reduce((result: Decimal, current: Decimal) => result.add(current), this.ZERO).plus(totalAmount);
        rows.forEach(row => {
            const currentAmount = row.currentAmount ? new Decimal(row.currentAmount) : this.ZERO;
            let currentPercent = row.currentPercent ? new Decimal(row.currentPercent) : this.ZERO;
            const targetPercent = row.targetPercent ? new Decimal(row.targetPercent) : this.ZERO;
            if (currentPercent.comparedTo(targetPercent) === 0 && totalAmount.isZero()) {
                row.amountForLots = this.ZERO.toString();
                row.amountForPieces = this.ZERO.toString();
                row.amountAfterByLots = currentAmount.toString();
                row.amountAfterByPieces = currentAmount.toString();
                return;
            }
            const isSell = targetPercent.minus(currentPercent).isNegative();
            currentPercent = onlyBuyTrades && isSell ? this.ZERO : targetPercent;
            let amount = rowsTotalAmount.mul(currentPercent.abs()).mul(this._001).minus(currentAmount).toDP(2, Decimal.ROUND_HALF_UP);
            amount = currentPercent.abs().isZero() ? this.ZERO : amount;
            amount = isSell ? amount.abs().negated() : amount;
            const price = new BigMoney(row.price).amount;
            const lotSize = new Decimal(row.lotSize);
            const lots = amount.dividedBy(price.mul(lotSize)).toDP(0, Decimal.ROUND_FLOOR);
            const pieces = amount.dividedBy(price.mul(lotSize)).mul(lotSize).toDP(0, Decimal.ROUND_FLOOR);
            const amountForLots = lots.mul(price).mul(lotSize).toDP(2, Decimal.ROUND_HALF_UP);
            const amountForPieces = pieces.mul(price).toDP(2, Decimal.ROUND_HALF_UP);

            row.targetPercent = targetPercent.toString();
            row.pieces = pieces.toString();
            row.lots = lots.toNumber();
            if (!onlyBuyTrades && isSell) {
                row.amountForLots = amountForLots.toString();
                row.amountForPieces = amountForPieces.toString();
                row.amountAfterByLots = currentAmount.plus(amountForLots).toString();
                row.amountAfterByPieces = currentAmount.plus(amountForPieces).toString();
            } else {
                row.amountForLots = amountForLots.toString();
                row.amountForPieces = amountForPieces.toString();
                row.amountAfterByLots = currentAmount.plus(amountForLots).toString();
                row.amountAfterByPieces = currentAmount.plus(amountForPieces).toString();
            }
        });
    }
}

export interface CalculateRow {
    /** Тикер */
    ticker: string;
    /** Идентификатор бумаги */
    shareId: string;
    /** Тип актива */
    assetType: string;
    /** Текущая доля */
    currentPercent: string;
    /** Целевая доля */
    targetPercent: string;
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
    /** Стоимость актива после */
    amountAfterByLots: string;
    /** Стоимость актива после */
    amountAfterByPieces: string;
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
}

export enum RebalancingType {
    BY_AMOUNT,
    BY_PERCENT,
    RULES
}