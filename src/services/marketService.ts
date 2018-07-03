import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {Storage} from '../platform/services/storage';
import {Share, Stock, StockInfo} from "../types/types";
import {BaseChartDot, Dot, HighStockEventData, HighStockEventsGroup} from "../types/charts/types";
import {Decimal} from 'decimal.js';

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
        const result = (await HTTP.INSTANCE.get<_stockInfo>(`/market/stock/${ticker}/stock-info`)).data;
        return {
            stock: result.stock,
            history: this.convertDots(result.historyJson),
            dividends: result.dividendsJson,
            events: this.convertEvents(result.dividendsJson, ticker)
        };
    }

    private convertDots(dots: BaseChartDot[]): Dot[] {
        const result: Dot[] = [];
        dots.forEach(value => {
            result.push([new Date(value.date).getTime(), new Decimal(value.amount).toNumber()]);
        });
        return result || [];
    }

    private convertEvents(events: BaseChartDot[], ticker: string): HighStockEventsGroup {
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
