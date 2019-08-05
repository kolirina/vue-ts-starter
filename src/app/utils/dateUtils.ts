import dayjs from "dayjs";

/**
 * Утилитный клас для работы с датами
 */
export class DateUtils {

    private constructor() {
    }

    /**
     * Проверяет что переданная дата указывает на текущий день
     * @param {dayjs.Dayjs} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата - текущий день, иначе {@code false}
     */
    static isCurrentDate(date: dayjs.Dayjs): boolean {
        return dayjs().isSame(date, "day");
    }

    /**
     * Проверяет что переданная дата меньше текущей
     * @param {dayjs.Dayjs} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата - текущий день, иначе {@code false}
     */
    static isBefore(date: dayjs.Dayjs): boolean {
        return dayjs().isAfter(date, "day");
    }

    /**
     * Проверяет что переданная дата находится в рамках текущего года
     * @param {dayjs.Dayjs} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата находится в рамках текущего года, иначе {@code false}
     */
    static isCurrentYear(date: dayjs.Dayjs): boolean {
        return dayjs().isSame(date, "year");
    }

    /**
     * Возвращает объект типа {@link dayjs.Dayjs} из строки
     * @param {string} stringValue строковое значение даты
     * @return {dayjs.Dayjs}
     */
    static parseDate(stringValue: string): dayjs.Dayjs {
        return dayjs(stringValue);
    }

    /**
     * Форматирование даты для отображения
     * @param {dayjs.Dayjs} date дата
     * @param {boolean} showYear признак необходимости отображения года, если год в дате не соответствует текущему
     * @return {string} отформатированная дата
     */
    static formatDisplayDate(date: dayjs.Dayjs, showYear: boolean = true): string {
        return DateUtils.isCurrentDate(date) ? "Сегодня" :
            date.format(!showYear || DateUtils.isCurrentYear(date) ? DateFormat.CURRENT_YEAR_FORMAT : DateFormat.ANOTHER_YEAR_FORMAT);
    }

    /**
     * Форматирование даты для отображения
     * @param date дата
     * @param format формат
     * @return {string} отформатированная дата
     */
    static formatDate(date: dayjs.Dayjs, format: string = DateFormat.DATE): string {
        return date.format(format);
    }

    /**
     * Возвращает текущую дату
     * @return {string} текущая дата в виде строки
     */
    static currentDate(): string {
        return DateUtils.formatDate(dayjs(), DateFormat.DATE2);
    }

    /**
     * Возвращает текущую дату
     * @return {string} текущая дата в виде строки
     */
    static currentTime(): string {
        return DateUtils.formatDate(dayjs(), DateFormat.TIME);
    }

    /**
     * Возвращает дату начала месяца
     * @param year год
     * @param month месяц
     * @return {string} дата начала месяца в виде строки
     */
    static startMonthDate(year: number, month: number): string {
        return dayjs(year + "-" + (month + 1) + "-" + "01").format(DateFormat.DATE2);
    }

    /**
     * Возвращает дату конца месяца
     * @param year год
     * @param month месяц
     * @return {string} дата конца месяца в виде строки
     */
    static endMonthDate(year: number, month: number): string {
        return dayjs(year + "-" + (month + 1) + "-" + new Date(year, month + 1, 0).getDate()).format(DateFormat.DATE2);
    }

    /**
     * Форматирование даты для отображения на странице
     * @param date дата для форматирования
     * @return {string} дата для отображения на странице
     */
    static formatMonthYear(date: string): string {
        return dayjs(date).format(DateFormat.DATE3);
    }

    /**
     * Возвращает год даты
     * @param date дата
     * @return {number} год даты в формате числа
     */
    static getYearDate(date: string): number {
        return dayjs(date).year();
    }

    /**
     * Возвращает месяц даты
     * @param date дата
     * @return {number} месяц даты в формате числа
     */
    static getMonthDate(date: string): number {
        return dayjs(date).month();
    }

    /**
     * Возвращает месяц даты
     * @param date дата
     * @return {string} месяц даты в формате строки
     */
    static getNameMonthDate(date: string): string {
        return dayjs(date).format("MMMM");
    }
}

/**
 * Перечисление используемых форматов даты (см. {@link https://momentjs.com/docs/#/parsing/string-format/})
 */
export enum DateFormat {
    DATE = "DD.MM.YYYY",
    DATE2 = "YYYY-MM-DD",
    DATE3 = "MMMM YYYY",
    DATE_TIME = "DD.MM.YYYY HH:mm",
    TIME = "HH:mm",
    CURRENT_YEAR_FORMAT = "DD MMMM",
    ANOTHER_YEAR_FORMAT = "DD MMMM YYYY"
}
