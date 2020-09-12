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
import {AnalyticsChartPoint, YieldCompareData} from "../types/charts/types";
import {CombinedInfoRequest} from "../types/types";

@Service("AnalyticsService")
@Singleton
export class AnalyticsService {

    @Inject
    private http: Http;

    /**
     * Возвращает данные по доходностям бенчмарков в сравнении с доходностью портфеля
     * @param portfolioId
     */
    async getComparedYields(portfolioId: number): Promise<YieldCompareData> {
        return this.http.get<YieldCompareData>(`/analytics/compare-yields/${portfolioId}`);
    }

    /**
     * Возвращает данные по доходностям бенчмарков в сравнении с доходностью портфеля по составному портфелю
     * @param viewCurrency валюта портфеля
     * @param ids идентификаторы портфелей
     */
    async getComparedYieldsCombined(viewCurrency: string, ids: number[]): Promise<YieldCompareData> {
        const request: CombinedInfoRequest = {viewCurrency, ids};
        return this.http.post<YieldCompareData>("/analytics/compare-yields/combined", request);
    }

    /**
     * Возвращает данные по ставкам депозитов за последние 6 месяцев
     */
    async getRatesForLastSixMonths(): Promise<AnalyticsChartPoint[]> {
        return this.http.get<AnalyticsChartPoint[]>("/analytics/deposit-rates");
    }

    /**
     * Возвращает данные по инфляции за последние 6 месяцев
     */
    async getInflationForLastSixMonths(): Promise<AnalyticsChartPoint[]> {
        return this.http.get<AnalyticsChartPoint[]>("/analytics/inflation");
    }
}
