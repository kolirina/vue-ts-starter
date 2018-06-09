import {Module, ActionContext} from 'vuex';
import {MutationType} from "./mutationType";
import {ClientService} from "../services/ClientService";
import {Container} from "typescript-ioc";
import {ClientInfo, Portfolio} from "../types/types";
import {PortfolioService} from "../services/PortfolioService";
import {GetterType} from "./getterType";

/** Сервис работы с клиентом */
const clientService: ClientService = Container.get(ClientService);
/** Сервис работы с клиентом */
const portfolioService: PortfolioService = Container.get(PortfolioService);

/** Состояния хранилища */
export class StateHolder {
    /** Информация о клиенте */
    clientInfo = clientService.getClientInfo();
    /** Текущий выбранный портфель */
    currentPortfolio: Portfolio = portfolioService.getById(this.clientInfo.client.currentPortfolioId);
}

const Getters = {
    [GetterType.PORTFOLIO](state: StateHolder): Portfolio {
        return state.currentPortfolio;
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
    }
};

/** Действия хранилища */
const Actions = {
    /** Дейстие проставляющие информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](context: ActionContext<StateHolder, void>): void {
        const clientInfo = clientService.getClientInfo();
        context.commit(MutationType.SET_CLIENT_INFO, clientInfo);
    },
    [MutationType.SET_CURRENT_PORTFOLIO](context: ActionContext<StateHolder, void>, portfolio: Portfolio): void {
        context.commit(MutationType.SET_CURRENT_PORTFOLIO, portfolio);
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