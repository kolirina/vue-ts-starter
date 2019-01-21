import {Container, Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {Operation} from "../types/operation";
import {ErrorInfo, TradeRow} from "../types/types";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

@Service("TradeService")
@Singleton
export class TradeService {
    @Inject
    private http: Http;

    async saveTrade(req: CreateTradeRequest): Promise<void> {
        await this.http.post("/trades", req);
    }

    async editTrade(req: EditTradeRequest): Promise<void> {
        await this.http.put("/trades", req);
    }

    /**
     * Загружает и возвращает сделки по тикеру в портфеле
     * @param {string} id идентификатор портфеля
     * @param {string} ticker тикер
     * @returns {Promise<TradeRow[]>}
     */
    async getShareTrades(id: string, ticker: string): Promise<TradeRow[]> {
        return this.http.get<TradeRow[]>(`/trades/${id}/${ticker}`);
    }

    /**
     * Загружает и возвращает сделки по тикеру в портфеле
     * @param {string} id идентификатор портфеля
     * @param {string} ticker тикер
     * @returns {Promise<TradeRow[]>}
     */
    async loadTrades(id: string, offset: number = 0, limit: number = 50, sortColumn: string, descending: boolean = false, filters: TradesFilters = {}): Promise<TradeRow[]> {
        return this.http.get<TradeRow[]>(`/trades/${id}`,
            {offset, limit, sortColumn: sortColumn ? sortColumn.toUpperCase() : null, descending, ...filters});
    }

    /**
     * Отправляет запрос на удаление сделки
     * @param deleteTradeRequest запрос на удаление сделки
     */
    async deleteTrade(deleteTradeRequest: DeleteTradeRequest): Promise<void> {
        await this.http.post("/trades/delete", deleteTradeRequest);
    }

    /**
     * Отправляет запрос на удаление всех сделок
     * @param deleteTradeRequest запрос на удаление всех сделок
     */
    async deleteAllTrades(deleteTradeRequest: DeleteAllTradeRequest): Promise<void> {
        await this.http.post("/trades/deleteAll", deleteTradeRequest);
    }
}

/** Поля, содержащие информацию для удаления сделки */
export interface DeleteTradeRequest {
    /** Идентификатор сделки */
    tradeId: string;
    /** Идентификатор портфеля */
    portfolioId: string;
}

/** Поля, содержащие информацию для удаления всех сделок по бумаге */
export interface DeleteAllTradeRequest {
    /** Тип актива */
    assetType: string;
    /** Тикер */
    ticker: string;
    /** Идентификатор портфеля */
    portfolioId: string;
}

export type TradeFields = {
    /** Тикер */
    ticker: string,
    /** Дата */
    date: string,
    /** Количество */
    quantity: number,
    /** Цена */
    price: string,
    /** Номинал */
    facevalue: string,
    /** НКД */
    nkd: string,
    /** Признак начисления на одну бумагу */
    perOne: boolean,
    /** Комиссия */
    fee: string,
    /** Заметка */
    note: string,
    /** Признак списания/зачисления денег */
    keepMoney: boolean,
    /** Сумма денег для списания/зачисления */
    moneyAmount: string,
    /** Валюта сделки */
    currency: string
};

export type CreateTradeRequest = {
    /** Идентификатор портфеля */
    portfolioId: string,
    /** Признак добавления связанной сделки по деньгам */
    createLinkedTrade: boolean,
    /** Актив сделки */
    asset: string,
    /** Операция */
    operation: string,
    /** Поля, содержащию все необходимую информацию по сделке данного типа */
    fields: TradeFields
};

/** Запрос на редактирование сделки */
export interface EditTradeRequest {
    /** Идентификатор сделки */
    tradeId: string;
    /** Таблица, в которой хранится сделка */
    tableName: string;
    /** Актив сделки */
    asset: string;
    /** Операция */
    operation: string;
    /** Идентификатор портфеля */
    portfolioId: number;
    /** Добавлять ли связанную сделку по деньгам */
    createLinkedTrade: boolean;
    /** Идентификатор редактируемой сделки по деньгам (связанной) */
    editedMoneyTradeId: string;
    /** Поля, содержащию все необходимую информацию по сделке данного типа */
    fields: TradeFields;
}

/**
 * Перечисление названий таблиц
 */
export enum TableName {
    STOCK_TRADE = "STOCK_TRADE",
    BOND_TRADE = "BOND_TRADE",
    DIVIDEND_TRADE = "DIVIDEND_TRADE"
}

/**
 * Фильтры сделок
 */
export interface TradesFilters {
    listType?: string;
    operation?: string[];
    showMoneyTrades?: boolean;
    showLinkedMoneyTrades?: boolean;
    search?: string;
}
