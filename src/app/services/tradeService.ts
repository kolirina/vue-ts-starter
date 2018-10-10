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
}
