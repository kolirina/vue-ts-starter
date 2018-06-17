import {Container, Singleton} from 'typescript-ioc';
import {Service} from '../platform/decorators/service';
import {LineChartItem, Overview, Portfolio, PortfolioParams} from '../types/types';
import {Cache} from '../platform/services/cache';
import {ClientService} from './ClientService';
import {Decimal} from 'decimal.js';

import {HTTP} from '../platform/services/http';
import {BigMoney} from '../types/bigMoney';

const PORTFOLIOS_KEY = 'PORTFOLIOS';

@Service('PortfolioService')
@Singleton
export class PortfolioService {

    private cacheService = (<Cache> Container.get(Cache));

    private cache: { [key: string]: Portfolio } = {};

    private isInit = false;

    private portfolio: Portfolio = null;

    getPortfolio(): Portfolio {
        if (!this.isInit) {
            this.init();
        }
        return this.portfolio;
    }

    private init(): void {
        this.cacheService.put(PORTFOLIOS_KEY, this.cache);
        console.log('INIT PORTFOLIO SERVICE');
    }

    async getById(id: string): Promise<Portfolio> {
        let portfolio = this.cache[id];
        if (!portfolio) {
            console.log('load portfolio: ', id);
            portfolio = await this.loadPortfolio(id);
            this.cache[id] = portfolio;
            return portfolio;
        }
        console.log('return portfolio: ', id);
        return portfolio;
    }

    private async loadPortfolio(id: string): Promise<Portfolio> {
        const portfolio = <PortfolioParams>(await HTTP.get(`/portfolios/${id}`)).data;
        const overview = <Overview>(await HTTP.get(`/portfolios/${id}/overview`)).data;
        // проставляем идентификаторы чтобы работали разворачиваютщиеся блоки в табилицах
        overview.stockPortfolio.rows.forEach((value, index) => value.id = index.toString());
        overview.bondPortfolio.rows.forEach((value, index) => value.id = index.toString());
        const trades = (await HTTP.get(`/portfolios/${id}/trades`)).data;
        return {id, portfolioParams: portfolio, trades, overview};
    }

    async getCostChart(id: string): Promise<any> {
        const data = <LineChartItem[]>(await HTTP.get(`/portfolios/${id}/cost-chart`)).data;
        const result: any[] = [];
        data.forEach(value => {
            result.push([new Date(value.date).getTime(), new BigMoney(value.amount).amount.toDP(2, Decimal.ROUND_HALF_UP).toNumber()])
        });
        return result;
    }
}
