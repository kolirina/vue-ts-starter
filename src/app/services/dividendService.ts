import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {DeleteTradeRequest} from "./tradeService";

@Service("DividendService")
@Singleton
export class DividendService {

    @Inject
    private http: Http;

    /**
     * Загружает и возвращает агрегированную информацию по дивидендам в портфеле
     * @param {string} id идентификатор портфеля
     * @returns {Promise<DividendAggregateInfo>}
     */
    async getDividendAggregateInfo(id: number): Promise<DividendAggregateInfo> {
        return this.http.get<DividendAggregateInfo>(`/dividends/${id}`);
    }

    /**
     * Отправляет запрос на удаление всех сделок
     * @param deleteTradeRequest запрос на удаление всех сделок
     */
    async deleteAllTrades(deleteTradeRequest: DeleteAllDividendsTradeRequest): Promise<void> {
        await this.http.post("/dividends/deleteAll", deleteTradeRequest);
    }
}

/** Агрегированная информация по дивидендам в портфеле */
export interface DividendAggregateInfo {
    /** Сущность дашборда для страницы Дивиденды */
    dividendDashboard: DividendDashboard;
    /** Сделки по дивидендам */
    dividendTrades: DividendInfo[];
    /** Суммарные дивиденды по тикерам */
    summaryDividendsByTicker: DividendInfo[];
    /** Суммарные дивиденды по годам и тикеру */
    summaryDividendsByYearAndTicker: DividendInfo[];
    /** Суммарные дивиденды по годам */
    summaryDividendsByYear: DividendsByYearRow[];
}

/** Сущность дашборда для страницы Дивиденды */
export interface DividendDashboard {
    /** Стоимость полученных дивидендов в валюте отображения */
    dividendsTotal: string;
    /** Стоимость полученных дивидендов в альтернативной валюте. Если валюта просмотра Рубль то это доллары и наоборот */
    dividendsTotalInAlternativeCurrency: string;
    /** Средняя див. доходность за все время */
    avgProfit: string;
    /** Доходность за последний год */
    lastYearYield: string;
}

/** Сущность дашборда для страницы Дивиденды */
export interface DividendInfo {
    /** Идентификатор дивидендной сделки */
    id: string;
    /** Идентификатор связанной сделки по деньгам */
    moneyTradeId: string;
    /** Дата сделки */
    date: string;
    /** Сумма сделки */
    amount: string;
    /** Количество */
    quantity: number;
    /** Сумма на одну бумагу */
    perOne: string;
    /** Дивидендная доходность по тикеру */
    yield: string;
    /** Заметка */
    note: string;
    /** Год */
    year: string;
    /** Тикер */
    ticker: string;
    /** Краткое название эмитента */
    shortName: string;
}

/** Строка с информацией о суммарных дивидендых выплатах за год */
export interface DividendsByYearRow {
    /** Сумма сделки */
    dividendsAmount: string;
    /** Сумма сделки */
    portfolioCosts: string;
    /** Дивидендная доходность по тикеру */
    yield: string;
    /** Год */
    year: string;
}

/** Запрос на удаление всех сделок по дивидендам */
export interface DeleteAllDividendsTradeRequest {
    /** Тикер */
    ticker: string;
    /** Идентификатор портфеля */
    portfolioId: number;
    /** Год */
    year: string;
}
