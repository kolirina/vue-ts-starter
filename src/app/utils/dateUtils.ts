import * as moment from 'moment';
import {Moment} from 'moment';

/**
 * Утилитный клас для работы с датами
 */
export class DateUtils {

    /**
     * Проверяет что переданная дата указывает на текущий день
     * @param {moment.Moment} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата - текущий день, иначе {@code false}
     */
    static isCurrentDate(date: Moment): boolean {
        return moment().startOf('day').isSame(date.clone().startOf('day'));
    }

    /**
     * Проверяет что переданная дата находится в рамках текущего года
     * @param {moment.Moment} date проверяемая дата
     * @return {boolean} {@code true} если переданная дата находится в рамках текущего года, иначе {@code false}
     */
    static isCurrentYear(date: Moment): boolean {
        return moment().startOf('year').isSame(date.clone().startOf('year'));
    }

    /**
     * Возвращает объект типа {@link Moment} из строки в указанном формате (по умолчанию - {@link DateFormat.DATE}
     * @param {string} stringValue строковое значение даты
     * @return {moment.Moment}
     */
    static parseDate(stringValue: string): Moment {
        return moment(stringValue);
    }

    /**
     * Форматирование даты для отображения
     * @param {moment.Moment} date дата
     * @param {boolean} showYear признак необходимости отображения года, если год в дате не соответствует текущему
     * @return {string} отформатированная дата
     */
    static formatDisplayDate(date: Moment, showYear = true): string {
        return DateUtils.isCurrentDate(date) ? 'Сегодня' :
            date.format(!showYear || DateUtils.isCurrentYear(date) ? DateFormat.CURRENT_YEAR_FORMAT : DateFormat.ANOTHER_YEAR_FORMAT);
    }
}

/**
 * Перечисление используемых форматов даты (см. {@link https://momentjs.com/docs/#/parsing/string-format/})
 */
export enum DateFormat {
    DATE = 'L',  // DD.MM.YYYY
    CURRENT_YEAR_FORMAT = 'DD MMMM',
    ANOTHER_YEAR_FORMAT = 'DD MMMM YYYY'
}