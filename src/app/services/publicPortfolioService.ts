/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2018
 */

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {LineChartItem} from "../types/charts/types";

@Service("PublicPortfolioService")
@Singleton
export class PublicPortfolioService {

    @Inject
    private http: Http;

    private readonly ENDPOINT_BASE = "/public/portfolio-info";

    /**
     * Возвращает список публичных портфелей
     */
    async getPublicPortfolios(): Promise<PublicPortfolio[]> {
        return this.http.get<PublicPortfolio[]>(`${this.ENDPOINT_BASE}/list`);
    }

}

/** Информация по публичному портфелю */
export interface PublicPortfolio {
    /** Идентификатор портфеля */
    id: number;
    /** Название портфеля */
    name: string;
    /** Дата открытия */
    openDate: string;
    /** Идентификатор брокера */
    brokerId: number;
    /** Основная валюта портфеля */
    viewCurrency: string;
    /** Описание портфеля */
    description: string;
    /** Публичное имя пользовтеля (Для партнеров) */
    ownerName: string;
    /** Ссылка на публичный ресурс (Для партнеров) */
    ownerPublicLink: string;
    /** Количество всех рефералов */
    referralsCount: number;
    /** Количество активных платников-рефералов */
    referralsPaidCount: number;
    /** Количество лайков */
    likes: number;
    /** Количество дизлайков */
    dislikes: number;
    /** Информация об истории голоса пользователя за портфель */
    voteHistory?: VoteHistory;
    /** Текущая суммарная стоимость */
    currentCost: string;
    /** Прибыль в процентах, посчитанная относительно средневзвешенной стоимости */
    percentProfit: string;
    /** Годовая доходность портфеля */
    yearYield: string;
    /** Список данных для отрисовки графика */
    lineChartData: LineChartItem[];
}

/** Инофрмация об истории голоса пользователя за портфель */
export interface VoteHistory {
    /** Идентификатор портфеля */
    portfolioId?: number;
    /** Голос пользователя за лайк. 1 лайк, -1 дизлайк */
    value: number;
}
