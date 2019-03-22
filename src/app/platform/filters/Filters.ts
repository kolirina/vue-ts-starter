import {Decimal} from "decimal.js";
import {BigMoney} from "../../types/bigMoney";
import {DateFormat, DateUtils} from "../../utils/dateUtils";

const DEFAULT_SCALE = 2;
const MAX_SCALE = 3;
const DF = new Intl.NumberFormat("ru", {minimumFractionDigits: DEFAULT_SCALE, maximumFractionDigits: DEFAULT_SCALE});
const DF_NO_SCALE = new Intl.NumberFormat("ru", {maximumFractionDigits: MAX_SCALE});

export class Filters {

    static assetDesc(type: string): string {
        switch (type) {
            case "STOCK":
                return "Акции";
            case "BOND":
                return "Облигации";
            case "RUBLES":
                return "Рубли";
            case "DOLLARS":
                return "Доллары";
            case "EURO":
                return "Евро";
            case "ETF":
                return "ETF";
        }
        throw new Error("Неизвестный тип актива: " + type);
    }

    static formatMoneyAmount(value: string, needRound?: boolean, scale?: number, returnZeros: boolean = true): string {
        if (!value) {
            return returnZeros ? "0.00" : "";
        }
        const amount = new BigMoney(value);
        if (needRound) {
            const am = amount.amount.toDP(DEFAULT_SCALE, Decimal.ROUND_HALF_UP).toNumber();
            return DF.format(am);
        } else {
            return DF_NO_SCALE.format(scale ? amount.amount.toDP(scale, Decimal.ROUND_HALF_UP).toNumber() : amount.amount.toNumber());
        }
    }

    static currency(value: string): string {
        if (!value) {
            return "";
        }
        try {
           return new BigMoney(value).currency;
        } catch (e) {
            return "";
        }
    }

    static currencySymbol(value: string): string {
        if (!value) {
            return "";
        }
        try {
           return new BigMoney(value).currencySymbol;
        } catch (e) {
            return "";
        }
    }

    static formatNumber(value: string): string {
        if (!value) {
            return "0.00";
        }
        return DF.format(new Decimal(value).toDP(DEFAULT_SCALE, Decimal.ROUND_HALF_UP).toNumber());

    }

    /**
     * Фильтр форматирования даты возможностью указать произвольный формат
     * @param {string} date        дата
     * @param {string} format      формат отображаемой даты
     * @returns {string} отформатированая дата
     */
    static formatDate(date: string, format: string = DateFormat.DATE): string {
        return DateUtils.parseDate(date).format(format);
    }

    /**
     * Фильтр, обеспечивающий склонение существительных в зависимости от заданного количества
     * @param {number} n          заданное количество
     * @param {string} onePiece   склонение существительного для количества, заканчивающегося на 1 и не на 11 (1 день, 41 день, 181 день);
     * @param {string} twoPieces  склонение существительного для количества, заканчивающегося на 2/3/4 и не на 12/13/14;
     * @param {string} fivePieces склонение существительного для количества, заканчивающегося на 0/5/6/7/8/9/11/12/13/14;
     * @returns {string} существительное в нужном склонении
     */
    static declension(n: number, onePiece: string, twoPieces: string, fivePieces: string): string {
        return arguments[n % 10 === 1 && n % 100 !== 11 ? 1 : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 2 : 3];
    }
}
