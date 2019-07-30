import * as chroma from "chroma-js";
import dayjs from "dayjs";
import {Decimal} from "decimal.js";
import Highcharts, {AreaChart, ChartObject, DataPoint, Gradient, IndividualSeriesOptions, PlotLines, SeriesChart} from "highcharts";
import Highstock from "highcharts/highstock";
import {Filters} from "../platform/filters/Filters";
import {BigMoney} from "../types/bigMoney";
import {AdviserLineChart, RequestDataAdviserLineChart} from "../types/charts/types";
import {
    BasePriceDot,
    ColumnChartData,
    ColumnDataSeries,
    EventChartData,
    HighStockEventData,
    HighStockEventsGroup,
    LineChartItem,
    LineChartSeries,
    PieChartTooltipFormat,
    SectorChartData
} from "../types/charts/types";
import {Operation} from "../types/operation";
import {Overview, StockPortfolioRow} from "../types/types";
import {CommonUtils} from "./commonUtils";
import {DateUtils} from "./dateUtils";
import {TradeUtils} from "./tradeUtils";

export class ChartUtils {

    /** Типы форматов для тултипа */
    static PIE_CHART_TOOLTIP_FORMAT = {
        COMMON: "<b>{point.y}, ({point.percentage:.2f} %)</b> <br/>{point.tickers}",
        ASSETS: "<b>{point.y:.2f} % ({point.description})</b>"
    };
    /** Цвета операций */
    static OPERATION_COLORS: { [key: string]: string } = {
        [Operation.DIVIDEND.description]: "#F44336",
        [Operation.COUPON.description]: "#03A9F4",
        [Operation.AMORTIZATION.description]: "#9C27B0",
        [Operation.REPAYMENT.description]: "#4CAF50",
    };
    /** Типы экспорта графика */
    static EXPORT_TYPES: { [key: string]: string } = {
        PNG: "",
        JPG: "image/jpeg",
        PDF: "application/pdf",
        SVG: "image/svg+xml"
    };

    private constructor() {
    }

    static doSectorsChartData(overview: Overview): SectorChartData {
        const data: any[] = [];
        const currentTotalCost = overview.stockPortfolio.rows.map(row => new BigMoney(row.currCost).amount.abs())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        const rowsBySector: { [sectorName: string]: StockPortfolioRow[] } = {};
        overview.stockPortfolio.rows.filter(row => row.quantity !== 0).forEach(row => {
            const sector = row.stock.sector;
            const sectorName = sector.root ? sector.name : sector.parent.name;
            if (rowsBySector[sectorName] === undefined) {
                rowsBySector[sectorName] = [];
            }
            rowsBySector[sectorName].push(row);
        });
        Object.keys(rowsBySector).forEach(key => {
            const sumAmount = rowsBySector[key].map(row => new BigMoney(row.currCost).amount.abs())
                .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
            const tickers = rowsBySector[key].map(row => row.stock.ticker).join(", ");
            const percentage = new Decimal(sumAmount).mul(100).dividedBy(currentTotalCost).toDP(2, Decimal.ROUND_HALF_UP).toString();
            data.push({
                name: key,
                y: sumAmount.toDP(2, Decimal.ROUND_HALF_UP).toNumber(),
                percentage,
                tickers
            });
        });
        const categoryNames = Object.keys(rowsBySector);
        return {data, categories: categoryNames};
    }

    static processEventsChartData(data: EventChartData[], flags: string = "flags", onSeries: string = "totalChart",
                                  shape: string = "circlepin", width: number = 10): HighStockEventsGroup[] {
        const eventsGroups: HighStockEventsGroup[] = [];
        const events: HighStockEventData[] = [];
        const temp = data.reduce((result: { [key: string]: HighStockEventData[] }, current: EventChartData) => {
            result[current.backgroundColor] = result[current.backgroundColor] || [];
            result[current.backgroundColor].push({x: new Date(current.date).getTime(), title: current.text, text: current.description});
            return result;
        }, {} as { [key: string]: HighStockEventData[] });
        let count = 0;
        Object.keys(temp).forEach(key => {
            eventsGroups.push({
                type: flags,
                data: temp[key],
                name: `events${count++}`,
                onSeries: onSeries,
                shape: shape,
                color: key,
                fillColor: key,
                stackDistance: 20,
                width: width
            });
        });
        return eventsGroups;
    }

    static doStockPieChartData(overview: Overview): DataPoint[] {
        const data: DataPoint[] = [];
        overview.stockPortfolio.rows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            data.push({
                name: row.stock.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }

    static doBondPieChartData(overview: Overview): DataPoint[] {
        const data: DataPoint[] = [];
        overview.bondPortfolio.rows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            data.push({
                name: row.bond.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
    }

    static doAssetsPieChartData(overview: Overview): DataPoint[] {
        const data: DataPoint[] = [];
        overview.assetRows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            const currCost = new BigMoney(row.currCost);
            const currCostAmount = currCost.amount.abs().toDP(2, Decimal.ROUND_HALF_UP).toNumber();
            data.push({
                name: Filters.assetDesc(row.type),
                description: `${currCostAmount} ${currCost.currencySymbol}`,
                y: Number(row.percCurrShare)
            });
        });
        return data;
    }

    static convertPriceDataDots(data: BasePriceDot[]): any[] {
        const result: any[] = [];
        data.forEach(value => {
            result.push([new Date(value.date).getTime(), parseFloat(value.price)]);
        });
        return result;
    }

    // tslint:disable-next-line
    private static readonly ranges: Highstock.RangeSelectorButton[] = [
        {
            type: "day",
            count: 10,
            text: "10d"
        },
        {
            type: "month",
            count: 1,
            text: "1m"
        }, {
            type: "month",
            count: 3,
            text: "3m"
        }, {
            type: "month",
            count: 6,
            text: "6m"
        }, {
            type: "ytd",
            text: "YTD"
        }, {
            type: "year",
            count: 1,
            text: "1y"
        }, {
            type: "all",
            text: "All"
        }];

    // tslint:disable-next-line
    private static readonly areaChart: AreaChart = {
        fillColor: {
            linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
            },
            stops: [
                [0, (Highcharts.Color(Highcharts.getOptions().colors[0]) as Gradient).setOpacity(0.2).get("rgba")],
                [1, (Highcharts.Color(Highcharts.getOptions().colors[0]) as Gradient).setOpacity(0.2).get("rgba")]
            ]
        },
        marker: {
            radius: 2
        },
        lineWidth: 1,
        states: {
            hover: {
                lineWidth: 1
            }
        },
        threshold: null
    };

    static convertDiagramData(data: RequestDataAdviserLineChart[]): AdviserLineChart {
        const result: AdviserLineChart = {
            categoryNames: [],
            values: []
        };
        data.forEach((item: RequestDataAdviserLineChart) => {
            const month = DateUtils.getNameMonthDate(item.date);
            result.categoryNames.push(month);
            result.values.push(
                {
                    name: month,
                    y: Number(item.value)
                }
            );
        });
        return result;
    }

    static getChartRanges(): Highstock.RangeSelectorButton[] {
        return this.ranges;
    }

    /**
     * Отрисовывает график и возвращает объект
     * @param container контейнер где будет рисоваться график
     * @param eventsChartData данные по событиям
     * @param ranges диапазон выбора дат
     * @param selectedRangeIndex индекс выбранного диапазона
     * @param decimals количество знаков для округления на графике
     * @param title заголовк графика
     * @param yAxisTitle заголовок для оси y
     * @param callback callback вызваемый после загрузки
     * @param portfolioAvg средняя цена бумаги в портфеле (для рисования горизонтальной линии)
     * @param compareData данные графика
     * @param compare тип сравнения графиков percent или ""
     */
    static drawLineChart(container: HTMLElement, eventsChartData: HighStockEventsGroup[], ranges: Highstock.RangeSelectorButton[],
                         selectedRangeIndex: number, decimals: number, title: string = "", yAxisTitle: string = "",
                         callback: () => void = null, portfolioAvg: number = null, compareData: LineChartSeries[] = [], compare: boolean = false): ChartObject {
        const compareSeries: IndividualSeriesOptions[] = compareData.map(series => {
            return {
                type: "area",
                name: series.balloonTitle,
                data: series.data,
                id: series.id
            };
        });
        return Highstock.stockChart(container, {
            chart: {
                zoomType: "x",
                backgroundColor: null,
                style: {
                    fontFamily: "\"Open Sans\" sans-serif",
                    fontSize: "12px"
                },
                events: {
                    load(event: Event): void {
                        if (callback) {
                            callback();
                        }
                    }
                }
            },
            title: {
                text: title
            },
            subtitle: {
                text: ""
            },
            rangeSelector: {
                buttons: ranges,
                selected: selectedRangeIndex,
                inputEnabled: true
            },
            xAxis: {
                type: "datetime",
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontFamily: "\"Open Sans\" sans-serif",
                        fontSize: "12px"
                    }
                }
            },
            yAxis: {
                title: {
                    text: yAxisTitle
                },
                plotLines: portfolioAvg ? [{
                    value: portfolioAvg,
                    color: "#1976d2",
                    dashStyle: "shortdash",
                    width: 2,
                    label: {
                        text: `Средняя цена в портфеле ${portfolioAvg}`
                    }
                } as PlotLines] : []
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: ChartUtils.areaChart,
                series: {
                    compare: compare ? "percent" : "",
                    showInNavigator: true
                } as any
            },
            tooltip: {
                valueDecimals: decimals,
                split: true,
                shared: CommonUtils.isMobile(),
                // @ts-ignore
                formatter: function(): string {
                    // @ts-ignore
                    if (this.points) {
                        // The first returned item is the header, subsequent items are the points
                        // @ts-ignore
                        return ["<b>" + DateUtils.formatDate(dayjs(this.x)) + "</b>"].concat(
                            // @ts-ignore
                            this.points.map((point): string => {
                                return compare ? `<span style=\"color:${point.series.color}\">${point.series.name}</span>: <b>${point.y}</b> (${point.change}%)<br/>` :
                                    `<span style=\"color:${point.series.color}\">${point.series.name}</span>: <b>${point.y}</b><br/>`;
                            })
                        );
                        // @ts-ignore
                    } else if (this.point) {
                        // @ts-ignore
                        return this.point.text;
                    }
                }
            },
            exporting: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            series: [
                ...compareSeries || [],
                // @ts-ignore
                ...eventsChartData || []
            ],
        });
    }

    /**
     * Отрисовывает график и возвращает объект
     * @param container контейнер где будет рисоваться график
     * @param chartData данные для графика
     * @param balloonTitle заголовок в тултипе
     * @param title заголовк графика
     * @param viewCurrency валюта
     * @param tooltipFormat формат тултипа
     */
    static drawPieChart(container: HTMLElement, chartData: any[], balloonTitle: string, title: string = "", viewCurrency: string = "",
                        tooltipFormat: PieChartTooltipFormat = PieChartTooltipFormat.COMMON): ChartObject {
        const isMobile = CommonUtils.isMobile();
        return Highcharts.chart(container, {
            chart: {
                type: "pie",
                backgroundColor: null,
                style: {
                    fontFamily: "\"OpenSans\" sans-serif",
                    fontSize: "12px"
                }
            },
            title: {
                text: title
            },
            tooltip: {
                pointFormat: this.PIE_CHART_TOOLTIP_FORMAT[tooltipFormat],
                valueSuffix: `${viewCurrency ? ` ${TradeUtils.getCurrencySymbol(viewCurrency)}` : ""}`
            },
            colors: ChartUtils.getColors(chartData.length),
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: !isMobile,
                        format: "<b>{point.name}</b>: {point.percentage:.2f} %",
                        style: {
                            color: "black"
                        }
                    },
                    showInLegend: true
                }
            },
            exporting: {
                enabled: false
            },
            series: [{
                name: balloonTitle,
                data: chartData
            }]
        });
    }

    static drawMicroLineChart(container: HTMLElement, chartData: any[], callback: () => void = null): ChartObject {
        return Highstock.stockChart(container, {
            chart: {
                backgroundColor: null,
                events: {
                    load(event: Event): void {
                        if (callback) {
                            callback();
                        }
                    }
                }
            },
            title: {
                text: ""
            },
            subtitle: {
                text: ""
            },
            rangeSelector: {
                enabled: false
            },
            navigator: {
                enabled: false
            },
            scrollbar: {
                enabled: false
            },
            tooltip: {
                enabled: false
            },
            xAxis: {
                type: "datetime",
                crosshair: false,
                visible: false
            },
            yAxis: {
                crosshair: false,
                visible: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                area: ChartUtils.areaChart
            },
            exporting: {
                enabled: false
            },
            series: [{
                type: "area",
                name: "",
                data: chartData,
                id: "dataseries",
                enableMouseTracking: false
            } as SeriesChart],
        });
    }

    static convertBondPayments(data: EventChartData[]): ColumnChartData {
        const series: ColumnDataSeries[] = [];
        const categoryNames: string[] = [];
        const paymentTypes: { [key: string]: string } = {};
        // собираем категории (даты выплат) и типы платежей
        data.forEach(eventItem => {
            categoryNames.push(eventItem.date);
            // тип выплаты: купон, амортизация, погашение
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(":"));
            paymentTypes[paymentType] = paymentType;
        });

        const result: { [key: string]: ColumnDataSeries } = {};
        // раскладываем по массивам с пустыми блоками: Купон: [10, 20, 30, null], Амортизация: [null, null, null, 100]
        for (let i = 0; i < data.length; i++) {
            const eventItem = data[i];
            const paymentType = eventItem.description.substring(0, eventItem.description.indexOf(":"));
            Object.keys(paymentTypes).forEach(key => {
                result[key] = result[key] || {name: key, data: []};
                const pt = eventItem.description.substring(0, eventItem.description.indexOf(":"));
                if (key === pt) {
                    const amount = parseFloat(eventItem.description.substring(eventItem.description.indexOf(" ") + 1, eventItem.description.length));
                    // если Амортизация и она последняя, значит это Погашение
                    const repaymentKey = Operation.REPAYMENT.description;
                    result[repaymentKey] = result[repaymentKey] || {name: repaymentKey, data: []};
                    if (pt === Operation.AMORTIZATION.description && i === data.length - 1) {
                        result[repaymentKey].data.push(amount);
                        result[key].data.push(null);
                    } else {
                        result[key].data.push(amount);
                        result[repaymentKey].data.push(null);
                    }
                } else {
                    result[key].data.push(null);
                }
            });
        }
        Object.keys(result).forEach(key => {
            series.push({name: key, data: result[key].data, color: ChartUtils.OPERATION_COLORS[key], yAxis: key === Operation.COUPON.description ? 0 : 1});
        });
        return {categoryNames, series};
    }

    /**
     * Возвращает массив точек для заданного поля из объекта LineChartItem
     * @param data массив объектов
     * @param fieldName название поля
     */
    static convertToDots(data: LineChartItem[], fieldName: string): any[] {
        const result: any[] = [];
        data.forEach(value => {
            result.push([new Date(value.date).getTime(), new BigMoney((value as any)[fieldName]).amount.toDP(2, Decimal.ROUND_HALF_UP).toNumber()]);
        });
        return result;
    }

    private static getColors(dataSetsCountValue: number = 10): string[] {
        const dataSetsCount = Math.min(dataSetsCountValue, 30);
        return chroma.scale(["#F44336", "#03A9F4", "#4CAF50", "#FFEB3B", "#9C27B0"].reverse()).mode("hcl").colors(dataSetsCount);
    }
}
