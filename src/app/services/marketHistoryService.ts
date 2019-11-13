import {Decimal} from "decimal.js";
import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {LineChartItem} from "../types/charts/types";
import {Asset, AssetHistoryResponse, Bond, BondHistoryResponse, Stock, StockHistoryResponse} from "../types/types";

@Service("MarketHistoryService")
@Singleton
export class MarketHistoryService {

    @Inject
    private http: Http;

    private stockCache: { [key: string]: Stock } = {};
    private assetCache: { [key: string]: Asset } = {};
    private bondCache: { [key: string]: Bond } = {};

    /**
     * Получение исторических данных по акции на дату
     * @param ticker тикер
     * @param date дата
     */
    async getStockHistory(ticker: string, date: string): Promise<Stock> {
        const stock = this.stockCache[`${ticker}:${date}`];
        if (stock) {
            return stock;
        }
        const response = await this.http.get<StockHistoryResponse>(`/history/stock/${ticker}`, {date: date});
        this.stockCache[`${ticker}:${date}`] = response.stock;
        return response.stock;
    }

    /**
     * Получение исторических данных по активу на дату
     * @param assetId идентификатор актива
     * @param date дата
     */
    async getAssetHistory(assetId: string, date: string): Promise<Asset> {
        const asset = this.assetCache[`${assetId}:${date}`];
        if (asset) {
            return asset;
        }
        const response = await this.http.get<AssetHistoryResponse>(`/history/asset/${assetId}`, {date: date});
        this.assetCache[`${assetId}:${date}`] = response.asset;
        return response.asset;
    }

    /**
     * Получение исторических данных по облигации на дату
     * @param secid secid
     * @param date дата
     */
    async getBondHistory(secid: string, date: string): Promise<Bond> {
        const bond = this.bondCache[`${secid}:${date}`];
        if (bond) {
            return bond;
        }
        const response = await this.http.get<BondHistoryResponse>(`/history/bond/${secid}`, {date: date});
        this.bondCache[`${secid}:${date}`] = response.bond;
        return response.bond;
    }

    /**
     * Получение исторических данных по облигации на дату
     * @param index тип индекса
     * @param date дата
     */
    async getIndexHistory(index: string, date: string): Promise<any[]> {
        const data = await this.http.get<LineChartItem[]>(`/history/${index}/index-history`, {date: date});
        const result: any[] = [];
        data.forEach(value => {
            result.push([new Date(value.date).getTime(), new Decimal(value.amount).toDP(2, Decimal.ROUND_HALF_UP).toNumber()]);
        });
        return result;
    }

}
