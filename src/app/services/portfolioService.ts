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
import {Portfolio, PortfolioBackup} from "../types/types";
import {MoneyResiduals} from "./portfolioService";

@Service("PortfolioService")
@Singleton
export class PortfolioService {

    // tslint:disable
    readonly GLOBALRISK: any = {
        [AdviceCode.ONLY_ONE_CURRENCY]: [
            {
                problem: "В вашем портфеле всего лишь одна валюта",
                description: "Основным назначением валютной диверсификации является защита инвесторов от возможных курсовых колебаний денежных средств, а также падения курсов одной валюты по отношению к другой. Имеется в виду обесценивание не только национальной, но и важнейшей мировой валюты: евро или доллара. Так, к примеру, инвестиции только в евро при нестабильности и временном падении его курса могут принести инвестору довольно большие убытки, даже при общей прибыльности его проекта в целом. Отсюда следует, что суть валютной диверсификации подразумевает осуществление инвестирования частями с использованием разных валют: часть в евро, часть в швейцарских франках, часть в долларах или золоте и т.д.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем увеличить количество валют в портфеле, минимум до трех."
                ]
            }
        ],
        [AdviceCode.NO_GOLD_ETF]: [
            {
                problem: "В вашем портфеле нет золотых ET",
                description: "Одной из составляющих частей диверсификации по активам, является золото. В текущих условиях мировой экономики золото всегда было и остается основным способом сбережения капитала для инвестора. При финансовых кризисах и девальвации валют золото не падает в цене, а на долгосрочном горизонте показывает стабильно хорошую доходность.",
                decisionTitle: "Рекомендуем рассмотреть следующие варианты инвестирования:",
                decisions: [
                    "Открытие обезличенных золотых (металлических) счетов;",
                    "Золотые ETF",
                    "Торговля золотом через брокера;"
                ]
            }
        ],
        [AdviceCode.NO_BONDS]: [
            {
                problem: "В вашем портфеле нет облигаций",
                description: "Одной из составляющих частей диверсификации по активам, являются облигации. Облигации – это долговой инструмент инвестирования с определенным сроком существования. Облигации выпускаются для того чтобы привлечь денежные средства в какой-нибудь проект, компанию, муниципалитет и т.д. Покупая облигацию, инвестор знает, когда облигация погашается, когда происходят выплаты по ней, на какой доход он может рассчитывать. Все проценты по облигациям выплачиваются на брокерский счет. Как правило, это происходит периодично, раз в полгода или раз в 3 месяца. В отличие от вклада, облигацию нельзя досрочно погасить, однако можно обналичить прибыль по ней.",
                decisionTitle: null,
                decisions: [
                    "Рассмотрите возможность приобретения облигаций."
                ]
            }
        ],
        [AdviceCode.NO_NOTIFICATIONS]: [
            {
                problem: "В вашем аккаунте не настроены уведомления по ценам",
                description: "Уведомления о просадке цен на бумаги позволят вам вовремя продать бумагу для закрепления прибыли или приобрести новые акции с целью усреднения цены. Уведомления о превышении ожидаемой вами максимальной цены на акцию может быть сигналом для их продажи, так как компания возможно уже исчерпала свой потенциал роста.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем установить диапазон целевых цен для всех ваших активов. Меню Настройки - Уведомления."
                ]
            }
        ],
        [AdviceCode.AVG_YIELD_BELOW_DEPOSIT]: [
            {
                problem: "Ваша среднегодовая доходность ниже ставок по депозитам",
                description: "В условиях, когда доходность портфеля ниже ставок по депозитам, вы теряете возможность заработка на более надежных и более доходных активах. Также при такой ситуации есть риск просадки доходности ниже уровня инфляции.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем пересмотреть вашу стратегию инвестирования и занести в портфель более доходные активы."
                ]
            }
        ],
        [AdviceCode.SECTOR_ABOVE_20]: [
            {
                problem: "В вашем портфеле есть сектор, занимающий более 20% всех ваших инвестиций",
                description: "Слишком высокая доля инвестиций в одной отрасли резко повышает риск потери денег при ее кризисе. Диверсификация по независящим друг от друга секторам экономики позволит вам минимизировать ваши риски.",
                decisionTitle: null,
                decisions: [
                    "Рассмотрите возможность инвестирования в другие сектора экономики."
                ]
            }
        ],
        [AdviceCode.SECTOR_ABOVE_35]: [
            {
                problem: "В вашем портфеле есть сектор, занимающий более 35% всех ваших инвестиций",
                description: "Слишком высокая доля инвестиций в одной отрасли резко повышает риск потери денег при ее кризисе. Диверсификация по независящим друг от друга секторам экономики позволит вам минимизировать ваши риски.",
                decisionTitle: null,
                decisions: [
                    "Рассмотрите возможность инвестирования в другие сектора экономики."
                ]
            }
        ],
        [AdviceCode.SECTOR_ABOVE_70]: [
            {
                problem: "В вашем портфеле есть сектор, занимающий более 70% всех ваших инвестиций",
                description: "Слишком высокая доля инвестиций в одной отрасли резко повышает риск потери денег при ее кризисе. Диверсификация по независящим друг от друга секторам экономики позволит вам минимизировать ваши риски.",
                decisionTitle: null,
                decisions: [
                    "Рассмотрите возможность инвестирования в другие сектора экономики."
                ]
            }
        ],
        [AdviceCode.SHARE_ABOVE_10]: [
            {
                problem: "В вашем портфеле есть акция, занимающая более 10% всех ваших инвестиций",
                description: "Диверсификация по компаниям позволяет снизить риск при резком просадке цены акций отдельной компании. При выборе компаний для инвестирования также учитывайте необходимость диверсификации по секторам экономики, в которых данные компании находятся.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем увеличить количество компаний в вашем портфеле и держать долю каждой компании не выше 10% при выбранном вами степени риска."
                ]
            }
        ],
        [AdviceCode.SHARE_ABOVE_20]: [
            {
                problem: "В вашем портфеле есть акция, занимающая более 20% всех ваших инвестиций",
                description: "Диверсификация по компаниям позволяет снизить риск при резком просадке цены акций отдельной компании. При выборе компаний для инвестирования также учитывайте необходимость диверсификации по секторам экономики, в которых данные компании находятся.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем увеличить количество компаний в вашем портфеле и держать долю каждой компании не выше 20% при выбранном вами степени риска."
                ]
            }
        ],
        [AdviceCode.SHARE_ABOVE_40]: [
            {
                problem: "В вашем портфеле есть акция, занимающая более 40% всех ваших инвестиций",
                description: "Диверсификация по компаниям позволяет снизить риск при резком просадке цены акций отдельной компании. При выборе компаний для инвестирования также учитывайте необходимость диверсификации по секторам экономики, в которых данные компании находятся.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем увеличить количество компаний в вашем портфеле и держать долю каждой компании не выше 40% при выбранном вами степени риска"
                ]
            }
        ],
        [AdviceCode.AVG_BOND_YIELD_BELOW_DEPOSIT]: [
            {
                problem: "Среднегодовая доходность вашего портфеля меньше ставки по депозитам",
                description: "В условиях, когда доходность облигаций ниже ставок по депозитам, вы теряете возможность заработка на более доходных, но надежных активах. Также при такой ситуации есть риск просадки доходности ниже уровня инфляции.",
                decisionTitle: null,
                decisions: [
                    "Рекомендуем пересмотреть вашу стратегию инвестирования в облигации и выбрать компании с большей доходностью"
                ]
            }
        ]
    };
    // tslint:enable

    @Inject
    private http: Http;

    private readonly ENDPOINT_BASE = "portfolio-info";

    getAdviceName(advice: any): any {
        return this.GLOBALRISK[advice];
    }

    /**
     * Возвращает данные по бэкапу портфеля
     * @param userId идентификатор пользователя
     */
    async getPortfolioBackup(userId: string): Promise<PortfolioBackup> {
        return this.http.get<PortfolioBackup>(`/portfolios/${userId}/backup`);
    }

    /**
     * Возвращает данные по советам
     * @param test идентификатор портфеля
     */
    async setRiskLevel(test: string): Promise<void> {
        this.http.post(`/user/risk-level`, test.toUpperCase(), null , null, "text/plain");
    }

    /**
     * Возвращает данные по советам
     * @param portfolioId идентификатор портфеля
     */
    async getAdvice(portfolioId: string): Promise<number[]> {
        return this.http.get<any>(`/advice/${portfolioId}`);
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
     * Отправляет запрос на создание нового портфеля или обновление
     * @param portfolio портфель
     */
    async createOrUpdatePortfolio(portfolio: PortfolioParams): Promise<PortfolioParams> {
        return portfolio.id ? this.updatePortfolio(portfolio) : this.createPortfolio(portfolio);
    }

    /**
     * Отправляет запрос на создание нового портфеля и возвращает созданную сущность
     * @param portfolio портфель
     */
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
    async updateShareNotes(portfolioId: string, shareNotes: { [key: string]: string }, data: EditShareNoteDialogData): Promise<{ [key: string]: string }> {
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
    async createPortfolioCopy(portfolioId: string): Promise<PortfolioParams> {
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
    static readonly BY_IDENTIFICATION = new PortfoliosDialogType("BY_IDENTIFICATION", "Пользователю");

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
export interface UpdatePortfolioRequest {
    /** Идентификатор портфеля */
    id: number;
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
    id: number;
    /** Срок действия доступа */
    expiredDate: string;
    /** Тип открытия доступа к портфелю */
    sharePortfolioType: string;
    /** Имя пользователя в системе */
    userName: string;
}

export interface MoneyResiduals {
    currency: string;
    amount: string;
}

export enum AdviceCode {
    ONLY_ONE_CURRENCY = "ONLY_ONE_CURRENCY",
    NO_GOLD_ETF = "NO_GOLD_ETF",
    NO_BONDS = "NO_BONDS",
    NO_NOTIFICATIONS = "NO_NOTIFICATIONS",
    AVG_YIELD_BELOW_DEPOSIT = "AVG_YIELD_BELOW_DEPOSIT",
    SECTOR_ABOVE_20 = "SECTOR_ABOVE_20",
    SECTOR_ABOVE_35 = "SECTOR_ABOVE_35",
    SECTOR_ABOVE_70 = "SECTOR_ABOVE_70",
    SHARE_ABOVE_10 = "SHARE_ABOVE_10",
    SHARE_ABOVE_20 = "SHARE_ABOVE_20",
    SHARE_ABOVE_40 = "SHARE_ABOVE_40",
    AVG_BOND_YIELD_BELOW_DEPOSIT = "AVG_BOND_YIELD_BELOW_DEPOSIT"
}