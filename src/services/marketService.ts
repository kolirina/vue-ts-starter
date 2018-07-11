import {Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {Bond, BondInfo, Share, Stock, StockInfo} from "../types/types";
import {BaseChartDot, ColumnChartData, ColumnDataSeries, Dot, EventChartData, HighStockEventData, HighStockEventsGroup} from "../types/charts/types";
import {ChartUtils} from "../utils/ChartUtils";

@Service('MarketService')
@Singleton
export class MarketService {

    async searchStocks(query: string): Promise<Share[]> {
        console.log('searchStocks');
        const result: Share[] = (await HTTP.INSTANCE.get('/market/stocks/search', {
            params: {
                query
            }
        })).data;
        return result || [];
    }

    async getStockInfo(ticker: string): Promise<StockInfo> {
        const result = (await HTTP.INSTANCE.get<_stockInfo>(`/market/stock/${ticker}/info`)).data;
        return {
            stock: result.stock,
            history: this.convertDots(result.history),
            dividends: result.dividends,
            events: this.convertStockEvents(result.dividends, ticker)
        };
    }

    async getBondInfo(isin: string): Promise<BondInfo> {
        const result = (await HTTP.INSTANCE.get<_bondInfo>(`/market/bond/${isin}/info`)).data;
        return {
            bond: result.bond,
            history: this.convertDots(result.history),
            payments: this.convertBondPayments(result.payments),
            events: ChartUtils.processEventsChartData(result.payments)
        };
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
            data.push({text: `Дивиденд ${ticker} на сумму ${dot.amount}`, title: "D", x: new Date(dot.date).getTime()})
        });
        return {
            type: 'flags',
            data: data,
            onSeries: 'dataseries',
            shape: 'circlepin',
            color: "#93D8FF",
            fillColor: "#93D8FF",
            stackDistance: 20,
            width: 10
        }
    }

    private convertBondPayments(data: EventChartData[]): ColumnChartData {
        const series: ColumnDataSeries[] = [];
        const categoryNames: string[] = [];
        const events: HighStockEventData[] = [];
        const temp = data.reduce((result: { [key: string]: ColumnDataSeries }, current: EventChartData) => {
            categoryNames.push(current.date);
            result[current.backgroundColor] = result[current.backgroundColor] || {
                name: current.description.substring(0, current.description.indexOf(':')),
                data: []
            };
            result[current.backgroundColor].data.push(parseFloat(current.description.substring(current.description.indexOf(" ") + 1, current.description.length)));
            return result
        }, {} as { [key: string]: ColumnDataSeries });
        Object.keys(temp).forEach(key => {
            series.push(temp[key])
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
}

/** Информация по акции */
type _bondInfo = {
    /** Облигация */
    bond: Bond;
    /** История цены */
    history: _baseChartDot[];
    /** Выплаты по бумаге */
    payments: EventChartData[];
}

export type _baseChartDot = {
    date: string,
    amount: number
}