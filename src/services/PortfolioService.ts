import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Overview, Portfolio} from '../types/types';
import {Cache} from "../platform/services/cache";
import axios from 'axios';
import {ClientService} from './ClientService';
import {Storage} from '../platform/services/storage';

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Ключ под которым хранится токен пользователя */
const TOKEN_KEY = "INTELINVEST_TOKEN";
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
        const token = localStorage.get(TOKEN_KEY, null);
        if (!token) {
            throw new Error('Не задан токен для получения портфелей');
        }
        const overview = <Overview>(await axios.get(`http://localhost:8080/api/portfolios/${id}/overview`, {
            headers: {
                authorization: `Bearer ${token}`
            }
        })).data;
        const trades = (await axios.get(`http://localhost:8080/api/portfolios/${id}/trades`, {
            headers: {
                Authorization: `Bearer ${token}`,
                contentType: 'application/json'
            }
        })).data;
        return {id, trades, overview};
    }
}