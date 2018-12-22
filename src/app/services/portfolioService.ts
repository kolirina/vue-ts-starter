/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2018
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2018
 */

import {Container, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Cache} from "../platform/services/cache";
import {HTTP} from "../platform/services/http";
import {Portfolio, PortfolioBackup} from "../types/types";

@Service("PortfolioService")
@Singleton
export class PortfolioService {

    private readonly ENDPOINT_BASE = "portfolio-info";

    private cacheService = (Container.get(Cache) as Cache);

    private cache: { [key: string]: string } = {};

    async getPortfolioBackup(userId: string): Promise<PortfolioBackup> {
        return (await HTTP.INSTANCE.get(`/portfolios/${userId}/backup`)).data as PortfolioBackup;
    }

    async saveOrUpdatePortfolioBackup(userId: string, portfolioBackup: PortfolioBackup): Promise<void> {
        await HTTP.INSTANCE.post(`/portfolios/${userId}/backup`, portfolioBackup);
    }

    async getPortfolioShareUrl(request: GenerateShareUrlRequest): Promise<string> {
        return (await HTTP.INSTANCE.post(`/${this.ENDPOINT_BASE}/token`, request)).data;
    }

    async getPortfolios(): Promise<PortfolioParams[]> {
        const portfolios: PortfolioParamsResponse[] = (await HTTP.INSTANCE.get(`/${this.ENDPOINT_BASE}`)).data;
        return portfolios.map(item => {
            return {
                ...item,
                accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
                iisType: item.iisType ? IisType.valueByName(item.iisType) : null
            } as PortfolioParams;
        });
    }

    async createOrUpdatePortfolio(portfolio: PortfolioParams): Promise<PortfolioParams> {
        return portfolio.id ? this.updatePortfolio(portfolio) : this.createPortfolio(portfolio);
    }

    async createPortfolio(portfolio: PortfolioParams): Promise<PortfolioParams> {
        const request: CreatePortfolioRequest = {
            name: portfolio.name,
            access: portfolio.access ? 1 : 0,
            openDate: portfolio.openDate,
            accountType: portfolio.accountType.value,
            iisType: portfolio.iisType ? portfolio.iisType.value : null,
            professionalMode: portfolio.professionalMode,
            brokerId: portfolio.brokerId,
            viewCurrency: portfolio.viewCurrency,
            alternativeViewCurrency: portfolio.alternativeViewCurrency,
            fixFee: portfolio.fixFee,
            note: portfolio.note
        };
        const item = (await HTTP.INSTANCE.post(`/${this.ENDPOINT_BASE}`, request)).data;
        return {
            ...item,
            accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
            iisType: item.iisType ? IisType.valueByName(item.iisType) : null
        } as PortfolioParams;
    }

    async updatePortfolio(portfolio: PortfolioParams): Promise<PortfolioParams> {
        const request: UpdatePortfolioRequest = {
            id: portfolio.id,
            name: portfolio.name,
            access: portfolio.access,
            openDate: portfolio.openDate,
            accountType: portfolio.accountType.value,
            iisType: portfolio.iisType ? portfolio.iisType.value : null,
            dividendsAccess: portfolio.dividendsAccess,
            tradesAccess: portfolio.tradesAccess,
            lineDataAccess: portfolio.lineDataAccess,
            dashboardAccess: portfolio.dashboardAccess,
            professionalMode: portfolio.professionalMode,
            brokerId: portfolio.brokerId,
            viewCurrency: portfolio.viewCurrency,
            alternativeViewCurrency: portfolio.alternativeViewCurrency,
            fixFee: portfolio.fixFee,
            note: portfolio.note,
            combined: portfolio.combined
        };

        const item = await (await HTTP.INSTANCE.put(`/${this.ENDPOINT_BASE}`, request)).data;
        return {
            ...item,
            accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
            iisType: item.iisType ? IisType.valueByName(item.iisType) : null
        } as PortfolioParams;
    }

    async deletePortfolio(portfolioId: string): Promise<void> {
        await (await HTTP.INSTANCE.delete(`/${this.ENDPOINT_BASE}/${portfolioId}`));
    }

    async createPortfolioCopy(portfolioId: string): Promise<PortfolioParams> {
        const response: PortfolioParamsResponse = (await HTTP.INSTANCE.get(`/${this.ENDPOINT_BASE}/copy/${portfolioId}`)).data;
        return {
            ...response,
            accountType: response.accountType ? PortfolioAccountType.valueByName(response.accountType) : null,
            iisType: response.iisType ? IisType.valueByName(response.iisType) : null
        } as PortfolioParams;
    }
}

/** Тип счета портфеля. Брокерский или ИИС */
@Enum("value")
export class PortfolioAccountType extends (EnumType as IStaticEnum<PortfolioAccountType>) {

    static readonly BROKERAGE = new PortfolioAccountType("BROKERAGE", "Брокерский");
    static readonly IIS = new PortfolioAccountType("IIS", "ИИС");

    private constructor(public value: string, public description: string) {
        super();
    }
}

/** Тип ИИС */
@Enum("value")
export class IisType extends (EnumType as IStaticEnum<IisType>) {

    static readonly TYPE_A = new IisType("TYPE_A", "С вычетом на взносы");
    static readonly TYPE_B = new IisType("TYPE_B", "С вычетом на доходы");

    private constructor(public value: string, public description: string) {
        super();
    }
}

/** Параметры портфеля пользователя */
export interface BasePortfolioParams {
    /** Идентификатор портфеля */
    id?: string;
    /** Название портфеля */
    name: string;
    /** Публичный доступ к портфелю */
    access: boolean;
    /** Доступ к разделу Дивиденды в публичном портфеле */
    dividendsAccess?: boolean;
    /** Доступ к разделу Сделки в публичном портфеле */
    tradesAccess?: boolean;
    /** Доступ к графику стоимости в публичном портфеле */
    lineDataAccess?: boolean;
    /** Доступ к дашборду в публичном портфеле */
    dashboardAccess?: boolean;
    /** Профессиональный режим */
    professionalMode?: boolean;
    /** Идентификатор брокера */
    brokerId?: number;
    /** Основная валюта портфеля */
    viewCurrency: string;
    /** Альтернативная валюта портфеля */
    alternativeViewCurrency?: string;
    /** Фиксированная комиссия портфеля в % */
    fixFee?: string;
    /** Заметка к портфелю */
    note?: string;
    /** Дата открытия счета */
    openDate: string;
    /** Флаг указывающий на участие портфеля в комбинированном расчете */
    combined?: boolean;
}

/** Запрос на создание портфеля */
export interface CreatePortfolioRequest {
    /** Название портфеля */
    name: string;
    /** Публичный доступ к портфелю */
    access: 0 | 1;
    /** Дата открытия */
    openDate: string;
    /** Идентификатор брокера */
    brokerId?: number;
    /** Профессиональный режим */
    professionalMode?: boolean;
    /** Основная валюта портфеля */
    viewCurrency: string;
    /** Альтернативная валюта портфеля */
    alternativeViewCurrency?: string;
    /** Фиксированная комиссия портфеля в % */
    fixFee?: string;
    /** Заметка к портфелю */
    note?: string;
    /** Тип аккаунта */
    accountType: string;
    /** Тип ИИС */
    iisType?: string;
}

/** Запрос на обновление портфеля */
export interface UpdatePortfolioRequest extends BasePortfolioParams {
    /** Тип аккаунта */
    accountType: string;
    /** Тип ИИС */
    iisType: string;
}

/** Параметры портфеля пользователя */
export interface PortfolioParamsResponse extends BasePortfolioParams {
    /** Тип аккаунта */
    accountType: string;
    /** Тип ИИС */
    iisType: string;
}

/** Параметры портфеля пользователя */
export interface PortfolioParams extends BasePortfolioParams {
    /** Тип аккаунта */
    accountType: PortfolioAccountType;
    /** Тип ИИС */
    iisType?: IisType;
}

/** Запрос на получение url для доступа к портфеля */
export interface GenerateShareUrlRequest {
    /** Идентификатор портфеля */
    id: string;
    /** Срок действия доступа */
    expiredDate: string;
    /** Тип открытия доступа к портфелю */
    sharePortfolioType: string;
    /** Имя пользователя в системе */
    userName: string;
}