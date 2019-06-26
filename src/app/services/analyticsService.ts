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

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";

@Service("AnalyticsService")
@Singleton
export class AnalyticsService {

    @Inject
    private http: Http;

    /**
     * Возвращает данные по доходностям бенчмарков в сравнении с доходностью портфеля
     * @param portfolioId
     */
    async getComparedYields(portfolioId: string): Promise<YieldCompareData> {
        return this.http.get<YieldCompareData>(`/analytics/compare-yields/${portfolioId}`);
    }

    /**
     * Возвращает данные по ставкам депозитов за последние 6 месяцев
     */
    async getRatesForLastSixMonths(): Promise<DepositRate[]> {
        return this.http.get<DepositRate[]>("/analytics/deposit-rates");
    }

    /**
     * Возвращает данные по инфляции за последние 6 месяцев
     */
    async getInflationForLastSixMonths(): Promise<Inflation[]> {
        return this.http.get<Inflation[]>("/analytics/inflation");
    }
}

/** Информация по доходностям */
export interface YieldCompareData {
    /** Среднегодовая доходность портфеля */
    portfolioYearYield: string;
    /** Среднегодовая доходность индекса МосБиржи */
    micexYearYield: string;
    /** Среднегодовая доходность депозита */
    depositYearYield: string;
    /** Среднегодовая инляция */
    inflationYearYield: string;
}

/** Сущность ставки по депоизиту */
export interface DepositRate {
    /** Дата */
    date: string;
    /** Ставка */
    value: string;
}

/** Сущность записи по инфляции */
export interface Inflation {
    /** Дата */
    date: string;
    /** Значение */
    value: string;
    /** Тип (0 - в годовом выражении, 1 - помесячная) */
    type: string;
}