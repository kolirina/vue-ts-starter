import {Container} from "typescript-ioc";
import {ActionContext, Module} from "vuex";
import {Storage} from "../platform/services/storage";
import {ClientInfo} from "../services/clientService";
import {OverviewService} from "../services/overviewService";
import {PortfolioParams, PortfolioService} from "../services/portfolioService";
import {StoreKeys} from "../types/storeKeys";
import {Portfolio} from "../types/types";
import {GetterType} from "./getterType";
import {MutationType} from "./mutationType";

/** Сервис работы с клиентом */
const overviewService: OverviewService = Container.get(OverviewService);
/** Сервис работы с портфелями клиента */
const portfolioService: PortfolioService = Container.get(PortfolioService);
/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

/** Состояния хранилища */
export class StateHolder {
    /** Информация о клиенте */
    clientInfo: ClientInfo = null;
    /** Текущий выбранный портфель */
    currentPortfolio: Portfolio = null;
    /** Версия стора */
    version = "1.0";
    /** Признак открытого меню */
    sideBarOpened: boolean = true;
}

const Getters = {
    [GetterType.PORTFOLIO](state: StateHolder): Portfolio {
        return state.currentPortfolio;
    },
    [GetterType.CLIENT_INFO](state: StateHolder): ClientInfo {
        return state.clientInfo;
    },
    [GetterType.SIDEBAR_OPENED](state: StateHolder): boolean {
        return state.sideBarOpened;
    }
};

/** Мутаторы хранилища */
const Mutations = {
    /** Мутатор проставлящий информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](state: StateHolder, clientInfo: ClientInfo): void {
        state.clientInfo = clientInfo;
    },
    [MutationType.SET_CURRENT_PORTFOLIO](state: StateHolder, portfolio: Portfolio): void {
        state.currentPortfolio = portfolio;
        state.clientInfo.user.currentPortfolioId = portfolio.id;
    },
    [MutationType.SET_DEFAULT_PORTFOLIO](state: StateHolder, id: string): void {
        state.clientInfo.user.currentPortfolioId = id;
    },
    [MutationType.RELOAD_PORTFOLIO](state: StateHolder, portfolio: Portfolio): void {
        state.currentPortfolio = portfolio;
        const withoutCurrent = state.clientInfo.user.portfolios.filter(p => p.id !== portfolio.id);
        state.clientInfo.user.portfolios = [...withoutCurrent, portfolio.portfolioParams];
    },
    [MutationType.RELOAD_PORTFOLIOS](state: StateHolder, portfolios: PortfolioParams[]): void {
        state.clientInfo.user.portfolios = [...portfolios];
    },
    [MutationType.UPDATE_PORTFOLIO](state: StateHolder, portfolio: PortfolioParams): void {
        const withoutCurrent = state.clientInfo.user.portfolios.filter(p => p.id !== portfolio.id);
        state.clientInfo.user.portfolios = [...withoutCurrent, portfolio];
        state.currentPortfolio.portfolioParams = portfolio;
    },
    [MutationType.CHANGE_SIDEBAR_STATE](state: StateHolder, sideBarState: boolean): void {
        state.sideBarOpened = sideBarState;
    },
};

/** Действия хранилища */
const Actions = {
    /** Дейстие проставляющие информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](context: ActionContext<StateHolder, void>, clientInfo: ClientInfo): void {
        localStorage.set(StoreKeys.TOKEN_KEY, clientInfo.token);
        context.commit(MutationType.SET_CLIENT_INFO, clientInfo);
    },
    [MutationType.SET_CURRENT_PORTFOLIO](context: ActionContext<StateHolder, void>, id: string): Promise<Portfolio> {
        return new Promise<Portfolio>((resolve): void => {
            overviewService.getById(id).then((portfolio: Portfolio) => {
                context.commit(MutationType.SET_CURRENT_PORTFOLIO, portfolio);
                resolve(portfolio);
            });
        });
    },
    [MutationType.SET_DEFAULT_PORTFOLIO](context: ActionContext<StateHolder, void>, id: string): Promise<void> {
        return new Promise<void>((resolve): void => {
            overviewService.setDefaultPortfolio(id).then(() => {
                context.commit(MutationType.SET_DEFAULT_PORTFOLIO, id);
                resolve();
            });
        });
    },
    [MutationType.RELOAD_PORTFOLIO](context: ActionContext<StateHolder, void>, id: string): Promise<void> {
        return new Promise<void>((resolve): void => {
            overviewService.reloadPortfolio(id).then((portfolio: Portfolio): void => {
                context.commit(MutationType.RELOAD_PORTFOLIO, portfolio);
                resolve();
            });
        });
    },
    [MutationType.RELOAD_PORTFOLIOS](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            portfolioService.getPortfolios().then((portfolios: PortfolioParams[]): void => {
                context.commit(MutationType.RELOAD_PORTFOLIOS, portfolios);
                resolve();
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
