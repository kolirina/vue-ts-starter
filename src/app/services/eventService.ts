import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {CombinedInfoRequest, Share} from "../types/types";
import {DateFormat, DateUtils} from "../utils/dateUtils";

@Service("EventService")
@Singleton
export class EventService {

    @Inject
    private http: Http;

    /**
     * Загружает события и агрегированную информацию по ним
     * @param portfolioId идентификатор портфеля
     */
    async getEvents(portfolioId: number): Promise<EventsResponse> {
        return this.http.get<EventsResponse>(`/events/list/${portfolioId}`);
    }

    /**
     * Загружает события и агрегированную информацию по ним
     * @param portfolioId идентификатор портфеля
     */
    async getFutureEvents(portfolioId: number): Promise<EventsResponse> {
        return this.http.get<EventsResponse>(`/events/list/${portfolioId}/future`);
    }

    /**
     * Загружает события и агрегированную информацию по ним
     * @param viewCurrency валюта портфеля
     * @param ids идентификаторы портфелей
     */
    async getFutureEventsCombined(viewCurrency: string, ids: number[]): Promise<EventsResponse> {
        const request: CombinedInfoRequest = {viewCurrency, ids};
        return this.http.post<EventsResponse>(`/events/list/combined/future`, request);
    }

    /**
     * Загружает события и агрегированную информацию по ним для составного портфеля
     * @param viewCurrency валюта портфеля
     * @param ids идентификаторы портфелей
     */
    async getEventsCombined(viewCurrency: string, ids: number[]): Promise<EventsResponse> {
        const request: CombinedInfoRequest = {viewCurrency, ids};
        return this.http.post<EventsResponse>("/events/list/combined", request);
    }

    /**
     * Получаем данные ивентов календаря
     * @param dateParams даты начала и конца месяца
     */
    async getCalendarEvents(dateParams: CalendarDateParams): Promise<CalendarEvent[]> {
        const events = await this.http.post<CalendarEvent[]>("/events/calendar", dateParams);
        return events.map(event => {
            return {
                ...event,
                date: DateUtils.formatDate(DateUtils.parseDate(event.date), DateFormat.DATE2)
            } as CalendarEvent;
        });
    }

    /**
     * Возвращает данные событий календаря для составного портфеля
     * @param dateParams даты начала и конца месяца
     * @param viewCurrency валюта портфеля
     * @param ids идентификаторы портфелей
     */
    async getCalendarEventsCombined(dateParams: CalendarDateParams, viewCurrency: string, ids: number[]): Promise<CalendarEvent[]> {
        const request = {...dateParams, viewCurrency, ids};
        const events = await this.http.post<CalendarEvent[]>("/events/calendar/combined", request);
        return events.map(event => {
            return {
                ...event,
                date: DateUtils.formatDate(DateUtils.parseDate(event.date), DateFormat.DATE2)
            } as CalendarEvent;
        });
    }

    /**
     * Возвращает список новостей
     * @param portfolioId идентификатор портфеля
     */
    async getEventNews(portfolioId: number): Promise<EventNewsResponse> {
        return this.http.get<EventNewsResponse>(`/events/news/${portfolioId}`);
    }

    /**
     * Возвращает список новостей для составного портфеля
     * @param viewCurrency валюта портфеля
     * @param ids идентификаторы портфелей
     */
    async getEventNewsCombined(viewCurrency: string, ids: number[]): Promise<EventNewsResponse> {
        const request: CombinedInfoRequest = {viewCurrency, ids};
        return this.http.post<EventNewsResponse>("/events/news/combined", request);
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

@Enum("code")
export class CalendarEventType extends (EnumType as IStaticEnum<CalendarEventType>) {

    static readonly COUPON = new CalendarEventType("coupon", "Купон");
    static readonly AMORTIZATION = new CalendarEventType("amortization", "Амортизация");
    static readonly REPAYMENT = new CalendarEventType("repayment", "Погашение");
    static readonly DIVIDEND_HISTORY = new CalendarEventType("dividend_history", "Дивиденд (История)");
    static readonly DIVIDEND_NEWS = new CalendarEventType("dividend_news", "Дивиденды (Новости)");
    static readonly USER = new CalendarEventType("user", "Пользовательские");

    private constructor(public code: string, public description: string) {
        super();
    }
}

/** Параметры даты для отправки в апи календаря */
export interface CalendarDateParams {
    /** Дата начала фильтрации */
    start: string;
    /** Дата окончания фильтрации */
    end: string;
    /** Типы событий календаря */
    calendarEventTypes?: CalendarType[];
}

/** Объект событий календаря, с ключом по дате */
export interface CalendarParams {
    [key: string]: CalendarEvent[];
}

/** Базовая сущность события календаря */
export interface CalendarEvent {
    /** Дата начала фильтрации */
    type: CalendarType;
    /** Краткое описание события (Купон, Дивиденд) */
    description: string;
    /** Дата события. Для дивидендной новости это дата отсечки */
    date: string;
    /** Сумма начисления */
    amount: string;
    /** Тикер бумаги */
    ticker: string;
    /** Краткое название бумги */
    shortName: string;
    /** Валюта начисления */
    currency: string;
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
    quantity: string;
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
    /** Сумма выплаты в оригинальной валюте */
    totalAmountOriginal: string;
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
    quantity: string;
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
    quantity: string;
    amount: string;
    amountPerShare: string;
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

/** Ответ с новостями по событиям */
export interface EventNewsResponse {
    /** Дивидендные новости */
    dividendNews: DividendNewsItem[];
    /** Новости по облигациям */
    bondNews: ShareEvent[];
}

/** Типы событий календаря */
export enum CalendarType {
    COUPON = "COUPON",
    AMORTIZATION = "AMORTIZATION",
    REPAYMENT = "REPAYMENT",
    DIVIDEND_HISTORY = "DIVIDEND_HISTORY",
    DIVIDEND_NEWS = "STOCK_NEWS",
    USER = "USER"
}
