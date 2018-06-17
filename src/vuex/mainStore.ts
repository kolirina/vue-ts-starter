import {Module, ActionContext} from 'vuex';
import {MutationType} from './mutationType';
import {ClientService} from '../services/ClientService';
import {Container} from 'typescript-ioc';
import {ClientInfo, LoginRequest, Portfolio} from '../types/types';
import {PortfolioService} from '../services/PortfolioService';
import {GetterType} from './getterType';
import {Storage} from '../platform/services/storage';

/** Сервис работы с клиентом */
const clientService: ClientService = Container.get(ClientService);
/** Сервис работы с клиентом */
const portfolioService: PortfolioService = Container.get(PortfolioService);
/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Ключ под которым хранится токен пользователя */
const TOKEN_KEY = "INTELINVEST_TOKEN";

/** Состояния хранилища */
export class StateHolder {
    /** Информация о клиенте */
    clientInfo: ClientInfo = null;
    /** Текущий выбранный портфель */
    currentPortfolio: Portfolio = null;
    /** Версия стора */
    version = '1.0'
}

const Getters = {
    [GetterType.PORTFOLIO](state: StateHolder): Portfolio {
        return state.currentPortfolio;
    },
    [GetterType.CLIENT_INFO](state: StateHolder): ClientInfo {
        return state.clientInfo;
    }
};

/** Мутаторы хранилища */
const Mutations = {
    /** Мутатор проставлящий информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](state: StateHolder, clientInfo: ClientInfo): void {
        state.clientInfo = clientInfo;
        localStorage.set(TOKEN_KEY, clientInfo.token);
    },
    [MutationType.SET_CURRENT_PORTFOLIO](state: StateHolder, portfolio: Portfolio): void {
        state.currentPortfolio = portfolio;
    }
};

/** Действия хранилища */
const Actions = {
    /** Дейстие проставляющие информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](context: ActionContext<StateHolder, void>, request: LoginRequest): Promise<ClientInfo> {
        return new Promise<ClientInfo>((resolve) => {
            clientService.getClientInfo(request).then((clientInfo: ClientInfo) => {
                context.commit(MutationType.SET_CLIENT_INFO, clientInfo);
                console.log('ACTION SET USER', clientInfo, context);
                resolve(clientInfo);
            });
        });
    },
    [MutationType.SET_CURRENT_PORTFOLIO](context: ActionContext<StateHolder, void>, id: string): Promise<Portfolio> {
        return new Promise<Portfolio>((resolve) => {
            portfolioService.getById(id).then((portfolio: Portfolio) => {
                console.log('ACTION SET PORTFOLIO', portfolio, context);
                context.commit(MutationType.SET_CURRENT_PORTFOLIO, portfolio);
                resolve(portfolio);
            });
        });
    }
};

/**
 * Главный модуль хранилища
 */
export class MainStore implements Module<StateHolder, void> {
    namespaced = true;
    state: StateHolder;
    mutations = Mutations;
    getters = Getters;
    actions = Actions;

    constructor() {
        this.state = new StateHolder();
    }
}
