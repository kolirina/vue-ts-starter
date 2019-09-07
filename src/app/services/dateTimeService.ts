/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import dayjs from "dayjs";
import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {DateFormat, DateUtils} from "../utils/dateUtils";

/**
 * Сервис для получения текущего времени
 */
@Service("DateTimeService")
@Singleton
export class DateTimeService {

    /** Сервис HTTP-транспорта */
    @Inject
    private http: Http;

    /** Разница между локальным и серверным временем */
    private serverTimeDiff: number;

    /**
     * Возвращает текущее время в формате: dd.MM.yyyy HH:mm
     * @return {string} текущее время в формате dd.MM.yyyy HH:mm
     */
    getCurrentDate(): string {
        return DateUtils.formatDate(dayjs(new Date(Date.now() + this.serverTimeDiff)), DateFormat.DATE);
    }

    /**
     * Возвращает текущее время в формате: HH:mm
     * @return {string} текущее время в формате HH:mm
     */
    getCurrentTime(): string {
        return DateUtils.formatDate(dayjs(new Date(Date.now() + this.serverTimeDiff)), DateFormat.TIME);
    }

    /**
     * Устанавливает разницу (diff) между серверным и локальным временем
     */
    async initServerTimeDiff(): Promise<void> {
        try {
            const t1 = new Date().getTime();
            const serverTime = await this.getDateTimeMilliseconds();
            const t2 = new Date().getTime();
            // находим среднее время выполнения запроса
            const requestTime = Math.round((t2 - t1) / 2);
            // находим время на клиенте, с которым нужно сравнить серверное
            const localTime = t2 - requestTime;
            this.serverTimeDiff = Number(serverTime) - localTime;
        } catch (e) {
            this.serverTimeDiff = 0;
        }
    }

    /**
     * Возвращает текущую дату и время в миллисекундах
     * @return {Promise<number>} текущее время в миллисекундах
     */
    private async getDateTimeMilliseconds(): Promise<string> {
        return await this.http.get<string>("datetime/millis");
    }
}