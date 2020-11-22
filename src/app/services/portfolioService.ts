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

import {Inject, Singleton} from "typescript-ioc";
import {EditShareNoteDialogData} from "../components/dialogs/editShareNoteDialog";
import {Service} from "../platform/decorators/service";
import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {Http} from "../platform/services/http";
import {BigMoney} from "../types/bigMoney";
import {PortfolioTag, ShareTagsData} from "../types/tags";
import {PortfolioBackup} from "../types/types";
import {TagsService} from "./tagsService";

@Service("PortfolioService")
@Singleton
export class PortfolioService {

    @Inject
    private http: Http;

    private readonly ENDPOINT_BASE = "portfolio-info";

    /**
     * Возвращает данные по бэкапу портфеля
     * @param userId идентификатор пользователя
     */
    async getPortfolioBackup(userId: string): Promise<PortfolioBackup> {
        return this.http.get<PortfolioBackup>(`/portfolios/${userId}/backup`);
    }

    async clearPortfolio(portfolioId: number): Promise<void> {
        await this.http.post(`/portfolio-info/clear/${portfolioId}`);
    }

    /**
     * Отправляет запрос на создание/обновление данных бэкапа портфеля
     * @param userId идентификатор пользователя
     * @param portfolioBackup идентификатор портфеля
     */
    async saveOrUpdatePortfolioBackup(userId: string, portfolioBackup: PortfolioBackup): Promise<void> {
        await this.http.post(`/portfolios/${userId}/backup`, portfolioBackup);
    }

    /**
     * Отправляет запрос на смену валюты портфеля
     * @param portfolioId идентификатор портфеля
     * @param currencyCode код валюты
     */
    async changeCurrency(portfolioId: number, currencyCode: string): Promise<void> {
        await this.http.post(`/portfolio-info/change-currency/${portfolioId}/${currencyCode}`);
    }

    /**
     * Проставляет флаг combined в портфеле
     * @param {string} id
     * @param {boolean} combined
     * @return {Promise<void>}
     */
    async setCombinedFlag(id: number, combined: boolean): Promise<void> {
        await this.http.post(`/portfolio-info/${id}/combined/${combined}`, {});
    }

    /**
     * Возвращает url для публичного доступа к портфелю
     * @param request запрос
     */
    async getPortfolioShareUrl(request: GenerateShareUrlRequest): Promise<string> {
        return this.http.post<string>(`/${this.ENDPOINT_BASE}/public-url`, request);
    }

    /**
     * Возвращает список портфелей пользователя
     */
    async getPortfolios(): Promise<PortfolioParams[]> {
        const portfolios: PortfolioParamsResponse[] = await this.http.get<PortfolioParamsResponse[]>(`/${this.ENDPOINT_BASE}`);
        return portfolios.map(item => {
            return {
                ...item,
                accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
                iisType: item.iisType ? IisType.valueByName(item.iisType) : null,
                shareNotes: item.shareNotes ? item.shareNotes : {}
            } as PortfolioParams;
        });
    }

    /**
     * Возвращает портфель пользователя по id
     * @param id идентификатор портфеля
     */
    async getPortfolioById(id: number): Promise<PortfolioParams> {
        const portfolio: PortfolioParamsResponse = await this.http.get<PortfolioParamsResponse>(`/${this.ENDPOINT_BASE}/${id}`);
        return {
            ...portfolio,
            accountType: portfolio.accountType ? PortfolioAccountType.valueByName(portfolio.accountType) : null,
            iisType: portfolio.iisType ? IisType.valueByName(portfolio.iisType) : null,
            shareNotes: portfolio.shareNotes ? portfolio.shareNotes : {}
        } as PortfolioParams;
    }

    /**
     * Отправляет запрос на создание нового портфеля и возвращает созданную сущность
     * @param portfolio портфель
     */
    async createPortfolio(portfolio: PortfolioParams): Promise<PortfolioParams> {
        const request: CreatePortfolioRequest = {
            name: portfolio.name,
            access: portfolio.access,
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
        const item = await this.http.post<PortfolioParamsResponse>(`/${this.ENDPOINT_BASE}`, request);
        return {
            ...item,
            accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
            iisType: item.iisType ? IisType.valueByName(item.iisType) : null
        } as PortfolioParams;
    }

    /**
     * Обновляет портфель
     * @param portfolio портфель
     */
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
            analyticsAccess: portfolio.analyticsAccess,
            dashboardAccess: portfolio.dashboardAccess,
            professionalMode: portfolio.professionalMode,
            brokerId: portfolio.brokerId,
            viewCurrency: portfolio.viewCurrency,
            alternativeViewCurrency: portfolio.alternativeViewCurrency,
            fixFee: portfolio.fixFee,
            note: portfolio.note,
            combined: portfolio.combined,
            description: portfolio.description
        };

        const item = await this.http.put<PortfolioParamsResponse>(`/${this.ENDPOINT_BASE}`, request);
        return {
            ...item,
            accountType: item.accountType ? PortfolioAccountType.valueByName(item.accountType) : null,
            iisType: item.iisType ? IisType.valueByName(item.iisType) : null
        } as PortfolioParams;
    }

    /**
     * Удаляет портфель
     * @param portfolioId идентификатор портфеля
     */
    async deletePortfolio(portfolioId: number): Promise<void> {
        await this.http.delete(`/${this.ENDPOINT_BASE}/${portfolioId}`);
    }

    /**
     * Обновляет заметки по бумагам в портфеле
     */
    async updateShareNotes(portfolioId: number, shareNotes: { [key: string]: string }, data: EditShareNoteDialogData): Promise<{ [key: string]: string }> {
        const shareNotesRequest = shareNotes || {};
        shareNotes[data.ticker] = data.note;
        shareNotesRequest[data.ticker] = data.note;
        await (await this.http.put(`/${this.ENDPOINT_BASE}/${portfolioId}/shareNotes`, shareNotesRequest));
        return shareNotesRequest;
    }

    /**
     * Отправляет запрос на создание копии портфеля
     * @param portfolioId идентификатор портфеля
     */
    async createPortfolioCopy(portfolioId: number): Promise<PortfolioParams> {
        const response: PortfolioParamsResponse = await this.http.get<PortfolioParamsResponse>(`/${this.ENDPOINT_BASE}/copy/${portfolioId}`);
        return {
            ...response,
            accountType: response.accountType ? PortfolioAccountType.valueByName(response.accountType) : null,
            iisType: response.iisType ? IisType.valueByName(response.iisType) : null
        } as PortfolioParams;
    }

    /**
     * Отправляет запрос на получение текущий остатков денежных средств в портфеле в разрезе по валютам
     * @param portfolioId идентификатор портфеля
     */
    async getMoneyResiduals(portfolioId: number): Promise<MoneyResiduals> {
        return this.http.get<MoneyResiduals>(`/${this.ENDPOINT_BASE}/money-residuals/${portfolioId}`);
    }

    /**
     * Отправляет запрос на получение суммы пополнений портфеля в рублях в текущем году
     * @param portfolioId идентификатор портфеля
     */
    async totalDepositInCurrentYear(portfolioId: number): Promise<BigMoney> {
        const total = await this.http.get<string>(`/${this.ENDPOINT_BASE}/total-deposit-current-year/${portfolioId}`);
        return total ? new BigMoney(total) : null;
    }

    /**
     * Отправляет запрос для сохранения голоса за портфель
     * @param portfolioId идентификатор портфеля
     * @param vote голос -1/1
     */
    async votePortfolio(portfolioId: number, vote: number): Promise<void> {
        await this.http.post(`/portfolio-info/vote/${portfolioId}/${vote}`);
    }

    /**
     * Обновляет тэги по бумагам в портфеле
     */
    async updateTags(portfolioId: number, tags: { [key: string]: PortfolioTag[] }, shareTags: ShareTagsData): Promise<void> {
        const tagsRequest: { [key: string]: PortfolioTag[] } = {};
        tags[`${shareTags.shareType}:${shareTags.shareId}`] = shareTags.data;
        Object.keys(tags).forEach(key => {
            tagsRequest[key] = tags[key];
        });
        await this.http.put<PortfolioParamsResponse>(`/${this.ENDPOINT_BASE}/${portfolioId}/tags`, tagsRequest);
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

/** Тип доступа к портфелю */
@Enum("code")
export class PortfoliosDialogType extends (EnumType as IStaticEnum<PortfoliosDialogType>) {

    static readonly DEFAULT_ACCESS = new PortfoliosDialogType("DEFAULT_ACCESS", "Обычная");
    static readonly BY_LINK = new PortfoliosDialogType("BY_LINK", "Со сроком действия");

    private constructor(public code: string, public description: string) {
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
    id?: number;
    /** Название портфеля */
    name: string;
    /** Доступ портфеля.  0 - приватный, 1 - публичный только по ссылке, 2 - полностью публичный" */
    access: number;
    /** Доступ к разделу Дивиденды в публичном портфеле */
    dividendsAccess?: boolean;
    /** Доступ к разделу Сделки в публичном портфеле */
    tradesAccess?: boolean;
    /** Доступ к графику стоимости в публичном портфеле */
    analyticsAccess?: boolean;
    /** Доступ к дашборду в публичном портфеле */
    dashboardAccess?: boolean;
    /** Профессиональный режим */
    professionalMode?: boolean;
    /** Идентификатор брокера */
    brokerId?: number;
    /** Название брокера */
    brokerName?: string;
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
    /** Заметки по бумагам в портфеле */
    shareNotes?: { [key: string]: string };
    /** Тэги по бумагам в портфеле */
    tags?: { [key: string]: PortfolioTag[] };
    /** Цель портфеля */
    description?: string;
    /** Общее количество ценнных бумаг в составе портфеля */
    sharesCount?: number;
}

/** Запрос на создание портфеля */
export interface CreatePortfolioRequest {
    /** Название портфеля */
    name: string;
    /** Доступ портфеля.  0 - приватный, 1 - публичный только по ссылке, 2 - полностью публичный" */
    access: number;
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
export interface UpdatePortfolioRequest {
    /** Идентификатор портфеля */
    id: number;
    /** Название портфеля */
    name: string;
    /** Доступ портфеля.  0 - приватный, 1 - публичный только по ссылке, 2 - полностью публичный" */
    access: number;
    /** Доступ к разделу Дивиденды в публичном портфеле */
    dividendsAccess?: boolean;
    /** Доступ к разделу Сделки в публичном портфеле */
    tradesAccess?: boolean;
    /** Доступ к графику стоимости в публичном портфеле */
    analyticsAccess?: boolean;
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
    /** Тип аккаунта */
    accountType: string;
    /** Тип ИИС */
    iisType: string;
    /** Цель публичного портфеля */
    description: string;
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
    /** Идентификаторы составных портфелей */
    combinedIds?: number[];
    /** Признак комбинированного портфеля (используется только на фронте) */
    combinedFlag?: boolean;
}

/** Запрос на получение url для доступа к портфеля */
export interface GenerateShareUrlRequest {
    /** Идентификатор портфеля */
    id: number;
    /** Срок действия доступа */
    expiredDate: string;
    /** Тип открытия доступа к портфелю */
    sharePortfolioType: string;
    /** Имя пользователя в системе */
    userName: string;
}

export interface MoneyResiduals {
    EUR: string;
    USD: string;
    RUB: string;
    GBP: string;
}
