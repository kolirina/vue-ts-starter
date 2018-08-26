import {Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {BaseChartDot, ColumnChartData, ColumnDataSeries, Dot, EventChartData, HighStockEventData, HighStockEventsGroup} from '../types/charts/types';
import {Bond, BondInfo, Share, Stock, StockInfo} from '../types/types';
import {ChartUtils} from '../utils/ChartUtils';

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

    async searchBonds(query: string): Promise<Share[]> {
        console.log('searchBonds');
        const result: Share[] = (await HTTP.INSTANCE.get('/market/bonds/search', {
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

    async getBondInfo(secid: string): Promise<BondInfo> {
        const result = (await HTTP.INSTANCE.get<_bondInfo>(`/market/bond/${secid}/info`)).data;
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
            data.push({text: `Дивиденд на сумму ${dot.amount}`, title: 'D', x: new Date(dot.date).getTime()});
        });
        return {
            type: 'flags',
            data: data,
            onSeries: 'dataseries',
            shape: 'circlepin',
            color: '#93D8FF',
            fillColor: '#93D8FF',
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
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(':'));
            paymentTypes[paymentType] = paymentType;
        });

        const result: { [key: string]: ColumnDataSeries } = {};
        // раскладываем по массивам с пустыми блоками: Купон: [10, 20, 30, null], Амортизация: [null, null, null, 100]
        data.forEach(eventItem => {
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(':'));
            Object.keys(paymentTypes).forEach(key => {
                result[key] = result[key] || {name: key, data: []};
                const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(':'));
                if (key === paymentType) {
                    result[key].data.push(parseFloat(eventItem.description.substring(eventItem.description.indexOf(' ') + 1, eventItem.description.length)));
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
