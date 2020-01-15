import dayjs from "dayjs";
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

    /** Операции начислений */
    static readonly CALCULATION_OPERATIONS = [Operation.COUPON, Operation.DIVIDEND, Operation.AMORTIZATION];

    private constructor() {
    }

    /**
     * Возвращает строковое представление цены сделки. Используется для вывода цены в таблице Сделки, диалоге Сделки по бумаге.
     * Не производит дополнительных преобразований с ценой.
     * @param trade сделка
     */
    static getPrice(trade: TradeRow): string {
        return this.moneyPrice(trade) ? String(new BigMoney(trade.moneyPrice).amount) : this.percentPrice(trade) ? trade.bondPrice : null;
    }

    static getFee(trade: TradeRow): string {
        return (trade.asset === AssetType.MONEY.enumName && ![Operation.CURRENCY_BUY, Operation.CURRENCY_SELL].includes(Operation.valueByName(trade.operation))) ? null :
            Filters.formatMoneyAmount(trade.fee, true, null, false);
    }

    static percentPrice(trade: TradeRow): boolean {
        const tradeOperation = Operation.valueByName(trade.operation);
        return trade.asset === AssetType.BOND.enumName && tradeOperation !== Operation.COUPON && tradeOperation !== Operation.AMORTIZATION;
    }

    static moneyPrice(trade: TradeRow): boolean {
        const tradeOperation = Operation.valueByName(trade.operation);
        return [AssetType.STOCK.enumName, AssetType.ASSET.enumName].includes(trade.asset) || [Operation.COUPON, Operation.AMORTIZATION].includes(tradeOperation);
    }

    static tradeTable(assetType: AssetType, operation: Operation): string {
        if (assetType === AssetType.ASSET) {
            return TableName.ASSET_TRADE;
        } else if (assetType === AssetType.BOND) {
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
            dayjs().isBefore(DateUtils.parseDate(clientInfo.paidTill));
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

    static currencySymbolByAmount(value: string): string {
        if (value) {
            return new BigMoney(value).currencySymbol;
        }
        return null;
    }

    static markupClasses(amount: number): string[] {
        return [amount > 0 ? "ii--green-markup" : amount < 0 ? "ii--red-markup" : "", "ii-number-cell", "text-xs-right"];
    }

    static isCalculationAssetType(operation: Operation): boolean {
        return TradeUtils.CALCULATION_OPERATIONS.includes(operation);
    }
}
