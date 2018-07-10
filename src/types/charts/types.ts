export type BaseChartDot = {
    date: string,
    amount: string
}

export type Dot = [number, number]

export type LineChartItem = BaseChartDot & {
    stockAmount: string,
    bondAmount: string,
    year: string,
    lastItemOfTheYear: string
}

export type EventChartData = {
    date: string,
    backgroundColor: string,
    description: string,
    text: string
}

export type HighStockEventData = {
    x: number,
    title: string,
    text: string
}

export type HighStockEventsGroup = {
    type: string,
    data: HighStockEventData[]
    onSeries: string,
    shape: string,
    color: string,
    fillColor: string,
    stackDistance: number,
    width: number
}

export type SectorChartData = {
    data: any[],
    categories: string[]
}

/** Данные для столбчатого графика */
export type ColumnDataSeries = {
    name: string,
    data: number[]
}

export type ColumnChartData = {
    categoryNames: string[],
    series: ColumnDataSeries[]
}