import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {Share} from "../types/types";

@Service("EventService")
@Singleton
export class EventService {

    /** Стандартный набор типов для фильтрации если в локалсторедж ничего нету */
    readonly CALENDAR_EVENTS: string[] = [
        "coupon",
        "amortization",
        "dividend",
        "repayment",
        "custom"
    ];

    /** Массив типов для фильтрации */
    calendarEvents: string[] = null;

    @Inject
    private http: Http;
    @Inject
    private localStorage: Storage;

    constructor() {
        const eventsFromStorage = this.localStorage.get<string[]>("calendarEventsParams", null);
        this.calendarEvents = eventsFromStorage ? [...eventsFromStorage] : [...this.CALENDAR_EVENTS];
    }

    /**
     * Возвращает список событий пользователя
     * @param portfolioId идентификатор портфеля
     */
    async getEvents(portfolioId: number): Promise<EventsResponse> {
        return this.http.get<EventsResponse>(`/events/list/${portfolioId}`);
    }

    /**
     * Возвращает список событий пользователя
     * @param dateParams даты начала и конца месяца
     * @param filterEvents типы ивентов для начальной фильтрации
     */
    async getCalendarEvents(dateParams: any, filterEvents: string[]): Promise<any> {
        const result: any[] = await this.http.post(`/events/calendar`, dateParams);
        const map = {};
        result.forEach((e) => {
            if (filterEvents.includes(e.styleClass)) {
                ((map as any)[e.startDate] = (map as any)[e.startDate] || []).push(e);
            }
        });
        return map;
    }

    /**
     * Возвращает список событий пользователя
     * @param filterEvents типы ивентов для фильтрации
     */
    async setCaneldarEvents(filterEvents: string[]): Promise<void> {
        this.localStorage.set<string[]>("calendarEventsParams", filterEvents);
    }

    /**
     * Возвращает список дивидендных новостей
     * @param portfolioId идентификатор портфеля
     */
    async getDividendNews(portfolioId: number): Promise<DividendNewsItem[]> {
        return this.http.get<DividendNewsItem[]>(`/events/news/${portfolioId}`);
    }

    /**
     * Исполняет все события пользователя с зачислением денег или без
     * @param portfolioId идентификатор портфеля
     * @param withMoney признак исполнения событий с зачислением денег
     */
    async executeAllEvents(portfolioId: number, withMoney: boolean): Promise<void> {
        await this.http.post(`/events/list/${portfolioId}/execute`, null, {withMoney});
    }

    /**
     * Удаляет все события пользователя
     * @param portfolioId идентификатор портфеля
     */
    async deleteAllEvents(portfolioId: number): Promise<void> {
        await this.http.post(`/events/list/${portfolioId}/delete`);
    }

    /**
     * Удаляет все события пользователя
     * @param request запрос на отклонение сделки
     */
    async rejectEvent(request: RejectShareEventRequest): Promise<void> {
        await this.http.post(`/events/reject`, request);
    }
}

/** Информация о событии по ценной бумаге */
export interface ShareEvent {
    /** Бумага события */
    share: Share;
    /** Дата наступления события */
    date: string;
    /** Начисление на одну бумагу (включая налог) */
    amountPerShare: string;
    /** Начисление на одну бумагу за вычетом налога */
    cleanAmountPerShare: string;
    /** Количество бумаг события */
    quantity: number;
    /** Идентификатор портфеля */
    portfolioId: number;
    /** Признак исполненного события */
    executed: boolean;
    /** Комментарий к событию (используется для сделки) */
    comment: string;
    /** Налог с начисления */
    tax: string;
    /** Итоговая сумма начисления (за вычетом налога) */
    cleanAmount: string;
    /** Итоговая сумма начисления (включая налог) */
    totalAmount: string;
    /** Назавание события */
    label: string;
    /** Период выплаты */
    period?: string;
    /** Тип события */
    type: string;
}

/** Информация для отклонения события по ценной бумаге */
export interface RejectShareEventRequest {
    /** Бумага события */
    shareId: number;
    /** Дата наступления события */
    date: string;
    /** Количество бумаг события */
    quantity: number;
    /** Идентификатор портфеля */
    portfolioId: number;
    /** Итоговая сумма начисления (включая налог) */
    totalAmount: string;
    /** Период выплаты */
    period?: string;
    /** Тип события */
    type: string;
}

/** Поля события, необходимые для диа */
export interface EventFields {
    quantity: number;
    amount: string;
    note: string;
    perOne: boolean;
    eventPeriod: string;
    eventDate: string;
}

/** Информация о событиях портфеля */
export interface EventsResponse {
    /** Список событий */
    events: ShareEvent[];
    /** Агрегированная информация по событиям */
    eventsAggregateInfo: EventsAggregateInfo;
}

/** Агрегированная информация по событиям */
export interface EventsAggregateInfo {
    /** Сумма начислений событий по дивидендам */
    totalDividendsAmount: string;
    /** Сумма начислений событий по купонам */
    totalCouponsAmount: string;
    /** Сумма начислений событий по амортизации */
    totalAmortizationsAmount: string;
    /** Сумма начислений событий по погашениям */
    totalRepaymentsAmount: string;
    /** Сумма начислений событий по всем событиям */
    totalAmount: string;
}

/** Сущность дивидендной новости */
export interface DividendNewsItem {
    /** Тикер */
    ticker: string;
    /** Краткое название */
    shortname: string;
    /** Дата собрания */
    meetDate?: string;
    /** Дата фиксации реестра */
    cutDate?: string;
    /** Ставка, рекомендованная по обыкновенным акциям */
    recCommonValue?: string;
    /** Ставка, рекомендованная по привилегированным акциям */
    recPrivilegedValue?: string;
    /** Ставка, определенная по обыкновенным акциям */
    usualCommonValue?: string;
    /** Ставка, определенная по привилегированным акциям */
    usualPrivilegedValue?: string;
    /** Дивиденды за период */
    period?: string;
    /** Дата появления события в ленте новостей */
    foundDate?: string;
    /** Источник */
    source?: string;
    /** ИНН эмитента */
    inn?: string;
    /** Дивидендная доходность (TODO сделать расчет на дату отсечки) */
    yield: string;
    /** Валюта начисления */
    currency: string;
    /** ISIN эмитента */
    isin?: string;
    /** Идентификатор бумаги в системе */
    stockId: number;
}