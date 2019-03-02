import {Container, Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http, UrlParams} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {TradeListType} from "../types/tradeListType";
import {PageableResponse, TradeRow} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";

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
     * @param offset смещение
     * @param limit размер страницы
     * @param sortColumn колонка сортировка
     * @param descending направление сортировки
     * @param filter фильтр
     * @returns {Promise<TradeRow[]>}
     */
    async loadTrades(id: string, offset: number = 0, limit: number = 50, sortColumn: string, descending: boolean = false,
                     filter: TradesFilterRequest): Promise<PageableResponse<TradeRow>> {
        const urlParams: UrlParams = {offset, limit, ...filter};
        if (sortColumn) {
            urlParams.sortColumn = sortColumn.toUpperCase();
        }
        if (CommonUtils.exists(descending)) {
            urlParams.descending = descending;
        }
        const result = await this.http.get<PageableResponse<TradeRow>>(`/trades/pageable/${id}`, urlParams);
        result.content = result.content.map(this.correctMoneyOperation);

        return result;
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

    /**
     * Загружает и возвращает сделки по тикеру в портфеле
     * @param portfolioId идентификатор портфеля
     * @param asset тип актива
     * @param operation тип операции
     * @param ticker тикер
     * @param date дата
     * @returns данные с суммной начисления и количеством
     */
    async getSuggestedInfo(portfolioId: string, asset: string, operation: string, ticker: string, date: string): Promise<SuggestedQuantityResponse> {
        const request: SuggestedQuantityRequest = {
            portfolioId, asset, operation, ticker, date
        };
        return this.http.post<SuggestedQuantityResponse>("/trades/suggest", request);
    }

    private correctMoneyOperation(trade: TradeRow): TradeRow {
        if (AssetType.valueByName(trade.asset) === AssetType.MONEY) {
            const operation = Operation.valueByName(trade.operation);
            switch (operation) {
                case Operation.BUY:
                    trade.operation = Operation.DEPOSIT.enumName;
                    break;
                case Operation.SELL:
                    trade.operation = Operation.WITHDRAW.enumName;
                    break;
            }
        }
        return trade;
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
    portfolioId: string;
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
export interface TradesFilter {
    listType?: TradeListType;
    operation?: Operation[];
    showMoneyTrades?: boolean;
    showLinkedMoneyTrades?: boolean;
    search?: string;
}

export interface TradesFilterRequest {
    listType?: string;
    operation?: string[];
    showMoneyTrades?: boolean;
    showLinkedMoneyTrades?: boolean;
    search?: string;
}

/** Сущность запроса количества бумаг и начисления в портфеле для опереденного актива на дату */
export interface SuggestedQuantityRequest {

    /** Актив сделки */
    asset: string;
    /** Операция над активом */
    operation: string;
    /** Идентификатор портфеля */
    portfolioId: string;
    /** Тикер для акции или isin для облигации. Используется для поиска бумаги */
    ticker: string;
    /** Дата */
    date: string;
}

/** Сущность ответа на запрос количества бумаг в портфеле для опереденного актива на дату */
export interface SuggestedQuantityResponse {

    /** Размер начисления */
    amount: string;
    /** Количество */
    quantity: number;
}