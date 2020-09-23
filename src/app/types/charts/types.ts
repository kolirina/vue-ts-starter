import {DataPoint} from "highcharts";
import {Enum, EnumType, IStaticEnum} from "../../platform/enum";

export interface CustomDataPoint extends DataPoint {
    profit?: string;
    period?: string;
    totalAmount?: string;
    currencySymbol?: string;
}

export interface YieldCompareData {
    depositYearYield: string;
    inflationYearYield: string;
    micexYearYield: string;
    portfolioYearYield: string;
}

export interface SimpleChartData {
    categoryNames: string[];
    values: ChartPoint[];
}

export interface ChartPoint {
    name: string;
    y: number;
}

/** TODO заменить на BaseChartDot */
export interface AnalyticsChartPoint {
    /** Дата */
    date: string;
    /** Значение */
    value: string;
}

export type BaseChartDot = {
    /** Дата точки графика */
    date: string,
    /** Сумма */
    amount: string
};

export type BasePriceDot = {
    date: string,
    price: string
};

export type Dot = [number, number];

export type LineChartItem = BaseChartDot & {
    /** Сумма приходящаяся на акции */
    stockAmount: string,
    /** "Сумма приходящаяся на облигации */
    bondAmount: string,
    /** "Сумма приходящаяся на ETF */
    etfAmount: string,
    /** Сумма приходящаяся на денежные средства */
    moneyAmount: string,
    /** Сумма приходящаяся на денежные средства (Вводы/Выводы ДС, без учета списаний по связанным сделкам) */
    inOutMoneyAmount: string,
    /** Прибыль по сделкам */
    exchangeProfit: string;
    /** Прибыль курсовая */
    rateProfit: string;
    /** Прибыль от начислений (Дивиденды, Купоны) */
    calculationProfit: string;
    /** Прибыль общая */
    totalProfit: string;
    /** Разница прибыли за период */
    totalPeriodProfit: string;
    /** Прибыль за перод в процентах, посчитанная относительно СВСИ на конец периода */
    totalPeriodPercentProfit: string;
    /** Прибыль от амортизации */
    amortizationProfit: string;
    /** Комиссия накопительным итогом */
    totalFee: string;
    /** Полученный и выплаченный НКД накопительным итогом */
    totalNkd: string;
    /** НКД по открытой позиции */
    openPositionNkd: string;
    /** Год */
    year: string,
    /** Признак что это последняя запись в году */
    lastItemOfTheYear: string
};

/** Информация для графиков стоимости и прибыли */
export interface PortfolioLineChartData {
    /** Список данных для отрисовки графика */
    lineChartData: LineChartItem[];
    /** Данные для графика прибыли в разбивке по месяцам */
    pointsByMonth: { [key: string]: LineChartItem };
    /** Данные для графика прибыли в разбивке по годам */
    pointsByYear: { [key: string]: LineChartItem };
}

export type EventChartData = {
    date: string,
    backgroundColor: string,
    description: string,
    text: string
};

export type HighStockEventData = {
    x: number,
    title: string,
    text: string,
    initialPoints?: HighStockEventData[],
    color?: string
};

export type HighStockEventsGroup = {
    type: string,
    data: HighStockEventData[]
    onSeries: string,
    shape?: string,
    name?: string,
    color?: string,
    fillColor?: string,
    stackDistance?: number,
    width?: number
};

export type SectorChartData = {
    data: any[],
    categories: string[]
};

/** Данные для столбчатого графика */
export type ColumnDataSeries = {
    name: string,
    data: CustomDataPoint[],
    color?: string,
    yAxis?: number,
};

export type ColumnChartData = {
    categoryNames: string[],
    series: ColumnDataSeries[]
};

export enum PieChartTooltipFormat {
    COMMON = "COMMON",
    ASSETS = "ASSETS",
    YIELDS = "YIELDS"
}

export interface LineChartSeries {
    balloonTitle: string;
    data: any[];
    enabled?: boolean;
    id: string;
}

/** Перечислению типов графиков */
@Enum("code")
export class ChartSeries extends (EnumType as IStaticEnum<ChartSeries>) {
    static readonly EVENTS = new ChartSeries("showTrades", "Сделки портфеля", "_SHOW_EVENTS", "");
    static readonly INDEX_STOCK_EXCHANGE = new ChartSeries("showStockExchange", "Индекс МосБиржи", "_SHOW_INDEX_STOCK_EXCHANGE", "");
    static readonly MONEY = new ChartSeries("moneyChart", "Денежные средства", "_SHOW_MONEY", "moneyAmount");
    static readonly IN_OUT_MONEY = new ChartSeries("inOutMoneyChart", "Внесения/Списания ДС", "_SHOW_IN_OUT_MONEY", "inOutMoneyAmount");
    static readonly STOCKS = new ChartSeries("stockChart", "Стоимость акций", "_SHOW_STOCKS", "stockAmount");
    static readonly ETF = new ChartSeries("etfChart", "Стоимость ПИФов/ETF", "_SHOW_ETF", "etfAmount");
    static readonly BONDS = new ChartSeries("bondChart", "Стоимость облигаций", "_SHOW_BONDS", "bondAmount");
    static readonly TOTAL = new ChartSeries("totalChart", "Суммарная стоимость", "_SHOW_TOTAL", "amount");
    static readonly RATE_PROFIT = new ChartSeries("rateProfit", "Курсовая прибыль", "_SHOW_RATE_PROFIT", "rateProfit");
    static readonly EXCHANGE_PROFIT = new ChartSeries("exchangeProfit", "Прибыль по сделкам", "_SHOW_EXCHANGE_PROFIT", "exchangeProfit");
    static readonly CALCULATION_PROFIT = new ChartSeries("calculationProfit", "Прибыль по начислениям", "_SHOW_CALCULATION_PROFIT", "calculationProfit");
    static readonly TOTAL_PROFIT = new ChartSeries("totalProfit", "Суммарная прибыль", "_SHOW_TOTAL_PROFIT", "totalProfit");

    private constructor(public code: string, public description: string, public storagePrefix: string, public fieldName: string) {
        super();
    }
}

export interface ChartSeriesFilter {
    /** Признак отображения сделок на графике */
    showTrades?: boolean;
    /** Признак отображения графика суммарной стоимости */
    totalChart?: boolean;
    /** Признак отображения графика индкса Мосбиржи */
    showStockExchange?: boolean;
    /** Признак отображения графика денежных средств */
    moneyChart?: boolean;
    /** Признак отображения графика внесения/списания ДС */
    inOutMoneyChart?: boolean;
    /** Признак отображения графика стоимости Акций */
    stockChart?: boolean;
    /** Признак отображения графика стоимости ETF */
    etfChart?: boolean;
    /** Признак отображения графика стоимости Облигаций */
    bondChart?: boolean;
    /** Признак отображения графика Прибыль по сделкам */
    exchangeProfit?: boolean;
    /** Признак отображения графика Прибыль курсовая */
    rateProfit?: boolean;
    /** Признак отображения графика Прибыль от начислений (Дивиденды, Купоны) */
    calculationProfit?: boolean;
    /** Признак отображения графика Прибыль общая */
    totalProfit?: boolean;
}

export enum ChartType {
    ASSETS_CHART = "assetsPieChart",
    STOCK_CHART = "stockPieChart",
    ETF_CHART = "etfPieChart",
    BOND_CHART = "bondPieChart",
    SECTORS_CHART = "sectorsChart",
    BOND_SECTORS_CHART = "bondSectorsChart",
    AGGREGATE_CHART = "aggregatePieChart",
    YIELD_CONTRIBUTORS_CHART = "yieldContributorsChart",
    WHOLE_PORTFOLIO_SHARES_ALLOCATION_CHART = "wholePortfolioSharesAllocationChart",
    PORTFOLIO_LINE_CHART = "portfolioLineChart",
    PROFIT_LINE_CHART = "profitLineChart",
    PROFIT_MONTH_CHART = "profitMonthChart",
    PROFIT_YEAR_CHART = "profitYearChart",
    FUTURE_EVENTS_CHART = "futureEventsChart",
}
