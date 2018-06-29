import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {HTTP} from '../platform/services/http';
import {Storage} from '../platform/services/storage';
import {Share} from "../types/types";
import {BaseChartDot, Dot} from "../types/charts/types";
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

    async getStockPriceHistory(ticker: string): Promise<Dot[]> {
        console.log('searchStocks');
        const result: Dot[] = [];
        const data: BaseChartDot[] = (await HTTP.INSTANCE.get('/market/stocks/price-history', {
            params: {
                ticker
            }
        })).data;
        data.forEach(value => {
            result.push([new Date(value.date).getTime(), new Decimal(value.amount).toNumber()]);
        });
        return result || [];
    }
}
