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
            const currentAmount = row.currentAmount ? new Decimal(row.currentAmount) : this.ZERO;
            const currentPercent = row.currentPercent ? new Decimal(row.currentPercent) : this.ZERO;
            const amount = totalAmount.mul(currentPercent).mul(this._001).toDP(2, Decimal.ROUND_HALF_UP);
            const price = new Decimal(row.price);
            const lotSize = new Decimal(row.lotSize);
            const lots = amount.dividedBy(price.mul(lotSize)).toDP(0, Decimal.ROUND_FLOOR);
            const pieces = amount.dividedBy(price.mul(lotSize)).mul(lotSize).toDP(0, Decimal.ROUND_FLOOR);
            const amountForLots = lots.mul(price).mul(lotSize).toDP(2, Decimal.ROUND_HALF_UP);
            const amountForPieces = pieces.mul(price).toDP(2, Decimal.ROUND_HALF_UP);
            console.log(JSON.stringify({currentAmount, currentPercent, amount, lots, pieces}));

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
        rows.forEach(row => {
            const currentAmount = row.currentAmount ? new Decimal(row.currentAmount) : this.ZERO;
            let currentPercent = row.currentPercent ? new Decimal(row.currentPercent) : this.ZERO;
            const targetPercent = row.targetPercent ? new Decimal(row.targetPercent) : this.ZERO;
            if (currentPercent.comparedTo(targetPercent) === 0 && totalAmount.isZero()) {
                return;
            }
            const isSell = targetPercent.minus(currentPercent).isNegative();
            currentPercent = onlyBuyTrades && isSell ? this.ZERO : targetPercent;
            const amount = currentAmount.mul(isSell ? currentPercent.abs().negated() : currentPercent).mul(this._001).toDP(2, Decimal.ROUND_HALF_UP);
            const price = new Decimal(row.price);
            const lotSize = new Decimal(row.lotSize);
            const lots = amount.dividedBy(price.mul(lotSize)).toDP(0, Decimal.ROUND_FLOOR);
            const pieces = amount.dividedBy(price.mul(lotSize)).mul(lotSize).toDP(0, Decimal.ROUND_FLOOR);
            const amountForLots = lots.mul(price).mul(lotSize).toDP(2, Decimal.ROUND_HALF_UP);
            const amountForPieces = pieces.mul(price).toDP(2, Decimal.ROUND_HALF_UP);
            row.targetPercent = targetPercent.toString();

            row.pieces = pieces.toString();
            row.lots = lots.toNumber();
            if (!onlyBuyTrades && isSell) {
                row.amountForLots = currentAmount.plus(amountForLots).negated().toString();
                row.amountForPieces = currentAmount.plus(amountForPieces).negated().toString();
                row.amountAfterByLots = amountForLots.abs().toString();
                row.amountAfterByPieces = amountForPieces.abs().toString();
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
}

export enum RebalancingType {
    BY_AMOUNT,
    BY_PERCENT
}