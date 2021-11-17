import {DateFormat, DateUtils} from "../../utils/dateUtils";

export class Filters {

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
}
