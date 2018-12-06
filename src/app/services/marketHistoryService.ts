import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {BondHistoryResponse, StockHistoryResponse} from "../types/types";

@Service("MarketHistoryService")
@Singleton
export class MarketHistoryService {

    async getStockHistory(ticker: string, date: string): Promise<StockHistoryResponse> {
        return (await HTTP.INSTANCE.get(`/history/stock/${ticker}`, {
            params: {
                date: date
            }
        })).data as StockHistoryResponse;
    }

    async getBondHistory(secid: string, date: string): Promise<BondHistoryResponse> {
        return (await HTTP.INSTANCE.get(`/history/bond/${secid}`, {
            params: {
                date: date
            }
        })).data as BondHistoryResponse;
    }

}
