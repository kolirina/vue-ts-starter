import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {BaseChartDot, ColumnChartData, ColumnDataSeries, Dot, EventChartData, HighStockEventData, HighStockEventsGroup} from "../types/charts/types";
import {Bond, BondInfo, Currency, PageableResponse, Share, Stock, StockInfo} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";

@Service("MarketService")
@Singleton
export class MarketService {

    @Inject
    private http: Http;

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
            events: this.convertStockEvents(result.dividends, ticker)
        };
    }

    async getShareById(id: number): Promise<StockInfo> {
        const result = await this.http.get<_stockInfo>(`/market/stock/${id}/info-by-id`);
        return {
            stock: result.stock,
            history: this.convertDots(result.history),
            dividends: result.dividends,
            events: this.convertStockEvents(result.dividends, result.stock.ticker)
        };
    }

    async getBondInfo(secid: string): Promise<BondInfo> {
        const result = await this.http.get<_bondInfo>(`/market/bond/${secid}/info`);
        return {
            bond: result.bond,
            history: this.convertDots(result.history),
            payments: this.convertBondPayments(result.payments),
            events: ChartUtils.processEventsChartData(result.payments)
        };
    }

    /**
     * Загружает и возвращает список акций
     */
    async loadStocks(offset: number = 0, pageSize: number = 50, sortColumn: string, descending: boolean = false): Promise<PageableResponse<Stock>> {
        return this.http.get<PageableResponse<Stock>>(`/market/stocks`,
            {pageSize, offset, sortColumn: sortColumn ? sortColumn.toUpperCase() : null, descending});
    }

    /**
     * Загружает и возвращает список облигаций
     */
    async loadBonds(offset: number = 0, pageSize: number = 50, sortColumn: string, descending: boolean = false): Promise<PageableResponse<Bond>> {
        return this.http.get<PageableResponse<Bond>>(`/market/bonds`,
            {pageSize, offset, sortColumn: sortColumn ? sortColumn.toUpperCase() : null, descending});
    }

    /**
     * Загружает и возвращает список валюты
     */
    async loadCurrencies(): Promise<Currency[]> {
        return this.http.get<Currency[]>(`/market/currency`);
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

    private convertBondPayments(data: EventChartData[]): ColumnChartData {
        const series: ColumnDataSeries[] = [];
        const categoryNames: string[] = [];
        const paymentTypes: { [key: string]: string } = {};
        const events: HighStockEventData[] = [];
        // собираем категории (даты выплат) и типы платежей
        data.forEach(eventItem => {
            categoryNames.push(eventItem.date);
            // тип выплаты: купон, амортизация, погашение
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(":"));
            paymentTypes[paymentType] = paymentType;
        });

        const result: { [key: string]: ColumnDataSeries } = {};
        // раскладываем по массивам с пустыми блоками: Купон: [10, 20, 30, null], Амортизация: [null, null, null, 100]
        data.forEach(eventItem => {
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(":"));
            Object.keys(paymentTypes).forEach(key => {
                result[key] = result[key] || {name: key, data: []};
                const pt = eventItem.description.substring(0, eventItem.description.indexOf(":"));
                if (key === pt) {
                    result[key].data.push(parseFloat(eventItem.description.substring(eventItem.description.indexOf(" ") + 1, eventItem.description.length)));
                } else {
                    result[key].data.push(null);
                }
            });
        });
        Object.keys(result).forEach(key => {
            series.push({name: key, data: result[key].data});
        });
        return {categoryNames, series};
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
