import moment from "moment";
import {Filters} from "../platform/filters/Filters";
import {Client} from "../services/clientService";
import {ShareEvent} from "../services/eventService";
import {TableName} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {Operation} from "../types/operation";
import {Permission} from "../types/permission";
import {ErrorInfo, Portfolio, TradeRow} from "../types/types";
import {CommonUtils} from "./commonUtils";
import {DateUtils} from "./dateUtils";

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

    // 2019-03-11 00:00:00
    static getDateString(date: string): string {
        if (date) {
            const timeDateIndex = date.indexOf(" ");
            return timeDateIndex === -1 ? date : date.substr(0, timeDateIndex);
        }
        return null;
    }

    static getTimeString(date: string): string {
        if (date) {
            const separatorIndex = date.indexOf(" ");
            if (separatorIndex !== -1) {
                return date.substr(separatorIndex + 1, date.length);
            }
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

    static isPortfolioProModeEnabled(portfolio: Portfolio, clientInfo: Client): boolean {
        return portfolio && portfolio.portfolioParams.professionalMode && this.isProfessionalModeAvailable(clientInfo);
    }

    /**
     * Проверяет, доступен ли профессиональный режим
     * @return {@code true} если профессиональный режим доступен
     */
    static isProfessionalModeAvailable(clientInfo: Client): boolean {
        return clientInfo.tariff.hasPermission(Permission.PROFF_MODE) &&
            moment().isBefore(DateUtils.parseDate(clientInfo.paidTill));
    }

    static getCurrencySymbol(currencyCode: string): string {
        switch (currencyCode) {
            case "RUB":
                return "₽";
            case "USD":
                return "$";
            case "EUR":
                return "€";
        }
        return currencyCode;
    }

    static compareValues(first: any, second: any): number {
        if (!CommonUtils.exists(first) || !CommonUtils.exists(second)) {
            return first > second ? 1 : -1;
        }
        if (!isNaN(first) && !isNaN(second)) {
            return +first - +second;
        }
        const regex = new RegExp("^(RUB|RUR|USD|EUR)");
        if (regex.test(first) && regex.test(second)) {
            try {
                return new BigMoney(first).amount.comparedTo(new BigMoney(second).amount);
            } catch (ignored) {
            }
        }
        if (typeof first === "string" && typeof second === "string") {
            return first.toUpperCase() > second.toUpperCase() ? 1 : -1;
        }
        return first > second ? 1 : -1;
    }
}
