import {Enum, EnumType, IStaticEnum} from "../../platform/enum";

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
    /** Сумма приходящаяся на денежные средства */
    moneyAmount: string,
    /** Сумма приходящаяся на денежные средства (Вводы/Выводы ДС, без учета списаний по связанным сделкам) */
    inOutMoneyAmount: string,
    /** Год */
    year: string,
    /** Признак что это последняя запись в году */
    lastItemOfTheYear: string
};

export type EventChartData = {
    date: string,
    backgroundColor: string,
    description: string,
    text: string
};

export type HighStockEventData = {
    x: number,
    title: string,
    text: string
};

export type HighStockEventsGroup = {
    type: string,
    data: HighStockEventData[]
    onSeries: string,
    shape: string,
    name?: string,
    color: string,
    fillColor: string,
    stackDistance: number,
    width: number
};

export type SectorChartData = {
    data: any[],
    categories: string[]
};

/** Данные для столбчатого графика */
export type ColumnDataSeries = {
    name: string,
    data: number[],
    color?: string,
    yAxis?: number,
};

export type ColumnChartData = {
    categoryNames: string[],
    series: ColumnDataSeries[]
};

export enum PieChartTooltipFormat {
    COMMON = "COMMON",
    ASSETS = "ASSETS"
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
    static readonly BONDS = new ChartSeries("bondChart", "Стоимость облигаций", "_SHOW_BONDS", "bondAmount");
    static readonly TOTAL = new ChartSeries("totalChart", "Суммарная стоимость", "_SHOW_TOTAL", "amount");

    private constructor(public code: string, public description: string, public storagePrefix: string, public fieldName: string) {
        super();
    }
}

export interface ChartSeriesFilter {
    /** Признак отображения сделок на графике */
    showTrades: boolean;
    /** Признак отображения графика суммарной стоимости */
    totalChart: boolean;
    /** Признак отображения графика индкса Мосбиржи */
    showStockExchange: boolean;
    /** Признак отображения графика денежных средств */
    moneyChart: boolean;
    /** Признак отображения графика внесения/списания ДС */
    inOutMoneyChart: boolean;
    /** Признак отображения графика стоимости Акций */
    stockChart: boolean;
    /** Признак отображения графика стоимости Облигаций */
    bondChart: boolean;
}
