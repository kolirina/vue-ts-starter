import {Enum, EnumType, IStaticEnum} from "../platform/enum";
import {PortfolioParams} from "../services/portfolioService";
import {BaseChartDot, BasePriceDot, ColumnChartData, Dot, HighStockEventsGroup} from "./charts/types";

export type _portfolioRow = {
    /** Прибыль */
    profit: string,
    /** Процентная доля строки в от общего */
    percCurrShare: string,
    /** Текущая стоимость */
    currCost: string,

    assetType: string
};

export interface TariffHint {
    x: string;
    y: string;
    display: string;
}

export type NavBarItem = {
    title: string,
    /** routing, для корневых элементов может не заполнен */
    action?: string,
    path?: string,
    icon?: string,
    active?: boolean,
    subMenu?: NavBarItem[],
    params?: { [key: string]: string }
};

export type SignInData = {
    username: string,
    password: string,
    rememberMe: boolean
};

export type AssetRow = _portfolioRow & {
    type: string
};

export type TradeRow = {
    /** Идентификатор сделки */
    id: string,
    /** Дата */
    date: string,
    /** Тип актива */
    asset: string,
    /** Операция */
    operation: string,
    /** Описание операции */
    operationLabel: string,
    /** Валюта */
    currency: string,
    /** Валюта комиссии */
    feeCurrency: string,
    /** Итоговая сумма сделки */
    signedTotal: string,
    /** Итоговая сумма сделки без учета комиссии */
    totalWithoutFee: string,
    /** Тикер */
    ticker?: string,
    /** Идентификатор ценной бумаги/актива (Для замены тикера) */
    shareId?: string,
    /** Название компании */
    companyName?: string,
    /** Количество */
    quantity: number,
    /** Номинал */
    facevalue: string,
    /** НКД */
    nkd: string,
    /** Комиссия по сделке */
    fee: string,
    /** Заметка */
    note?: string,
    /** Цена, выраженная в деньгах. Для акций, начислений, дивидендов */
    moneyPrice?: string,
    /** Цена, выраженная в процентах. Для облигаций */
    bondPrice?: string,
    /** Идентификатор связанной сделки по списанию/зачислению денежных средств. Может быть null, если у сделки нет связи */
    moneyTradeId?: string,
    /** Идентификатор связанной родительской сделки. Может быть null, если у сделки нет связи */
    parentTradeId?: string,
    /** Связанная сделка */
    linkedTrade?: TradeRow
};

export type _shareRow = _portfolioRow & {
    /** Стоимость продаж */
    sCost: string,
    /** Стоимость покупок */
    bCost: string,
    /** Стоимость вложений */
    initCost: string,
    /** Средневзвешенная сумма инвестиций */
    avgInvested: string,
    /** Процент доходности рассчитанный с учетом средневзвешенной суммы инвестиций, выраженный в процентах годовы (сложный процент) */
    yearYield: string,
    /** Срок владения бумагой */
    ownedDays: string,
    /** Прибыль в процентах */
    percProfit: string,
    /** Текущая доля */
    percCurrShare: string,
    /** Прибыль обусловленная разницей курсовой стоимости актива */
    rateProfit: string,
    /** Процент прибыли (доходность), обусловленный разницей курсовой стоимости актива */
    rateProfitPercent: string,
    /** Прибыль от сделок по ценной бумаге */
    exchangeProfit: string,
    /** Процент прибыли от сделок по ценной бумаге */
    exchangeProfitPercent: string,
    /** Суммарная стоимость всего портфеля */
    summaryCost: string,
    /** Суммарная комиссия по операциям купли/продажи */
    summFee: string,
    /** Комиссия по покупкам */
    buyFee: string,
    /** Комиссия по продажам */
    sellFee: string,
    /** Дневная прибыль/убыток по позиции */
    dailyPl: string,
    /** Дневная прибыль/убыток по позиции в % */
    dailyPlPercent: string,
    /**
     * Количество значащих разрядов для округления средней цены.
     * Для тех случаев когда нет этого значения у самой акции или при конвертации валют
     */
    decimals: string
};

export type SharePortfolioSumRow = _shareRow & {
    /**
     * Текущая цена. Храним именно значение, а не используем из сущности Stock, чтобы не было расхождений, потому что кэш бумаг обновляется чаще
     * чем кэш портфеля
     */
    currPrice: string,
    /** Прибыль от начисленных дивидендов */
    profitFromDividends: string,
    /** Общая доходность от начисленных дивидендов */
    profitFromDividendsPercent: string
};

export type BondPortfolioSumRow = _shareRow & {
    /**
     * Текущая цена. Храним именно значение, а не используем из сущности Bond, чтобы не было расхождений, потому что кэш бумаг обновляется чаще
     * чем кэш портфеля
     */
    currPrice: string,
    /** Прибыль от выплаты купонов */
    profitFromCoupons: string,
    /** Прибыль от выплаты купонов в процентах */
    profitFromCouponsPercent: string,
    /** Суммарный выплаченный НКД при покупке облигаций */
    buyNkd: string,
    /** Полученный при продаже НКД */
    sellNkd: string
};

export type SharePortfolioRow = SharePortfolioSumRow & {
    /** Используется в качестве ключа в таблицах и все. */
    id: string,
    /** Количество */
    quantity: number,
    /** Средняя цена покупки */
    avgBuy: string,
    /** Чистая цена по бумаге */
    avgBuyClean: string,
    /** Дата первой сделки */
    firstBuy: string,
    /** Дата последенй сделки */
    lastBuy: string,
    /** Признак того, что позиция по бумаге короткая */
    isShort: string,
    /** Количество полных лотов по бумаге в портфеле */
    lotCounts: string
};

export type StockPortfolioSumRow = SharePortfolioSumRow & {};

export type StockPortfolioRow = SharePortfolioRow & {
    stock: Stock,
    share: Stock | Asset
};

export type AssetPortfolioSumRow = SharePortfolioSumRow & {};

export type AssetPortfolioRow = SharePortfolioRow & {
    asset: Asset,
    share: Stock | Asset,
};

export type BondPortfolioRow = BondPortfolioSumRow & {
    /** Идентификатор */
    id: string,
    /** Облигация */
    bond: Bond,
    /** Количество */
    quantity: number,
    /** Средняя цена покупки */
    avgBuy: string,
    /** Средняя без комиссий */
    avgBuyClean: string,
    /** Абсолютное значение цены (покупки или продажи) */
    absoluteAvgPrice: string,
    /**
     * Используется для отбражения текущего номинала. Храним именно значение, а не используем из сущности Share, чтобы не было расхождений,
     * потому что кэш бумаг обновляется чаще чем кэш портфеля
     */
    currNominal: string,
    /**
     * Используется для отбражения текущего номинала. Храним именно значение, а не используем из сущности Share, чтобы не было расхождений,
     * потому что кэш бумаг обновляется чаще чем кэш портфеля
     */
    absolutePrice: string,
    /** Дисконт */
    amortization: string,
    nominal: string,
    /** Признак что связанная облигация погашена */
    repaid: string,

    checked: string,

    firstBuy: string,

    lastBuy: string
};

/** Сущность с основными данными по портфелю */
export interface Overview {
    /** Данные дашборда */
    dashboardData: DashboardData;
    /** Данные таблицы Активы */
    assetRows: AssetRow[];
    /** Данные таблицы Акции */
    stockPortfolio: StockPortfolio;
    /** Данные таблицы Активы */
    assetPortfolio: AssetPortfolio;
    /** Данные таблицы Облигации */
    bondPortfolio: BondPortfolio;
    /** Общее количество сделок в портфеле */
    totalTradesCount: number;
    /** Дата первой сделки в портфеле. Может быть null если в портфеле еще ни одной сделки */
    firstTradeDate: string;
    /** Дата последней сделки в портфеле. Может быть null если в портфеле еще ни одной сделки */
    lastTradeDate: string;
    /** Дата по которую рассчитаны данные */
    cutDate: string;
    /** Общая сумма пользовательских прибылей */
    usersIncomes: string;
    /** Общая сумма пользовательских убытков */
    usersLosses: string;
}

export type StockPortfolio = {
    sumRow: SharePortfolioSumRow,
    rows: StockPortfolioRow[]
};

export type AssetPortfolio = {
    sumRow: AssetPortfolioSumRow,
    rows: AssetPortfolioRow[]
};

export type BondPortfolio = {
    sumRow: BondPortfolioSumRow,
    rows: BondPortfolioRow[]
};

export type Portfolio = {
    id: number,
    portfolioParams: PortfolioParams,
    overview: Overview
};

export type TableHeader = {
    text: string,
    align?: string,
    sortable?: boolean,
    value: string,
    class?: string[] | string,
    width?: string,
    /** Определяет показ элемента в таблице */
    active?: boolean,
    /** Определяет показ элемента в диалоге переключения калонок. */
    ghost?: boolean,
    /** Текст подсказки к столбцу */
    tooltip?: string,
    /** Признак что столбец отображает значение с валютой, чтобы подставить знак валюты */
    currency?: boolean
};

export type DashboardData = {
    currentCost: string,
    currentCostInAlternativeCurrency: string,
    profitWithoutDividendsAndCoupons: string,
    profit: string,
    percentProfit: string,
    profitWithoutFees: string,
    yearYield: string,
    yearYieldWithoutDividendsAndCoupons: string,
    dailyChanges: string,
    dailyChangesPercent: string
};

export type DashboardBrick = {
    name: string,
    mainValue: string,
    secondValue: string,
    secondValueDesc?: string,
    hasNotBorderLeft?: boolean,
    isSummaryIncome?: {
        isUpward: boolean
    },
    mainCurrency: string,
    secondCurrency: string,
    tooltip?: string,
    secondTooltip?: string
};

/** Описание бэкапа портфеля */
export interface PortfolioBackup {
    /** Идентификатор бэкапа */
    id?: number;
    /** список идентификаторов портфелей */
    portfolioIds: number[];
    /** Список дней для создания бэкапа */
    days: number[];
}

export enum ShareType {
    STOCK = "STOCK",
    BOND = "BOND",
    ASSET = "ASSET",
}

export type Share = {
    /** Идентификатору бумаги в системе */
    id: number;
    /** Текущая цена бумаги */
    price: string,
    /** Размер лота */
    lotsize: string,
    /** Количество значащих разрядов */
    decimals: string;
    /** Код валюты */
    currency: string;
    /** ISIN-номер */
    isin: string;
    /** Короткое название */
    shortname: string;
    /** Изменение за день */
    change: string;
    /** Доска, где торгуется бумага */
    boardName: string;
    /** Название */
    name: string;
    /** Тикер */
    ticker: string;
    /** Тип актива бумаги */
    shareType: ShareType;
    /** Дата последнего изменения по бумаге */
    lastUpdateTime?: string;
    /** Рейтинг бумаги */
    rating: string;
    /** Голосов пользователей по бумаге */
    ratingCount: string;
};

/**
 * Сущность акции
 */
export type Stock = Share & {
    /** Текущая цена */
    price: string;
    /** Номер выпуска */
    regNumber: string;
    /** Размер лота */
    lotsize: number;
    /** Рейтинг */
    rating: number;
    /** Максимальный рейтинг по акции */
    maxRating: number;
    /** Последний рейтинг по акции */
    lastRating: string;
    /** Интервал */
    interval: string;
    /** Сайт */
    site: string;
    /** Див.доходность за три года */
    yield3: string;
    /** Див.доходность за пять лет */
    yield5: string;
    /** Див.доходность за все время */
    yieldAll: string;
    /** доля акции в индексе */
    weight: string;
    color: string;
    /** Признак что акция привилегированная */
    privileged: string;
    /** Сектор */
    sector: Sector;
    /** Кол-во акций в обращении */
    issueSize: string;
    /** Рыночная капитализация */
    issueCapitalization: string;
    /** Идентификатор эмитента на сайте биржи */
    moexId: string;
};

export type Asset = Share & {
    /** Url по которму можно парсить цену */
    source?: string;
    /** Регулярное выражение для парсинга цены */
    regex?: string;
    /** Список тэгов */
    tags?: string;
    /** Заметка */
    note?: string;
    /** Идентификатор пользователя (владельца), может не быть, если это общесистемный актив */
    userId?: string;
    /** Текущая цена */
    price: string;
    /** Сектор */
    sector: Sector;
};

/** Информация по динамике ценной бумаги */
export type ShareDynamic = {
    /** Минимальная за год */
    minYearPrice: string;
    /** Максимальная за год */
    maxYearPrice: string;
    /** Динамика за 1 месяц */
    yieldMonth1: string;
    /** Динамика за 6 месяцев */
    yieldMonth6: string;
    /** Динамика за 12 месяцев */
    yieldMonth12: string;
    /** График цены за год */
    yearHistory: BasePriceDot[];
    /** Текущая цена */
    current: string;
};

export type StockHistoryResponse = {
    stock: Stock;
    date: string;
};

export type AssetHistoryResponse = {
    asset: Asset;
    date: string;
};

export type Sector = {
    name: string;
    parent: Sector;
    root: boolean;
};

export type Bond = Share & {
    /** Идентификатор облигации */
    secid: string;
    /** Доходность облигации */
    yield: string;
    /** Размер купона */
    couponvalue: string;
    /** Дата следующего купона */
    nextcoupon: string;
    /** Текущий НКД */
    accruedint: string;
    /** Текущая цена */
    prevprice: string;
    /** Дата погашения */
    matdate: string;
    /** Дюрация */
    duration: string;
    /** Название облигации */
    secname: string;
    /** Номинал облигации */
    facevalue: string;
    /** Номер выпуска */
    regnumber: string;
    /** Отформатированное значение номинала */
    formattedFacevalue: string;
    /** Признак что облигация уже погашена на данный момент */
    isRepaid: boolean;
    /** Абсолютная текущая цена облигации без учета НКД */
    absolutePrice: string;
};

export type BondHistoryResponse = {
    bond: Bond;
    date: string;
};

/** Информация по акции */
export type StockInfo = {
    /** Акция */
    share: Stock;
    /** История цены */
    history: Dot[];
    /** Дивиденды */
    dividends: BaseChartDot[];
    /** Динамика */
    shareDynamic: ShareDynamic;
    /** События. В данном случае дивиденды */
    events: HighStockEventsGroup;
};

/** Информация по активу */
export type AssetInfo = {
    /** Актив */
    share: Asset;
    /** Информация по динамике ценной бумаги */
    shareDynamic: ShareDynamic;
    /** История цены */
    history: Dot[];
    /** Дивиденды */
    dividends?: BaseChartDot[];
    /** События. В данном случае дивиденды */
    events?: HighStockEventsGroup;
};

/** Информация по облигации */
export type BondInfo = {
    /** Облигация */
    bond: Bond;
    /** История цены */
    history: Dot[];
    /** Выплаты */
    payments: ColumnChartData;
    /** События. В данном случае дивиденды */
    events: HighStockEventsGroup[];
};

export type LoginRequest = {
    username: string,
    password: string
};

export type CombinedInfoRequest = {
    ids: number[],
    viewCurrency: string
};

/** Запрос на обновление текущего остатка денежных средств */
export interface CurrentMoneyRequest {
    /** Текущий остаток денежных средств */
    currentMoney: string;
    /** Валюта остатка */
    currency: string;
    /** Признак корректировки после импорта */
    afterImport?: boolean;
}

export interface ErrorInfo {
    errorCode: string;
    message: string;
    fields: ErrorFieldInfo[];
}

export type ErrorFieldInfo = {
    name: string,
    errorCode: string,
    errorMessage: string
};

export enum Status {
    SUCCESS = "SUCCESS",
    WARN = "WARN",
    ERROR = "ERROR"
}

export type Pagination = {
    descending?: boolean,
    page?: number,
    rowsPerPage?: number,
    sortBy?: string,
    totalItems?: number,
    pages?: number;
};

export type TablePagination = {
    pagination?: Pagination,
    totalItems?: number,
    loading?: boolean
};

/** Сущность постраничного ответа */
export interface PageableResponse<T> {
    /** Список элементов */
    content: T[];
    /** Всего элементов */
    totalItems: number;
    /** Количество страниц */
    pages: number;
    /** Размер страницы */
    pageSize: number;
    /** Номер страницы */
    pageNumber: number;
    /** Сортировка */
    descending: boolean;
    /** Смещение */
    offset: number;
}

/** Информация о валюте */
export interface Currency {
    /** Идентификатор */
    id: string;
    /** Числовой код валюты */
    numCode: string;
    /** Буквенный код валюты */
    charCode: string;
    /** Номинал валюты */
    nominal: string;
    /** Название валюты */
    name: string;
    /** Курс валюты */
    value: string;
}

export enum EventType {
    reloadLineChart = "reloadLineChart",
    exportTable = "exportTable",
}

export enum BlockType {
    EMPTY = "empty",
    AGGREGATE = "aggreagate",
    ASSETS = "assets",
    HISTORY_PANEL = "historyPanel",
    STOCK_PORTFOLIO = "stockPortfolio",
    BOND_PORTFOLIO = "bondPortfolio",
    BOND_PIE = "bondPie",
    STOCK_PIE = "stockPie",
    SECTORS_PIE = "sectorsPie",
}

/** Перечислению доступных валют */
@Enum("code")
export class CurrencyUnit extends (EnumType as IStaticEnum<CurrencyUnit>) {

    static readonly RUB = new CurrencyUnit("RUB", "Рубль");
    static readonly USD = new CurrencyUnit("USD", "Доллар");
    static readonly EUR = new CurrencyUnit("EUR", "Евро");

    private constructor(public code: string, public description: string) {
        super();
    }
}

export interface MapType {
    [key: string]: string;
}

/** Перечислению кодов для 403 ответов */
@Enum("code")
export class ForbiddenCode extends (EnumType as IStaticEnum<ForbiddenCode>) {

    static readonly LIMIT_EXCEEDED = new ForbiddenCode("LIMIT_EXCEEDED", "К сожалению, Ваш тарифный план не позволяет выполнить это действие из-за лимита " +
        "на количество ценных бумаг или портфелей. Пожалуйста, обновите Ваш план и получите доступ к новым возможностям.");
    static readonly PERMISSION_DENIED = new ForbiddenCode("PERMISSION_DENIED", "Сожалеем, но на Вашем тарифном плане эта функциональность недоступен. " +
        "Пожалуйста, обновите Ваш план и получите доступ к новым возможностям.");
    static readonly CURRENCY_PERMISSION_DENIED = new ForbiddenCode("CURRENCY_PERMISSION_DENIED", "Сожалеем, но на Вашем тарифном плане нет возможности работы с валютами. " +
        "Пожалуйста, обновите Ваш план и получите доступ к новым возможностям.");
    static readonly SUBSCRIPTION_EXPIRED = new ForbiddenCode("SUBSCRIPTION_EXPIRED", "Сожалеем, но подписка во Вашему тарифу истекла. " +
        "Для выполнения действия, пожалуйста, продлите подписку и получите доступ к новым возможностям.");
    static readonly DEMO_MODE = new ForbiddenCode("DEMO_MODE", "Вы находитесь в демо-режиме. Чтобы воспользоваться всеми возможностями сервиса, " +
        "Вам нужно всего лишь зарегистрироваться - это займет не больше пары минут");

    private constructor(public code: string, public description: string) {
        super();
    }
}

@Enum("code")
export class RiskType extends (EnumType as IStaticEnum<RiskType>) {

    static readonly LOW = new RiskType("low", "низкий", "Хочу сохранить накопленный капитал, не готов рисковать более 5-10% портфеля", "./img/adviser/lowerRisk.svg");
    static readonly MIDDLE = new RiskType("middle", "средний", "Хочу получить доходность выше депозита, готов к потерям до 10-20%", "./img/adviser/midleRisk.svg");
    static readonly HIGH = new RiskType("high", "высокий", "Хочу получить максимальный доход, готов на значительный риск", "./img/adviser/highestRisk.svg");

    private constructor(public code: string, public title: string, public description: string, public imgSrc: string) {
        super();
    }
}

@Enum("code")
export class OverviewPeriod extends (EnumType as IStaticEnum<OverviewPeriod>) {

    static readonly PREVIOUS_WEEK = new OverviewPeriod("PREVIOUS_WEEK", "Прошлая неделя");
    static readonly PREVIOUS_MONTH = new OverviewPeriod("PREVIOUS_MONTH", "Прошлый месяц");
    static readonly PREVIOUS_QUARTER = new OverviewPeriod("PREVIOUS_QUARTER", "Прошлый квартал");
    static readonly PREVIOUS_HALF_YEAR = new OverviewPeriod("PREVIOUS_HALF_YEAR", "Прошлое полугодие");
    static readonly PREVIOUS_YEAR = new OverviewPeriod("PREVIOUS_YEAR", "Прошлый год");
    static readonly TOTAL = new OverviewPeriod("TOTAL", "За все время");

    private constructor(public code: string, public description: string) {
        super();
    }
}