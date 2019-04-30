import {Decimal} from "decimal.js";
import {BigMoney} from "../../types/bigMoney";
import {DateFormat, DateUtils} from "../../utils/dateUtils";
import {TradeUtils} from "../../utils/tradeUtils";

const DEFAULT_SCALE = 2;
const MAX_SCALE = 3;
const NO_SCALE = 9;
const DF = new Intl.NumberFormat("ru", {minimumFractionDigits: DEFAULT_SCALE, maximumFractionDigits: DEFAULT_SCALE});
const DF_MAX_SCALE = new Intl.NumberFormat("ru", {maximumFractionDigits: MAX_SCALE});
const DF_NO_SCALE = new Intl.NumberFormat("ru", {minimumFractionDigits: DEFAULT_SCALE, maximumFractionDigits: NO_SCALE});

export class Filters {

    private static readonly UNITS = ["Б", "Кб", "Мб", "Гб", "Тб", "Пб", "Эб", "Зб", "Йб"];

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

    static formatMoneyAmount(value: string, needRound?: boolean, scale?: number, returnZeros: boolean = true, needFormat: boolean = true): string {
        if (!value) {
            return returnZeros ? "0.00" : "";
        }
        const amount = new BigMoney(value);
        if (needRound) {
            const am = amount.amount.toDecimalPlaces(DEFAULT_SCALE, Decimal.ROUND_HALF_UP).toNumber();
            return Filters.replaceCommaToDot(DF.format(am));
        } else {
            return Filters.replaceCommaToDot(needFormat ? DF_MAX_SCALE.format(scale ? amount.amount.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP).toNumber() :
                amount.amount.toNumber()) : String(amount.amount.toNumber()));
        }
    }

    static currencySymbolByCurrency(value: string): string {
        if (!value) {
            return "";
        }
        return TradeUtils.getCurrencySymbol(value);
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

    /**
     * Используется для форматирования чисел
     * @param value строка
     * @param returnZeros признак возврата нулевого значения вместо пустого
     * @param scale
     * @param needFormat
     */
    static formatNumber(value: string, returnZeros: boolean = true, scale?: number, needFormat: boolean = true): string {
        if (!value) {
            return returnZeros ? "0.00" : "";
        }
        const amount = new Decimal(value);
        return Filters.replaceCommaToDot(needFormat ? DF_NO_SCALE.format(scale ? amount.toDecimalPlaces(scale, Decimal.ROUND_HALF_UP).toNumber() :
            amount.toNumber()) : String(amount.toNumber()));

    }

    /**
     * Используется для форматирования размера файла
     * @param value размер в байтах
     */
    static formatBytes(value: string): string {
        if (typeof value !== "number" || isNaN(value)) {
            return value;
        }
        const num = Number(value);
        if (num === 0) {
            return "0 Байт";
        }
        if (isNaN(parseFloat(value)) && !isFinite(value)) {
            return value;
        }
        const k = 1024;
        const dm = 2;
        const i = Math.floor(Math.log(num) / Math.log(k));

        return parseFloat((num / Math.pow(k, i)).toFixed(dm)) + " " + Filters.UNITS[i];
    }

    /**
     * Используется для форматирования только целых чисел!!!
     * @param value строка
     */
    static formatInteger(value: string): string {
        if (!value) {
            return "0";
        }
        return Filters.replaceCommaToDot(DF_MAX_SCALE.format(new Decimal(value).toDP(0, Decimal.ROUND_HALF_UP).toNumber()));

    }

    /**
     * Фильтр форматирования даты возможностью указать произвольный формат
     * @param {string} date        дата
     * @param {string} format      формат отображаемой даты
     * @returns {string} отформатированая дата
     */
    static formatDate(date: string, format: string = DateFormat.DATE): string {
        const parsed = DateUtils.parseDate(date);
        return parsed.isValid() ? parsed.format(format) : date;
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

    private static replaceCommaToDot(value: string): string {
        try {
            return value.replace(",", ".");
        } catch (e) {
            return value;
        }
    }
}
