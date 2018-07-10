import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {Storage} from '../platform/services/storage';
import {Bond, BondInfo, Share, Stock, StockInfo} from "../types/types";
import {BaseChartDot, ColumnChartData, ColumnDataSeries, Dot, EventChartData, HighStockEventData, HighStockEventsGroup} from "../types/charts/types";
import {Decimal} from 'decimal.js';
import {ChartUtils} from "../utils/ChartUtils";

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

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
            history: this.convertDots(result.historyJson),
            dividends: result.dividendsJson,
            events: this.convertStockEvents(result.dividendsJson, ticker)
        };
    }

    async getBondInfo(isin: string): Promise<BondInfo> {
        const result = (await HTTP.INSTANCE.get<_bondInfo>(`/market/bond/${isin}/info`)).data;
        return {
            bond: result.bond,
            history: this.convertDots(result.historyJson),
            payments: this.convertBondPayments(result.paymentsJson),
            events: ChartUtils.processEventsChartData(result.paymentsJson)
        };
    }

    private convertDots(dots: BaseChartDot[]): Dot[] {
        const result: Dot[] = [];
        dots.forEach(value => {
            result.push([new Date(value.date).getTime(), new Decimal(value.amount).toNumber()]);
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
            result[current.backgroundColor].data.push(new Decimal(current.description.substring(current.description.indexOf(" ") + 1, current.description.length)).toNumber());
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
    historyJson: BaseChartDot[];
    /** Дивиденды */
    dividendsJson: BaseChartDot[];
}

/** Информация по акции */
type _bondInfo = {
    /** Облигация */
    bond: Bond;
    /** История цены */
    historyJson: BaseChartDot[];
    /** Выплаты по бумаге */
    paymentsJson: EventChartData[];
}