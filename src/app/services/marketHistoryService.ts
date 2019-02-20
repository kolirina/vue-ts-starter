import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {BondHistoryResponse, StockHistoryResponse} from "../types/types";

@Service("MarketHistoryService")
@Singleton
export class MarketHistoryService {

    @Inject
    private http: Http;

    /**
     * TODO кеширование исторических значений
     * @param ticker
     * @param date
     */
    async getStockHistory(ticker: string, date: string): Promise<StockHistoryResponse> {
        return this.http.get<StockHistoryResponse>(`/history/stock/${ticker}`, {date: date});
    }

    /**
     * TODO кеширование исторических значений
     * @param secid
     * @param date
     */
    async getBondHistory(secid: string, date: string): Promise<BondHistoryResponse> {
        return this.http.get<BondHistoryResponse>(`/history/bond/${secid}`, {date: date});
    }

}
