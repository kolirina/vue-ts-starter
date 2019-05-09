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
     * Возвращает объект типа {@link dayjs.Dayjs} из строки в указанном формате (по умолчанию - {@link DateFormat.DATE}
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
}

/**
 * Перечисление используемых форматов даты (см. {@link https://momentjs.com/docs/#/parsing/string-format/})
 */
export enum DateFormat {
    DATE = "DD.MM.YYYY",
    DATE2 = "YYYY-MM-DD",
    DATE_TIME = "DD.MM.YYYY HH:mm",
    TIME = "HH:mm",
    CURRENT_YEAR_FORMAT = "DD MMMM",
    ANOTHER_YEAR_FORMAT = "DD MMMM YYYY"
}
