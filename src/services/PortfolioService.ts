import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Portfolio} from "../types/types";
import {Cache} from "../platform/services/cache";

const PORTFOLIOS_KEY = "PORTFOLIOS";

@Service("PortfolioService")
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
        console.log("INIT PORTFOLIO SERVICE");
    }

    getById(id: string): Portfolio {
        let portfolio = this.cache[id];
        if (!portfolio) {
            console.log('load portfolio: ', id);
            portfolio = this.loadPortfolio(id);
            this.cache[id] = portfolio;
            return portfolio;
        }
        console.log('return portfolio: ', id);
        return portfolio;
    }

    private loadPortfolio(id: string): Portfolio {
        return _PORTFOLIOS[id];
    }
}

const _PORTFOLIOS: { [key: string]: Portfolio } = {
    '28': {
        id: '28',
        trades: [
            {
                id: '1',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '2',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '3',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '4',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82',
                comment: 'ЗАкупился по полной программме и по этому написал этот длинный коммент'
            },
            {
                id: '5',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '6',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '7',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '8',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '9',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '10',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '11',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '12',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '13',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '14',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '15',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '16',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '17',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '18',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '19',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '20',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '21',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '22',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '23',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '24',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '25',
                ticker: 'SBER',
                name: 'Сбербанк ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
        ],
        overview: {
            assets: [
                {name: 'Акции', currentCost: '9999.23', profit: '45.56', currentShare: '30.30'},
                {name: 'Облигации', currentCost: '88888.23', profit: '35.56', currentShare: '20.30'},
                {name: 'Рубли', currentCost: '77777.23', profit: '', currentShare: '18.30'},
                {name: 'Доллары', currentCost: '66666.23', profit: '', currentShare: '12.30'}
            ],
            stockRows: [
                {
                    company: 'Газпром ПАО',
                    ticker: 'GAZP',
                    avgPrice: '142.13',
                    currentPrice: '153.45',
                    currentCost: '14588.82',
                    profit: '8.87',
                    profitPercent: '10.2',
                    currentShare: '15.52'
                },
                {
                    company: 'Сбербанк ПАО',
                    ticker: 'SBER',
                    avgPrice: '225.36',
                    currentPrice: '243.36',
                    currentCost: '256369.21',
                    profit: '75084.23',
                    profitPercent: '75.23',
                    currentShare: '36.25'
                },
                {
                    company: 'Норникель',
                    ticker: 'GMKN',
                    avgPrice: '8569',
                    currentPrice: '9874',
                    currentCost: '45213',
                    profit: '1258.36',
                    profitPercent: '3.25',
                    currentShare: '25.12'
                },
                {
                    company: 'Роснефть',
                    ticker: 'ROSN',
                    avgPrice: '3589',
                    currentPrice: '4200',
                    currentCost: '42000',
                    profit: '800',
                    profitPercent: '10',
                    currentShare: '20'
                },
                {
                    company: 'Лукоил',
                    ticker: 'LKOH',
                    avgPrice: '3695',
                    currentPrice: '4236',
                    currentCost: '5400',
                    profit: '1200',
                    profitPercent: '12.36',
                    currentShare: '15.36'
                }
            ],
            bondRows: [
                {
                    company: 'ОФЗ 52012',
                    ticker: 'RU000A0ZZ927',
                    avgPrice: '101.13',
                    currentPrice: '102.45',
                    currentCost: '15088.82',
                    profit: '8.87',
                    profitPercent: '10.2',
                    currentShare: '15.52'
                },
                {
                    company: 'ОФЗ 26056',
                    ticker: 'RU0002867631',
                    avgPrice: '99.36',
                    currentPrice: '101.36',
                    currentCost: '25669.21',
                    profit: '75084.23',
                    profitPercent: '75.23',
                    currentShare: '36.25'
                },
                {
                    company: 'ОФЗ 46005',
                    ticker: 'RU000A0JT6B2',
                    avgPrice: '100,2',
                    currentPrice: '101,23',
                    currentCost: '45213',
                    profit: '1258.36',
                    profitPercent: '3.25',
                    currentShare: '25.12'
                }
            ],
            dashboard: {
                bricks: [
                    {name: 'Суммарная стоимость', mainValue: '9999.09', secondValue: '1968.11', color: 'blue', icon: 'fas fa-briefcase'},
                    {
                        name: 'Суммарная прибыль',
                        mainValue: '8888.09',
                        secondValue: '777.11',
                        secondValueDesc: 'без дивидендов и купонов',
                        color: 'orange',
                        icon: 'fas fa-money-bill-alt'
                    },
                    {name: 'Среднегодовая доходность', mainValue: '666.09', secondValue: '1968.11', color: 'green', icon: 'fas fa-chart-bar'},
                    {name: 'Изменение за день', mainValue: '555.09', secondValue: '1968.11', color: 'red', icon: 'fas fa-hand-holding-usd'}
                ]
            }
        }
    },

    '41': {
        id: '41',
        trades: [
            {
                id: '1',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '2',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '3',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '4',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82',
                comment: 'ЗАкупился по полной программме и по этому написал этот длинный коммент'
            },
            {
                id: '5',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '6',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '7',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '8',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '9',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '10',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '11',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '12',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '13',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '14',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '15',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '16',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '17',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '18',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '19',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '20',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '21',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '22',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '23',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '24',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
            {
                id: '25',
                ticker: 'GAZP',
                name: 'Газпром ПАО',
                operation: 'Покупка',
                date: '20.01.2017',
                quantity: '100',
                price: '145.78',
                fee: '9.82',
                total: '14588.82'
            },
        ],
        overview: {
            assets: [
                {name: 'Акции', currentCost: '123568.23', profit: '45.56', currentShare: '30.30'},
                {name: 'Облигации', currentCost: '23568.23', profit: '35.56', currentShare: '20.30'},
                {name: 'Рубли', currentCost: '3568.23', profit: '', currentShare: '18.30'},
                {name: 'Доллары', currentCost: '568.23', profit: '', currentShare: '12.30'}
            ],
            stockRows: [
                {
                    company: 'Газпром ПАО',
                    ticker: 'GAZP',
                    avgPrice: '142.13',
                    currentPrice: '153.45',
                    currentCost: '14588.82',
                    profit: '8.87',
                    profitPercent: '10.2',
                    currentShare: '15.52'
                },
                {
                    company: 'Сбербанк ПАО',
                    ticker: 'SBER',
                    avgPrice: '225.36',
                    currentPrice: '243.36',
                    currentCost: '256369.21',
                    profit: '75084.23',
                    profitPercent: '75.23',
                    currentShare: '36.25'
                },
                {
                    company: 'Норникель',
                    ticker: 'GMKN',
                    avgPrice: '8569',
                    currentPrice: '9874',
                    currentCost: '45213',
                    profit: '1258.36',
                    profitPercent: '3.25',
                    currentShare: '25.12'
                },
                {
                    company: 'Роснефть',
                    ticker: 'ROSN',
                    avgPrice: '3589',
                    currentPrice: '4200',
                    currentCost: '42000',
                    profit: '800',
                    profitPercent: '10',
                    currentShare: '20'
                },
                {
                    company: 'Лукоил',
                    ticker: 'LKOH',
                    avgPrice: '3695',
                    currentPrice: '4236',
                    currentCost: '5400',
                    profit: '1200',
                    profitPercent: '12.36',
                    currentShare: '15.36'
                }
            ],
            bondRows: [
                {
                    company: 'ОФЗ 52012',
                    ticker: 'RU000A0ZZ927',
                    avgPrice: '101.13',
                    currentPrice: '102.45',
                    currentCost: '15088.82',
                    profit: '8.87',
                    profitPercent: '10.2',
                    currentShare: '15.52'
                },
                {
                    company: 'ОФЗ 26056',
                    ticker: 'RU0002867631',
                    avgPrice: '99.36',
                    currentPrice: '101.36',
                    currentCost: '25669.21',
                    profit: '75084.23',
                    profitPercent: '75.23',
                    currentShare: '36.25'
                },
                {
                    company: 'ОФЗ 46005',
                    ticker: 'RU000A0JT6B2',
                    avgPrice: '100,2',
                    currentPrice: '101,23',
                    currentCost: '45213',
                    profit: '1258.36',
                    profitPercent: '3.25',
                    currentShare: '25.12'
                }
            ],
            dashboard: {
                bricks: [
                    {name: 'Суммарная стоимость', mainValue: '121988.09', secondValue: '1968.11', color: 'blue', icon: 'fas fa-briefcase'},
                    {
                        name: 'Суммарная прибыль',
                        mainValue: '121988.09',
                        secondValue: '1968.11',
                        secondValueDesc: 'без дивидендов и купонов',
                        color: 'orange',
                        icon: 'fas fa-money-bill-alt'
                    },
                    {name: 'Среднегодовая доходность', mainValue: '121988.09', secondValue: '1968.11', color: 'green', icon: 'fas fa-chart-bar'},
                    {name: 'Изменение за день', mainValue: '121988.09', secondValue: '1968.11', color: 'red', icon: 'fas fa-hand-holding-usd'}
                ]
            }
        }
    }
};