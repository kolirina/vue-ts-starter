import {Filters} from "../platform/filters/Filters";
import {TableName} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {TradeRow} from "../types/types";

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

    // 2018-09-12T21:00:00Z
    static getDateString(date: string): string {
        if (date) {
            return date.substr(0, date.indexOf("T"));
        }
        return null;
    }

    static getTimeString(date: string): string {
        if (date) {
            return date.substr(date.indexOf("T") + 1, 5);
        }
        return null;
    }
}
