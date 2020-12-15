import {Container} from "typescript-ioc";
import {ActionContext, Module} from "vuex";
import {Storage} from "../platform/services/storage";
import {Client, ClientInfo, ClientService} from "../services/clientService";
import {EventService} from "../services/eventService";
import {OverviewService} from "../services/overviewService";
import {PortfolioAccountType, PortfolioParams, PortfolioService} from "../services/portfolioService";
import {SystemPropertiesService} from "../services/systemPropertiesService";
import {CurrencyUnit} from "../types/currency";
import {StoreKeys} from "../types/storeKeys";
import {PortfolioTag} from "../types/tags";
import {Tariff} from "../types/tariff";
import {CombinedInfoRequest, CombinedPortfolioParams, MapType, Overview, Portfolio, TariffHint} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {ActionType} from "./actionType";
import {GetterType} from "./getterType";
import {MutationType} from "./mutationType";

/** Сервис работы с портфелем */
const overviewService: OverviewService = Container.get(OverviewService);
/** Сервис работы с клиентом */
const clientService: ClientService = Container.get(ClientService);
/** Сервис работы с портфелями клиента */
const portfolioService: PortfolioService = Container.get(PortfolioService);
/** Сервис работы с событиями по бумагам */
const eventService: EventService = Container.get(EventService);
/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Сервис работы с настройками intelinvest */
const systemPropertiesService: SystemPropertiesService = Container.get(SystemPropertiesService);

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
    /** Составной портфель */
    combinedPortfolioParams: PortfolioParams = {
        id: null,
        name: "Составной портфель",
        accountType: PortfolioAccountType.BROKERAGE,
        openDate: DateUtils.currentDate(),
        viewCurrency: CurrencyUnit.RUB.code,
        access: 0,
        combinedFlag: true,
        combinedIds: [],
        tags: {},
    };
    /** Координаты подсказки об истечении тарифа */
    tariffExpiredHintCoords: TariffHint = {
        x: "0px",
        y: "0px",
        display: "none"
    };
    systemProperties: MapType = {};
}

const Getters = {
    [GetterType.PORTFOLIO](state: StateHolder): Portfolio {
        return state.currentPortfolio;
    },
    [GetterType.COMBINED_PORTFOLIO_PARAMS](state: StateHolder): PortfolioParams {
        return state.combinedPortfolioParams;
    },
    [GetterType.CLIENT_INFO](state: StateHolder): ClientInfo {
        return state.clientInfo;
    },
    [GetterType.SIDEBAR_OPENED](state: StateHolder): boolean {
        return state.sideBarOpened;
    },
    [GetterType.HINT_COORDS](state: StateHolder): TariffHint {
        return state.tariffExpiredHintCoords;
    },
    [GetterType.EXPIRED_TARIFF](state: StateHolder): boolean {
        return TariffUtils.isTariffExpired(state.clientInfo.user);
    },
    [GetterType.NEED_BLOCK_INTERFACE](state: StateHolder): boolean {
        return TariffUtils.isTariffExpired(state.clientInfo.user) || TariffUtils.limitsExceeded(state.clientInfo.user);
    },
    [GetterType.SYSTEM_PROPERTIES](state: StateHolder): MapType {
        return state.systemProperties;
    }
};

/** Мутаторы хранилища */
const Mutations = {
    /** Мутатор проставлящий информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](state: StateHolder, clientInfo: ClientInfo): void {
        state.clientInfo = clientInfo;
    },
    [MutationType.SET_CLIENT](state: StateHolder, client: Client): void {
        state.clientInfo.user = client;
    },
    [MutationType.SET_SYSTEM_PROPERTIES](state: StateHolder, systemProperties: MapType): void {
        state.systemProperties = systemProperties;
    },
    [MutationType.SET_CURRENT_PORTFOLIO](state: StateHolder, portfolio: Portfolio): void {
        state.currentPortfolio = portfolio;
        if (portfolio.id) {
            state.clientInfo.user.currentPortfolioId = portfolio.id;
        }
    },
    [MutationType.UPDATE_COMBINED_PORTFOLIO](state: StateHolder, viewCurrency: string): void {
        state.combinedPortfolioParams.combinedIds = state.clientInfo.user.portfolios.filter(value => value.combined).map(value => value.id);
        state.combinedPortfolioParams.viewCurrency = viewCurrency;
        const tags: { [key: string]: PortfolioTag[] } = {};
        // заполняем тэги на основе составляющих портфелей, перезатирая уже существующие
        state.clientInfo.user.portfolios.filter(value => value.combined).forEach(portfolio => {
            Object.keys(portfolio.tags).forEach(shareKey => tags[shareKey] = portfolio.tags[shareKey]);
        });
        state.combinedPortfolioParams.tags = tags;
        const portfolioParams = localStorage.get<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {});
        localStorage.set<CombinedPortfolioParams>(StoreKeys.COMBINED_PORTFOLIO_PARAMS_KEY, {
            ids: state.combinedPortfolioParams.combinedIds,
            viewCurrency: state.combinedPortfolioParams.viewCurrency,
            selected: portfolioParams.selected
        } as CombinedPortfolioParams);
    },
    [MutationType.SET_DEFAULT_PORTFOLIO](state: StateHolder, id: number): void {
        state.clientInfo.user.currentPortfolioId = id;
    },
    [MutationType.RELOAD_CURRENT_PORTFOLIO](state: StateHolder, portfolio: Portfolio): void {
        state.currentPortfolio = portfolio;
        const hasCombinedPortfolio = state.clientInfo.user.portfolios.filter(value => value.combined).length > 0 ||
            state.clientInfo.user.portfolios.length > 1 && state.clientInfo.user.tariff !== Tariff.FREE;
        const withoutCurrent = state.clientInfo.user.portfolios.filter(p => p.id !== portfolio.id);
        state.clientInfo.user.portfolios = [...withoutCurrent, portfolio.portfolioParams];
        state.clientInfo.user.portfolios = state.clientInfo.user.portfolios.filter(p => !!p.id);
        if (hasCombinedPortfolio) {
            state.clientInfo.user.portfolios.push(state.combinedPortfolioParams);
        }
    },
    [MutationType.RELOAD_PORTFOLIOS](state: StateHolder, portfolios: PortfolioParams[]): void {
        state.clientInfo.user.portfolios = [...portfolios];
        const hasCombinedPortfolio = state.clientInfo.user.portfolios.filter(value => value.combined).length > 0 ||
            state.clientInfo.user.portfolios.length > 1 && state.clientInfo.user.tariff !== Tariff.FREE;
        state.clientInfo.user.portfolios = state.clientInfo.user.portfolios.filter(p => !!p.id);
        if (hasCombinedPortfolio) {
            state.clientInfo.user.portfolios.push(state.combinedPortfolioParams);
        }
    },
    [MutationType.UPDATE_PORTFOLIO](state: StateHolder, portfolio: PortfolioParams): void {
        const hasCombinedPortfolio = state.clientInfo.user.portfolios.filter(value => value.combined).length > 0 ||
            state.clientInfo.user.portfolios.length > 1 && state.clientInfo.user.tariff !== Tariff.FREE;
        const withoutCurrent = state.clientInfo.user.portfolios.filter(p => p.id !== portfolio.id);
        state.clientInfo.user.portfolios = [...withoutCurrent, portfolio];
        state.currentPortfolio.portfolioParams = portfolio;
        state.clientInfo.user.portfolios = state.clientInfo.user.portfolios.filter(p => !!p.id);
        if (hasCombinedPortfolio) {
            state.clientInfo.user.portfolios.push(state.combinedPortfolioParams);
        }
    },
    [MutationType.CHANGE_SIDEBAR_STATE](state: StateHolder, sideBarState: boolean): void {
        state.sideBarOpened = sideBarState;
    }
};

/** Действия хранилища */
const Actions = {
    /** Дейстие загрузки системных свойств */
    [ActionType.LOAD_SYSTEM_PROPERTIES](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            systemPropertiesService.getSystemProperties().then((systemProperties: MapType) => {
                context.commit(MutationType.SET_SYSTEM_PROPERTIES, systemProperties);
                resolve();
            });
        });
    },
    /** Действие проставляющие информацию о клиенте */
    [MutationType.SET_CLIENT_INFO](context: ActionContext<StateHolder, void>, clientInfo: ClientInfo): void {
        localStorage.set(StoreKeys.TOKEN_KEY, clientInfo.token);
        localStorage.set(StoreKeys.REFRESH_TOKEN, clientInfo.refreshToken);
        context.commit(MutationType.SET_CLIENT_INFO, clientInfo);
    },
    [MutationType.SET_CURRENT_PORTFOLIO](context: ActionContext<StateHolder, void>, id: number): Promise<Portfolio> {
        return new Promise<Portfolio>((resolve): void => {
            overviewService.getById(id).then((portfolio: Portfolio) => {
                context.commit(MutationType.SET_CURRENT_PORTFOLIO, portfolio);
                resolve(portfolio);
            });
        });
    },
    [MutationType.SET_CURRENT_COMBINED_PORTFOLIO](context: ActionContext<StateHolder, void>, combinedParams: CombinedPortfolioParams): Promise<Portfolio> {
        return new Promise<Portfolio>((resolve): void => {
            const request: CombinedInfoRequest = {ids: combinedParams.ids, viewCurrency: combinedParams.viewCurrency};
            overviewService.getPortfolioOverviewCombined(request).then((overview: Overview) => {
                context.commit(MutationType.UPDATE_COMBINED_PORTFOLIO, combinedParams.viewCurrency);
                const portfolio: Portfolio = {
                    id: null,
                    portfolioParams: context.state.combinedPortfolioParams,
                    overview: overview
                };
                context.commit(MutationType.SET_CURRENT_PORTFOLIO, portfolio);
                resolve(portfolio);
            });
        });
    },
    [MutationType.SET_DEFAULT_PORTFOLIO](context: ActionContext<StateHolder, void>, id: number): Promise<void> {
        return new Promise<void>((resolve): void => {
            overviewService.setDefaultPortfolio(id).then(() => {
                context.commit(MutationType.SET_DEFAULT_PORTFOLIO, id);
                resolve();
            });
        });
    },
    [MutationType.RELOAD_CLIENT_INFO](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            clientService.getClientInfo().then((client: Client) => {
                context.commit(MutationType.SET_CLIENT, client);
                context.commit(MutationType.RELOAD_PORTFOLIOS, client.portfolios);
                resolve();
            });
        });
    },
    [MutationType.RELOAD_CURRENT_PORTFOLIO](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            if (context.state.currentPortfolio.id) {
                overviewService.reloadPortfolio(context.state.currentPortfolio.id).then((portfolio: Portfolio): void => {
                    context.commit(MutationType.RELOAD_CURRENT_PORTFOLIO, portfolio);
                    resolve();
                });
            } else {
                const request: CombinedInfoRequest = {
                    ids: context.state.currentPortfolio.portfolioParams.combinedIds,
                    viewCurrency: context.state.currentPortfolio.portfolioParams.viewCurrency
                };
                overviewService.getPortfolioOverviewCombined(request).then((overview: Overview) => {
                    context.commit(MutationType.UPDATE_COMBINED_PORTFOLIO, context.state.currentPortfolio.portfolioParams.viewCurrency);
                    const portfolio: Portfolio = {
                        id: null,
                        portfolioParams: context.state.combinedPortfolioParams,
                        overview: overview
                    };
                    context.commit(MutationType.RELOAD_CURRENT_PORTFOLIO, portfolio);
                    resolve();
                });
            }
        });
    },
    [MutationType.RELOAD_PORTFOLIOS](context: ActionContext<StateHolder, void>): Promise<void> {
        return new Promise<void>((resolve): void => {
            portfolioService.getPortfolios().then((portfolios: PortfolioParams[]): void => {
                context.commit(MutationType.RELOAD_PORTFOLIOS, portfolios);
                resolve();
            });
        });
    },
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
