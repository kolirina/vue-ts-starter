import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {StockHistoryResponce, BondHistoryResponce} from "../types/types";

@Service("MarketHistoryService")
@Singleton
export class MarketHistoryService {

    async getStockHistory(ticker: string, date: string): Promise<StockHistoryResponce> {
        return (await HTTP.INSTANCE.get(`/history/stock/${ticker}`, {
            params: {
                date: date
            }
        })).data as StockHistoryResponce
    }

    async getBondHistory(secid: string, date: string): Promise<BondHistoryResponce> {
        return (await HTTP.INSTANCE.get(`/history/bond/${secid}`, {
            params: {
                date: date
            }
        })).data as BondHistoryResponce
    }

}
