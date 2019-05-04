import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http, UrlParams} from "../platform/services/http";
import {BaseChartDot, Dot, EventChartData, HighStockEventData, HighStockEventsGroup} from "../types/charts/types";
import {Bond, BondInfo, Currency, PageableResponse, Share, Stock, StockDynamic, StockInfo} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {CommonUtils} from "../utils/commonUtils";

@Service("MarketService")
@Singleton
export class MarketService {

    @Inject
    private http: Http;

    async paperSearch(value: string): Promise<void> {
        console.log(value);
    }

    async searchStocks(query: string): Promise<Share[]> {
        const result: Share[] = await this.http.get("/market/stocks/search", {query});
        return result || [];
    }

    async searchBonds(query: string): Promise<Share[]> {
        const result: Share[] = await this.http.get("/market/bonds/search", {query});
        return result || [];
    }

    async getStockInfo(ticker: string): Promise<StockInfo> {
        const result = await this.http.get<_stockInfo>(`/market/stock/${ticker}/info`);
        return {
            stock: result.stock,
            history: this.convertDots(result.history),
            dividends: result.dividends,
            stockDynamic: result.stockDynamic,
            events: this.convertStockEvents(result.dividends, ticker)
        } as StockInfo;
    }

    async getStockById(id: number): Promise<StockInfo> {
        const result = await this.http.get<_stockInfo>(`/market/stock/${id}/info-by-id`);
        return {
            stock: result.stock,
            history: this.convertDots(result.history),
            dividends: result.dividends,
            stockDynamic: result.stockDynamic,
            events: this.convertStockEvents(result.dividends, result.stock.ticker)
        } as StockInfo;
    }

    async getBondById(id: number): Promise<BondInfo> {
        const result = await this.http.get<_bondInfo>(`/market/bond/${id}/info-by-id`);
        return {
            bond: result.bond,
            history: this.convertDots(result.history),
            payments: ChartUtils.convertBondPayments(result.payments),
            events: ChartUtils.processEventsChartData(result.payments)
        };
    }

    async getBondInfo(secid: string): Promise<BondInfo> {
        const result = await this.http.get<_bondInfo>(`/market/bond/${secid}/info`);
        return {
            bond: result.bond,
            history: this.convertDots(result.history),
            payments: ChartUtils.convertBondPayments(result.payments),
            events: ChartUtils.processEventsChartData(result.payments)
        };
    }

    /**
     * Загружает и возвращает список акций
     */
    async loadStocks(offset: number = 0, pageSize: number = 50, sortColumn: string, descending: boolean = false): Promise<PageableResponse<Stock>> {
        const urlParams: UrlParams = {offset, pageSize};
        if (sortColumn) {
            urlParams.sortColumn = sortColumn.toUpperCase();
        }
        if (CommonUtils.exists(descending)) {
            urlParams.descending = descending;
        }
        return this.http.get<PageableResponse<Stock>>(`/market/stocks`, urlParams);
    }

    /**
     * Загружает и возвращает список облигаций
     */
    async loadBonds(offset: number = 0, pageSize: number = 50, sortColumn: string, descending: boolean = false): Promise<PageableResponse<Bond>> {
        const urlParams: UrlParams = {offset, pageSize};
        if (sortColumn) {
            urlParams.sortColumn = sortColumn.toUpperCase();
        }
        if (CommonUtils.exists(descending)) {
            urlParams.descending = descending;
        }
        return this.http.get<PageableResponse<Bond>>(`/market/bonds`, urlParams);
    }

    /**
     * Загружает и возвращает список валюты
     */
    async loadCurrencies(): Promise<Currency[]> {
        return this.http.get<Currency[]>(`/market/currency`);
    }

    /**
     * Загружает и возвращает список акций из индекса ММВБ
     */
    async loadTopStocks(): Promise<Stock[]> {
        return this.http.get<Stock[]>(`/market/top-stocks`);
    }

    private convertDots(dots: _baseChartDot[]): Dot[] {
        const result: Dot[] = [];
        dots.forEach(value => {
            result.push([new Date(value.date).getTime(), value.amount]);
        });
        return result || [];
    }

    private convertStockEvents(events: BaseChartDot[], ticker: string): HighStockEventsGroup {
        const data: HighStockEventData[] = [];
        events.forEach(dot => {
            data.push({text: `Дивиденд на сумму ${dot.amount}`, title: "D", x: new Date(dot.date).getTime()});
        });
        return {
            type: "flags",
            data: data,
            onSeries: "dataseries",
            shape: "circlepin",
            color: "#93D8FF",
            fillColor: "#93D8FF",
            stackDistance: 20,
            width: 10
        };
    }
}

/** Информация по акции */
type _stockInfo = {
    /** Акция */
    stock: Stock;
    /** История цены */
    history: _baseChartDot[];
    /** Дивиденды */
    dividends: BaseChartDot[];
    /** Динамика */
    stockDynamic: StockDynamic;
};

/** Информация по акции */
type _bondInfo = {
    /** Облигация */
    bond: Bond;
    /** История цены */
    history: _baseChartDot[];
    /** Выплаты по бумаге */
    payments: EventChartData[];
};

export type _baseChartDot = {
    date: string,
    amount: number
};
