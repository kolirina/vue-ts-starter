import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {Storage} from '../platform/services/storage';
import {ErrorInfo, TradeDataRequest, TradeRow} from '../types/types';
import {HTTP} from '../platform/services/http';

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

@Service('TradeService')
@Singleton
export class TradeService {

    async saveTrade(req: TradeDataRequest): Promise<ErrorInfo> {
        let result = null;
        await HTTP.INSTANCE.post('/trades', req).catch(reason => {
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
}
