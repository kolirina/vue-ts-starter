import {Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {HTTP} from "../platform/services/http";
import {StockHistoryResponce} from "../types/types";

@Service("StockHistoryService")
@Singleton
export class StockHistoryService {

    async getStockHistory(ticker: string, date: string): Promise<StockHistoryResponce> {
        return (await HTTP.INSTANCE.get(`/history/stock/${ticker}`, {
            params: {
                date: date
            }
        })).data as StockHistoryResponce
    }

}
