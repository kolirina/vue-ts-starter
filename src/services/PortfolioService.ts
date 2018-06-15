import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Overview, Portfolio} from '../types/types';
import {Cache} from "../platform/services/cache";
import {ClientService} from './ClientService';

import {HTTP} from "../platform/services/http";

const PORTFOLIOS_KEY = "PORTFOLIOS";

@Service("PortfolioService")
@Singleton
export class PortfolioService {

    private cacheService = (<Cache> Container.get(Cache));
    private clientService: ClientService = (<ClientService>Container.get(ClientService));

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
        console.log("INIT PORTFOLIO SERVICE");
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
        const overview = <Overview>(await HTTP.get(`http://localhost:8080/api/portfolios/${id}/overview`)).data;
        const trades = (await HTTP.get(`http://localhost:8080/api/portfolios/${id}/trades`)).data;
        return {id, trades, overview};
    }
}