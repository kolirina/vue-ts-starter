import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Share} from "../types/types";

@Service("EventService")
@Singleton
export class EventService {

    @Inject
    private http: Http;

    /**
     * Возвращает список событий пользователя
     * @param portfolioId идентификатор портфеля
     */
    async getEvents(portfolioId: string): Promise<EventsResponse> {
        return this.http.get<EventsResponse>(`/events/list/${portfolioId}`);
    }

    /**
     * Исполняет все события пользователя с зачислением денег или без
     * @param portfolioId идентификатор портфеля
     * @param withMoney признак исполнения событий с зачислением денег
     */
    async executeAllEvents(portfolioId: string, withMoney: boolean): Promise<void> {
        await this.http.post(`/events/list/${portfolioId}/execute`, null, {withMoney});
    }

    /**
     * Удаляет все события пользователя
     * @param portfolioId идентификатор портфеля
     */
    async deleteAllEvents(portfolioId: string): Promise<void> {
        await this.http.post(`/events/list/${portfolioId}/delete`);
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

/** Поля события, необходимые для диа */
export interface EventFields {
    quantity: number;
    amount: string;
    note: string;
    perOne: boolean;
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