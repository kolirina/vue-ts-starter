import {Filters} from "../platform/filters/Filters";
import {ShareEvent} from "../services/eventService";
import {TableName} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {ErrorInfo, TradeRow} from "../types/types";

export class TradeUtils {

    private constructor() {
    }

    static getPrice(trade: TradeRow): string {
        return this.moneyPrice(trade) ? Filters.formatMoneyAmount(trade.moneyPrice, true) : this.percentPrice(trade) ? trade.bondPrice :
            null;
    }

    static getFee(trade: TradeRow): string {
        return trade.asset === AssetType.MONEY.enumName ? null : Filters.formatMoneyAmount(trade.fee, true);
    }

    static percentPrice(trade: TradeRow): boolean {
        return trade.asset === AssetType.BOND.enumName && trade.operation !== Operation.COUPON.enumName && trade.operation !== Operation.AMORTIZATION.enumName;
    }

    static moneyPrice(trade: TradeRow): boolean {
        return trade.asset === AssetType.STOCK.enumName || (trade.operation === Operation.COUPON.enumName && trade.operation === Operation.AMORTIZATION.enumName);
    }

    static tradeTable(assetType: AssetType, operation: Operation): string {
        if (assetType === AssetType.BOND) {
            return TableName.BOND_TRADE;
        } else if (operation === Operation.DIVIDEND) {
            return TableName.DIVIDEND_TRADE;
        }
        return TableName.STOCK_TRADE;
    }

    static decimal(value: string, abs: boolean = false): string {
        if (value) {
            const amount = new BigMoney(value).amount;
            return String(abs ? amount.abs() : amount);
        }
        return null;
    }

    static eventNote(event: ShareEvent): string {
        const type = Operation.valueByName(event.type);
        switch (type) {
            case Operation.DIVIDEND:
                return `Зачисление дивидендов по акции ${event.share.shortname} (${event.share.ticker})` +
                    `${event.period ? `за период ${event.period}` : ""}, дата отсечки: ${event.date}`;
            case Operation.COUPON:
                return `Зачисление купона по облигации ${event.share.shortname} (${event.share.ticker}), дата выплаты купона: ${event.date}`;
            case Operation.AMORTIZATION:
                return `Амортизация номинала по облигации ${event.share.shortname} (${event.share.ticker}), дата выплаты амортизации: ${event.date}`;
            case Operation.REPAYMENT:
                return `Погашение облигации ${event.share.shortname} (${event.share.ticker}), дата: ${event.date}`;
        }
        throw new Error(`Неизвестный тип события ${type}`);
    }

    // 2018-09-12T21:00:00Z
    static getDateString(date: string): string {
        if (date) {
            const timeDateIndex = date.indexOf("T");
            return timeDateIndex === -1 ? date : date.substr(0, timeDateIndex);
        }
        return null;
    }

    static getTimeString(date: string): string {
        if (date) {
            return date.substr(date.indexOf("T") + 1, 5);
        }
        return null;
    }

    static getGlobalMessage(error: ErrorInfo): string {
        const fieldError = error.fields[0];
        if (error.errorCode === "GLOBAL" && fieldError && fieldError.errorMessage) {
            return fieldError.errorMessage;
        }
        return error.message;
    }
}
