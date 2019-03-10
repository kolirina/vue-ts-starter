import {Decimal} from "decimal.js";
import Highcharts, {ChartObject, DataPoint, Gradient, PlotLines} from "highcharts";
import Highstock from "highcharts/highstock";
import {Filters} from "../platform/filters/Filters";
import {BigMoney} from "../types/bigMoney";
import {EventChartData, HighStockEventData, HighStockEventsGroup, SectorChartData} from "../types/charts/types";
import {Overview, StockPortfolioRow} from "../types/types";

export class ChartUtils {

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

    static processEventsChartData(data: EventChartData[], flags: string = "flags", onSeries: string = "dataseries",
                                  shape: string = "circlepin", width: number = 10): HighStockEventsGroup[] {
        const eventsGroups: HighStockEventsGroup[] = [];
        const events: HighStockEventData[] = [];
        const temp = data.reduce((result: { [key: string]: HighStockEventData[] }, current: EventChartData) => {
            result[current.backgroundColor] = result[current.backgroundColor] || [];
            result[current.backgroundColor].push({x: new Date(current.date).getTime(), title: current.text, text: current.description});
            return result;
        }, {} as { [key: string]: HighStockEventData[] });
        Object.keys(temp).forEach(key => {
            eventsGroups.push({
                type: flags,
                data: temp[key],
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
            data.push({
                name: Filters.assetDesc(row.type),
                description: currCost.currencySymbol,
                y: currCost.amount.abs().toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        return data;
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

    static getChartRanges(): Highstock.RangeSelectorButton[] {
        return this.ranges;
    }

    /**
     * Отрисовывает график и возвращает объект
     * @param container контейнер где будет рисоваться график
     * @param chartData данные для графика
     * @param eventsChartData данные по событиям
     * @param ranges диапазон выбора дат
     * @param selectedRangeIndex индекс выбранного диапазона
     * @param decimals количество знаков для округления на графике
     * @param balloonTitle заголовок в тултипе
     * @param title заголовк графика
     * @param yAxisTitle заголовок для оси y
     * @param callback callback вызваемый после загрузки
     * @param portfolioAvg средняя цена бумаги в портфеле (для рисования горизонтальной линии)
     */
    static drawLineChart(container: HTMLElement, chartData: any[], eventsChartData: HighStockEventsGroup[], ranges: Highstock.RangeSelectorButton[],
                         selectedRangeIndex: number, decimals: number, balloonTitle: string, title: string = "", yAxisTitle: string = "",
                         callback: () => void = null, portfolioAvg: number = null): ChartObject {
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
                text: "Выделите участок для увеличения"
            },
            rangeSelector: {
                buttons: ranges,
                selected: selectedRangeIndex,
                inputEnabled: false
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
                area: {
                    fillColor: {
                        linearGradient: {
                            x1: 0,
                            y1: 0,
                            x2: 0,
                            y2: 1
                        },
                        stops: [
                            [0, Highcharts.getOptions().colors[0]],
                            // @ts-ignore
                            [1, (Highcharts.Color(Highcharts.getOptions().colors[0]) as Gradient).setOpacity(0).get("rgba")]
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
                }
            },

            series: [{
                type: "area",
                name: balloonTitle,
                data: chartData,
                id: "dataseries",
                // @ts-ignore
                tooltip: {
                    valueDecimals: decimals
                }
            },
                // @ts-ignore
                ...eventsChartData || []],
            exporting: {
                enabled: true
            }
        });
    }
}
