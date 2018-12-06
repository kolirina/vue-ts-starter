import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {Storage} from "../platform/services/storage";
import {ErrorInfo, TradeDataRequest, TradeRow} from "../types/types";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

@Service("TradeService")
@Singleton
export class TradeService {

    async saveTrade(req: TradeDataRequest): Promise<ErrorInfo> {
        let result = null;
        await HTTP.INSTANCE.post("/trades", req).catch(reason => {
            result = reason.data;
        });
        return result;
    }

    /**
     * Загружает и возвращает сделки по тикеру в портфеле
     * @param {string} id идентификатор портфеля
     * @param {string} ticker тикер
     * @returns {Promise<TradeRow[]>}
     */
    async getShareTrades(id: string, ticker: string): Promise<TradeRow[]> {
        return await (await HTTP.INSTANCE.get(`/trades/${id}/${ticker}`)).data as TradeRow[];
    }

    /**
     * Загружает и возвращает сделки по тикеру в портфеле
     * @param {string} id идентификатор портфеля
     * @param {string} ticker тикер
     * @returns {Promise<TradeRow[]>}
     */
    async loadTrades(id: string, offset = 0, limit = 50, sortColumn: string, descending = false): Promise<TradeRow[]> {
        return (await HTTP.INSTANCE.get(`/trades/${id}`, {
            params: {
                offset, limit, sortColumn: sortColumn ? sortColumn.toUpperCase() : null, descending
            }
        })).data as TradeRow[];
    }

    /**
     * Отправляет запрос на удаление сделки
     * @param deleteTradeRequest запрос на удаление сделки
     */
    async deleteTrade(deleteTradeRequest: DeleteTradeRequest): Promise<void> {
        await HTTP.INSTANCE.post("/trades/delete", deleteTradeRequest);
    }

    /**
     * Отправляет запрос на удаление всех сделок
     * @param deleteTradeRequest запрос на удаление всех сделок
     */
    async deleteAllTrades(deleteTradeRequest: DeleteAllTradeRequest): Promise<void> {
        await HTTP.INSTANCE.post("/trades/deleteAll", deleteTradeRequest);
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
