import * as chroma from "chroma-js";
import dayjs from "dayjs";
import {Decimal} from "decimal.js";
import Highcharts, {AreaChart, ChartObject, DataPoint, Gradient, IndividualSeriesOptions, PlotLines, SeriesChart} from "highcharts";
import Highstock from "highcharts/highstock";
import {Filters} from "../platform/filters/Filters";
import {ShareEvent} from "../services/eventService";
import {BigMoney} from "../types/bigMoney";
import {
    AnalyticsChartPoint,
    BasePriceDot,
    ColumnChartData,
    ColumnDataSeries,
    CustomDataPoint,
    EventChartData,
    HighStockEventData,
    HighStockEventsGroup,
    LineChartItem,
    LineChartSeries,
    PieChartTooltipFormat,
    SectorChartData,
    SimpleChartData
} from "../types/charts/types";
import {Operation} from "../types/operation";
import {PortfolioAssetType} from "../types/portfolioAssetType";
import {PortfolioTag, Tag, TagCategory} from "../types/tags";
import {BondPortfolioRow, Overview, Share, StockTypePortfolioRow} from "../types/types";
import {CommonUtils} from "./commonUtils";
import {DateFormat, DateUtils} from "./dateUtils";

export class ChartUtils {

    /** Типы форматов для тултипа */
    static PIE_CHART_TOOLTIP_FORMAT = {
        COMMON: "<b>{point.y}, ({point.percentage:.2f} %)</b> <br/>{point.tickers}",
        ASSETS: "<b>{point.y:.2f} % ({point.description})</b>",
        YIELDS: "<b>Прибыль: {point.profit} {point.currencySymbol} ({point.description})</b>",
        // todo profit расскоментировать проценты прибыли
        // PROFIT: "<b>{point.period}</b>: {point.profit} {point.currencySymbol} <b>({point.description})</b>"
        PROFIT: "<b>{point.period}</b>: {point.profit} {point.currencySymbol}",
        EVENTS: "<b>{point.name}</b>: {point.y}<br/>{point.description}<br/><b>Всего</b>: {point.totalAmount}",
        TAGS: "<br/>{point.description}<br/>Прибыль: {point.profit} {point.currencySymbol}<br/><b>Бумаги:</b><br/>{point.tickers}"
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

    private static readonly POSITIVE_COLOR = "#6cc11a";
    private static readonly NEGATIVE_COLOR = "#ff3e70";

    private constructor() {
    }

    static doSectorsChartData(overview: Overview): SectorChartData {
        const data: any[] = [];
        const currentTotalCost = overview.stockPortfolio.rows.map(row => new BigMoney(row.currCost).amount.abs())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        const rowsBySector: { [sectorName: string]: StockTypePortfolioRow[] } = {};
        overview.stockPortfolio.rows.filter(row => Number(row.quantity) !== 0).forEach(row => {
            const sector = row.share.sector;
            const sectorName = sector.root ? sector.name : sector.parent.name;
            if (rowsBySector[sectorName] === undefined) {
                rowsBySector[sectorName] = [];
            }
            rowsBySector[sectorName].push(row);
        });
        Object.keys(rowsBySector).forEach(key => {
            const sumAmount = rowsBySector[key].map(row => new BigMoney(row.currCost).amount.abs())
                .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
            const tickers = rowsBySector[key].map(row => row.share.ticker).join(", ");
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

    static doBondSectorsChartData(overview: Overview): SectorChartData {
        const data: any[] = [];
        const currentTotalCost = overview.bondPortfolio.rows.map(row => new BigMoney(row.currCost).amount.abs())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        const rowsByType: { [sectorName: string]: BondPortfolioRow[] } = {};
        overview.bondPortfolio.rows.filter(row => Number(row.quantity) !== 0 && !!row.bond.typeName).forEach(row => {
            const sectorName = row.bond.typeName;
            if (rowsByType[sectorName] === undefined) {
                rowsByType[sectorName] = [];
            }
            rowsByType[sectorName].push(row);
        });
        Object.keys(rowsByType).forEach(key => {
            const sumAmount = rowsByType[key].map(row => new BigMoney(row.currCost).amount.abs())
                .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
            const shortNames = rowsByType[key].map(row => row.bond.shortname).join(", ");
            const percentage = new Decimal(sumAmount).mul(100).dividedBy(currentTotalCost).toDP(2, Decimal.ROUND_HALF_UP).toString();
            data.push({
                name: key,
                y: sumAmount.toDP(2, Decimal.ROUND_HALF_UP).toNumber(),
                percentage,
                tickers: shortNames
            });
        });
        const categoryNames = Object.keys(rowsByType);
        return {data, categories: categoryNames};
    }

    static doPortfolioProfitData(points: { [key: string]: LineChartItem }, monthly: boolean = true): ColumnChartData {
        const positive: CustomDataPoint[] = [];
        const negative: CustomDataPoint[] = [];
        const categoryNames: string[] = [];
        const sorted: Array<{ date?: dayjs.Dayjs, value: LineChartItem }> = Object.keys(points).map(key => {
            return {date: DateUtils.parseDate(key), value: points[key]};
        }).sort((a, b) => a.date.isAfter(b.date) ? 1 : a.date.isSame(b.date) ? 0 : -1);
        // для вывода от меньшего к большему
        sorted.filter((item: { date?: dayjs.Dayjs, value: LineChartItem }) => !new BigMoney(item.value.totalPeriodProfit).amount.isZero())
            .forEach((item: { date?: dayjs.Dayjs, value: LineChartItem }) => {
                const periodName = item.date.format(monthly ? "MMMM" : "YYYY");
                const label = `${periodName}${monthly ? " " + item.date.year() : ""}`;
                categoryNames.push(label);
                const profit = new BigMoney(item.value.totalPeriodProfit);
                const percent = new Decimal(item.value.totalPeriodPercentProfit);
                const point: CustomDataPoint = {
                    name: label,
                    y: profit.amount.toDP(2, Decimal.ROUND_HALF_UP).toNumber(),
                    profit: Filters.formatNumber(profit.amount.toDP(2, Decimal.ROUND_HALF_UP).toString()),
                    currencySymbol: profit.currencySymbol,
                    period: label,
                    description: `${Filters.formatNumber(percent.toString())} %`
                };
                (profit.amount.isPositive() ? positive : negative).push(point);
                (profit.amount.isPositive() ? negative : positive).push(null);
            });
        return {
            series: [
                {name: "Прибыль", data: positive, color: "#1f83c8"},
                {name: "Убыток", data: negative, color: this.NEGATIVE_COLOR}
            ], categoryNames: categoryNames
        };
    }

    static doFutureEventsChartData(futureEvents: ShareEvent[]): ColumnChartData {
        const pointsByType: { [key: string]: CustomDataPoint[] } = {};
        const reduced: { [key: string]: ShareEvent[] } = {};
        // группируем события в разбивке по периоду (Месяц Год)
        futureEvents
            .map(event => {
                return {date: DateUtils.parseDate(event.date), event: event};
            })
            .sort((a, b) => a.date.isAfter(b.date) ? 1 : a.date.isSame(b.date) ? 0 : -1)
            .forEach((item: { date?: dayjs.Dayjs, event: ShareEvent }) => {
                const event = item.event;
                const label = DateUtils.formatDate(DateUtils.parseDate(event.date), "MMMM YYYY");
                const shareEvents = reduced[label] || [];
                shareEvents.push(event);
                reduced[label] = shareEvents;
            });
        // по каждому периоду:
        // группируем события по типу: Дивиденд, Купон, Амортизация, Погашение
        // внутри группы события дополинтельно группируем по тикери, так как для составного портфеля они могли быть зачислены разными датами
        // добавляем точку в каждый набор данных для графика чтобы корректно работал режим stacked
        Object.keys(reduced).forEach(period => {
            const shareEvents = reduced[period];
            const eventsByType: { [key: string]: ShareEvent[] } = {};
            shareEvents.forEach(event => {
                const byType = eventsByType[event.type] || [];
                byType.push(event);
                eventsByType[event.type] = byType;
            });
            const totalAmountInPeriod = shareEvents.map(event => new BigMoney(event.totalAmount).amount)
                .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
            const grouped: { [key: string]: CustomDataPoint } = {};
            Object.keys(eventsByType).forEach(eventType => {
                const events = eventsByType[eventType];
                const totalAmountByType = events.map(event => new BigMoney(event.totalAmount).amount)
                    .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
                const currencySymbol = new BigMoney(shareEvents[0].totalAmount).currencySymbol;
                const operation = Operation.valueByName(eventType);

                const reducesByTicker: { [key: string]: ShareEvent[] } = {};
                events.forEach(event => {
                    const key = `${event.share.ticker}${event.share.currency}`;
                    const byTicker = reducesByTicker[key] || [];
                    byTicker.push(event);
                    reducesByTicker[key] = byTicker;
                });
                const comment = Object.keys(reducesByTicker).map(key => {
                    const eventsByTicker = reducesByTicker[key];
                    const shortname = eventsByTicker[0]?.share.shortname;
                    const date = eventsByTicker[0]?.date;
                    const currencySymbolByTicker = Filters.currencySymbolByCurrency(eventsByTicker[0]?.share.currency);
                    const amountByTicker = eventsByTicker.map(event => new BigMoney(event.totalAmount).amount)
                        .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
                    const amountOriginalByTicker = eventsByTicker.map(event => new BigMoney(event.totalAmountOriginal).amount)
                        .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
                    const formattedAmount = Filters.formatNumber(amountByTicker.toDP(2, Decimal.ROUND_HALF_UP).toString());
                    const formattedAmountOriginal = Filters.formatNumber(amountOriginalByTicker.toDP(2, Decimal.ROUND_HALF_UP).toString());
                    const fromNews = eventsByTicker.some(event => event.comment === "На основе новостей");
                    const dateString = DateUtils.formatDate(DateUtils.parseDate(date)) + (fromNews ? " Новости" : "");
                    const showOriginalAmount = currencySymbolByTicker !== currencySymbol;
                    return `<b>${shortname}</b>: ${formattedAmount} ${currencySymbol}${showOriginalAmount ?
                        " (" + formattedAmountOriginal + " " + currencySymbolByTicker + "), " : ""} (~${dateString})`;
                }).join(",<br/>");

                grouped[eventType] = {
                    name: operation.description,
                    y: totalAmountByType.toDP(2, Decimal.ROUND_HALF_UP).toNumber(),
                    currencySymbol: currencySymbol,
                    period: period,
                    description: comment,
                    totalAmount: `${Filters.formatNumber(totalAmountInPeriod.toDP(2, Decimal.ROUND_HALF_UP).toString())} ${currencySymbol}`
                };
            });
            [Operation.DIVIDEND, Operation.COUPON, Operation.AMORTIZATION, Operation.REPAYMENT].forEach(eventType => {
                const points = pointsByType[eventType.code] || [];
                points.push(grouped[eventType.enumName] || {name: eventType.description, y: 0});
                pointsByType[eventType.code] = points;
            });
        });
        const series: ColumnDataSeries[] = [];
        [Operation.DIVIDEND, Operation.COUPON, Operation.AMORTIZATION, Operation.REPAYMENT].forEach(eventType => {
            series.push({name: eventType.description, data: pointsByType[eventType.code], color: this.OPERATION_COLORS[eventType.description]});
        });
        return {
            series: series, categoryNames: Object.keys(reduced)
        };
    }

    static processEventsChartData(data: EventChartData[], withMoneyTrades: boolean, flags: string = "flags", onSeries: string = "totalChart", shape: string = "circlepin",
                                  width: number = 10, color: string = "rgba(5,0,217,0.4)"): HighStockEventsGroup[] {
        const eventsGroups: HighStockEventsGroup[] = [];
        const eventsByCount: { [key: string]: HighStockEventData[] } = {};
        let mapped = data.filter(item => withMoneyTrades || item.text !== "M" && item.date).map(item => {
            const parsedDate = DateUtils.parseDate(item.date);
            const date = Date.UTC(parsedDate.year(), parsedDate.month(), parsedDate.date());
            return {x: date, title: item.text, text: item.description, color: item.backgroundColor};
        });
        const now = new Date().getTime();
        // это нужно для того чтобы будущие события не ломали график стоимости
        mapped = mapped.filter(item => item.x <= now);
        const grouped = ChartUtils.groupEvents(mapped);
        eventsGroups.push({
            type: flags,
            data: grouped,
            name: "events",
            onSeries: onSeries,
            stackDistance: 20,
            shape: shape,
            color: "rgba(5,0,217,0.4)",
            fillColor: color,
            width: width
        });
        return eventsGroups;
    }

    static groupEvents(events: HighStockEventData[]): HighStockEventData[] {
        const temp = events.reduce((result: { [key: string]: HighStockEventData[] }, current: HighStockEventData) => {
            const date = DateUtils.formatDate(dayjs(current.x), DateFormat.DATE2);
            result[date] = result[date] || [];
            result[date].push(current);
            return result;
        }, {} as { [key: string]: HighStockEventData[] });
        const eventsGrouped: HighStockEventData[] = [];

        Object.keys(temp).forEach(key => {
            const points = temp[key];
            const mainPoint = points.shift();
            // надо прибавлять единицу, так как выше один элемент уже убрали
            mainPoint.title = points.length > 0 ? String(points.length + 1) : mainPoint.title;
            mainPoint.initialPoints = points;
            eventsGrouped.push(mainPoint);
        });
        return eventsGrouped;
    }

    static doStockTypePieChartData(rows: StockTypePortfolioRow[]): DataPoint[] {
        const data: DataPoint[] = [];
        rows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            data.push({
                name: row.share.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        data.sort((a, b) => b.y - a.y);
        return data;
    }

    /**
     * Возвращает набор для графика эффективности бумаг в портфеле
     * @param overview данные по портфелю
     * @param currencySymbol символ валюты
     */
    static doYieldContributorsPieChartData(overview: Overview, currencySymbol: string): ColumnChartData {
        const rows: Array<{ shareName: string, yearYield: string, profit: string }> = [
            ...overview.stockPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, yearYield: row.yearYield, profit: row.profit};
            }),
            ...overview.etfPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, yearYield: row.yearYield, profit: row.profit};
            }),
            ...overview.bondPortfolio.rows.map(row => {
                return {shareName: row.bond.shortname, yearYield: row.yearYield, profit: row.profit};
            }),
            ...overview.assetPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, yearYield: row.yearYield, profit: row.profit};
            })
        ];
        const categoryNames: string[] = [];
        const positive: CustomDataPoint[] = [];
        const negative: CustomDataPoint[] = [];

        rows.sort((a, b): number => new BigMoney(b.profit).amount.minus(new BigMoney(a.profit).amount).toNumber())
            .filter(row => !new BigMoney(row.profit).amount.isZero())
            .forEach(row => {
                const yieldValue = Filters.formatNumber(row.yearYield);
                const profit = new BigMoney(row.profit).amount.toDP(2, Decimal.ROUND_HALF_UP);
                const point = {
                    name: row.shareName,
                    description: `Доходность ${yieldValue} %`,
                    profit: Filters.formatNumber(profit.toString()),
                    currencySymbol: currencySymbol,
                    y: profit.toNumber()
                };
                (profit.isPositive() ? positive : negative).push(point);
                (profit.isPositive() ? negative : positive).push(null);
                categoryNames.push(row.shareName);
            });
        return {
            categoryNames, series: [
                {name: "Прибыль", data: positive, color: this.POSITIVE_COLOR},
                {name: "Убыток", data: negative, color: this.NEGATIVE_COLOR}
            ]
        };
    }

    /**
     * Возвращает набор для графика по тэгам
     * @param overview данные по портфелю
     * @param currencySymbol символ валюты
     * @param portfolioTags символ валюты
     * @param selectedCategory символ валюты
     */
    static doTagsChartData(overview: Overview, currencySymbol: string, portfolioTags: { [key: string]: PortfolioTag[] },
                           selectedCategory: TagCategory, tagCategories: TagCategory[]): CustomDataPoint[] {
        const data: CustomDataPoint[] = [];
        const rows: Array<{ share: Share, currCost: string, profit: string, currency: string }> = [
            ...overview.stockPortfolio.rows.map(row => {
                return {share: row.share, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.etfPortfolio.rows.map(row => {
                return {share: row.share, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.bondPortfolio.rows.map(row => {
                return {share: row.bond, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.assetPortfolio.rows.map(row => {
                return {share: row.share, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            })
        ].filter(row => {
            const shareKey = `${row.share.shareType}:${row.share.id}`;
            const shareTags = portfolioTags[shareKey];
            return shareTags.some(category => category.categoryId === selectedCategory.id);
        });
        const rowsByTag: { [key: string]: [{ share: Share, currCost: string, profit: string, currency: string }] } = {};
        const tagsByCategoryIdAndByTagId: { [key: number]: { [key: number]: Tag } } = {};
        tagCategories.forEach(tagCategory => {
            const tagsById: { [key: number]: Tag } = {};
            tagCategory.tags.forEach(tag => tagsById[tag.id] = tag);
            tagsByCategoryIdAndByTagId[tagCategory.id] = tagsById;
        });
        rows.filter(value => value.currCost && !new BigMoney(value.currCost).amount.isZero()).forEach(row => {
            const shareKey = `${row.share.shareType}:${row.share.id}`;
            const shareTag = portfolioTags[shareKey].filter(portfolioTag => portfolioTag.categoryId === selectedCategory.id)[0];
            const tagName = ChartUtils.getTagName(tagsByCategoryIdAndByTagId, shareTag);
            // @ts-ignore
            const byTag: [{ share: Share, currCost: string, profit: string, currency: string }] = rowsByTag[tagName] || [];
            byTag.push(row);
            rowsByTag[tagName] = byTag;
        });
        Object.keys(rowsByTag).forEach(tagName => {
            const currentRows = rowsByTag[tagName];
            const currCost = currentRows.map(row => new BigMoney(row.currCost).amount.abs())
                .reduce((previousValue, currentValue) => previousValue.plus(currentValue), new Decimal("0"))
                .toDP(2, Decimal.ROUND_HALF_UP);
            const profit = currentRows.map(row => new BigMoney(row.profit).amount.abs())
                .reduce((previousValue, currentValue) => previousValue.plus(currentValue), new Decimal("0"))
                .toDP(2, Decimal.ROUND_HALF_UP);
            const tickers = currentRows.map(row => row.share.shortname).join(",<br/>");
            data.push({
                name: `<b>${tagName}</b>`,
                tickers,
                description: `Стоимость: ${Filters.formatNumber(currCost.toString())} ${currencySymbol}`,
                profit: Filters.formatNumber(profit.toString()),
                currencySymbol: currencySymbol,
                y: currCost.toNumber(),
            });
        });
        data.sort((a, b) => b.y - a.y);
        return data;
    }

    static getTagName(tagsByCategoryIdAndByTagId: { [key: number]: { [key: number]: Tag } }, shareTag: PortfolioTag): string {
        const tagsById = tagsByCategoryIdAndByTagId[shareTag.categoryId];
        if (tagsById) {
            return tagsById[shareTag.tagId]?.name;
        }
        return null;
    }

    /**
     * Возвращает набор для графика эффективности бумаг в портфеле
     * @param overview данные по портфелю
     * @param currencySymbol символ валюты
     */
    static doWholePortfolioSharesAllocationChartData(overview: Overview, currencySymbol: string): CustomDataPoint[] {
        const data: CustomDataPoint[] = [];
        const skippedTypes = [PortfolioAssetType.STOCK, PortfolioAssetType.BOND, PortfolioAssetType.ETF, PortfolioAssetType.OTHER];
        const rows: Array<{ shareName: string, percentShare: string, currCost: string, profit: string, currency: string }> = [
            ...overview.stockPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, percentShare: row.percCurrShareInWholePortfolio, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.etfPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, percentShare: row.percCurrShareInWholePortfolio, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.bondPortfolio.rows.map(row => {
                return {shareName: row.bond.shortname, percentShare: row.percCurrShareInWholePortfolio, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.assetPortfolio.rows.map(row => {
                return {shareName: row.share.shortname, percentShare: row.percCurrShareInWholePortfolio, currCost: row.currCost, profit: row.profit, currency: currencySymbol};
            }),
            ...overview.assetRows.filter(row => !skippedTypes.includes(PortfolioAssetType.valueByName(row.type))).map(row => {
                return {
                    shareName: PortfolioAssetType.valueByName(row.type)?.description, percentShare: row.percCurrShareInWholePortfolio,
                    currency: new BigMoney(row.currCost).currencySymbol,
                    currCost: row.currCost, profit: row.profit
                };
            })
        ];
        rows.filter(value => value.percentShare && !new Decimal(value.percentShare).isZero()).forEach(row => {
            const percentShare = new Decimal(row.percentShare).abs().toDP(2, Decimal.ROUND_HALF_UP);
            const currCost = new BigMoney(row.currCost).amount.abs().toDP(2, Decimal.ROUND_HALF_UP);
            const profit = row.profit ? new BigMoney(row.profit).amount.toDP(2, Decimal.ROUND_HALF_UP) : new Decimal("0");
            data.push({
                name: row.shareName,
                description: `Стоимость ${Filters.formatNumber(currCost.toString())} ${row.currency}, доля: ${percentShare.toNumber()} %`,
                profit: Filters.formatNumber(profit.toString()),
                currencySymbol: currencySymbol,
                y: percentShare.toNumber()
            });
        });
        data.sort((a, b) => b.y - a.y);
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
        data.sort((a, b) => b.y - a.y);
        return data;
    }

    static doAssetsPieChartData(overview: Overview): DataPoint[] {
        const data: DataPoint[] = [];
        overview.assetPortfolio.rows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            data.push({
                name: row.share.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.abs().toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        data.sort((a, b) => b.y - a.y);
        return data;
    }

    static doAggregatePieChartData(overview: Overview): DataPoint[] {
        const data: DataPoint[] = [];
        overview.assetRows.filter(value => new BigMoney(value.currCost).amount.toString() !== "0").forEach(row => {
            const currCost = new BigMoney(row.currCost);
            const currCostAmount = Filters.formatNumber(currCost.amount.abs().toDP(2, Decimal.ROUND_HALF_UP).toString());
            data.push({
                name: Filters.assetDesc(row.type),
                description: `${currCostAmount} ${currCost.currencySymbol}`,
                y: Number(row.percCurrShare)
            });
        });
        data.sort((a, b) => b.y - a.y);
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
        lineWidth: 2,
        states: {
            hover: {
                lineWidth: 1
            }
        },
        threshold: null
    };

    static makeSimpleChartData(data: AnalyticsChartPoint[]): SimpleChartData {
        const result: SimpleChartData = {
            categoryNames: [],
            values: []
        };
        const sorted: Array<{ date?: dayjs.Dayjs, value?: string }> = data.map(item => {
            return {date: DateUtils.parseDate(item.date), value: item.value};
        }).sort((a, b) => a.date.isAfter(b.date) ? 1 : a.date.isSame(b.date) ? 0 : -1);
        // для вывода от меньшего к большему
        sorted.forEach((item: { date?: dayjs.Dayjs, value?: string }) => {
            const month = item.date.format("MMMM");
            result.categoryNames.push(month);
            result.values.push(
                {
                    name: `${month} ${item.date.year()}`,
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
        if (!container) {
            return null;
        }
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
                inputEnabled: true,
                inputDateFormat: "%Y-%m-%d"
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
                    const point = this.point as HighStockEventData;
                    if (point && point.initialPoints) {
                        if (point.initialPoints.length > 0) {
                            let text = `<b>${Highcharts.dateFormat("%b %d, %Y", point.initialPoints[0].x)}</b>
<span> - </span><b>${Highcharts.dateFormat("%b %d, %Y", point.initialPoints[point.initialPoints.length - 1].x)}</b><br/>`;

                            text += "<span style=\"font-size: 11px\">";
                            text += `<p style=\"width: 400px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;\">- ${point.text}</p><br/>`;
                            for (let i = 0; i < point.initialPoints.length; i++) {
                                text += `<p style=\"width: 400px;white-space: nowrap;overflow: hidden;text-overflow: ellipsis;\">- ${point.initialPoints[i].text}</p><br/>`;
                                // добавляем только четыре, так как основная точка тоже учтена
                                if (i === 4) {
                                    const remainCount = point.initialPoints.length - 5;
                                    if (remainCount) {
                                        text += `<p>Еще ${remainCount} ${Filters.declension(remainCount, "событие", "события", "событий")} в этот день</p>`;
                                    }
                                    break;
                                }
                            }
                            return text + "</span>";
                        } else {
                            return `<b>${Highcharts.dateFormat("%b %d, %Y", point.x)}</b><br/><span>${point.text}</span>`;
                        }
                        // @ts-ignore
                    } else if (this.points) {
                        // The first returned item is the header, subsequent items are the points
                        // @ts-ignore
                        return ["<b>" + DateUtils.formatDate(dayjs(this.x)) + "</b>"].concat(
                            // @ts-ignore
                            this.points.map((pointGroup): string => {
                                const rounded = Filters.formatNumber(new Decimal(pointGroup.y).toDP(decimals).toString());
                                return compare ? `<span style=\"color:${pointGroup.series.color}\">${pointGroup.series.name}</span>: <b>${rounded}</b>
(${Math.round(pointGroup.point.change * 100) / 100}%)<br/>` :
                                    `<span style=\"color:${pointGroup.series.color}\">${pointGroup.series.name}</span>: <b>${rounded}</b><br/>`;
                            })
                        );
                    } else if (point) {
                        return point.text;
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
                ...eventsChartData || []
            ],
        });
    }

    static drawSimpleLineChart(container: HTMLElement, data: SimpleChartData, tooltip: string): ChartObject {
        if (!container) {
            return null;
        }
        return Highcharts.chart(container, {
            chart: {
                backgroundColor: "#F7F9FB",
                type: "spline"
            },
            title: {
                text: ""
            },
            yAxis: {
                title: {
                    text: ""
                },
                labels: {
                    style: {
                        fontSize: "13px",
                        color: "#040427"
                    }
                }
            },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: data.categoryNames,
                labels: {
                    style: {
                        fontSize: "13px",
                        color: "#040427"
                    }
                },
                gridLineWidth: 1
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                headerFormat: "",
                pointFormat: `<span>${tooltip} {point.name} </span>: <b>{point.y:.2f}%</b> `
            },
            plotOptions: {
                series: {
                    color: "#FF3E70"
                }
            },
            series: [
                {
                    data: data.values
                },
            ]
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
        if (!container) {
            return null;
        }
        const isMobile = CommonUtils.isMobile();
        return Highcharts.chart(container, {
            chart: {
                type: "pie",
                backgroundColor: null,
                style: {
                    fontFamily: "\"OpenSans\" sans-serif",
                    fontSize: "12px",
                }
            },
            title: {
                text: title
            },
            legend: {
                maxHeight: 100,
                itemMarginTop: 2
            },
            tooltip: {
                pointFormat: this.PIE_CHART_TOOLTIP_FORMAT[tooltipFormat],
                valueSuffix: `${viewCurrency ? ` ${Filters.currencySymbolByCurrency(viewCurrency)}` : ""}`
            },
            colors: ChartUtils.getColors(chartData.length),
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: chartData.length < 30 && !isMobile,
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
        if (!container) {
            return null;
        }
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

    /**
     * Отрисовывает график и возвращает объект
     * @param container контейнер где будет рисоваться график
     * @param chartData данные для графика
     * @param title заголовк графика
     * @param viewCurrency валюта
     * @param tooltipFormat формат тултипа
     */
    static drawBarChart(container: HTMLElement, chartData: ColumnChartData, title: string = "", viewCurrency: string = "",
                        tooltipFormat: PieChartTooltipFormat = PieChartTooltipFormat.COMMON): ChartObject {
        if (!container) {
            return null;
        }
        return Highcharts.chart(container, {
            chart: {
                type: "bar",
                backgroundColor: null,
                style: {
                    fontFamily: "\"OpenSans\" sans-serif",
                    fontSize: "12px",
                },
                events: {
                    load: function(): void {
                        // @ts-ignore
                        const chart: ChartObject = this;
                        const ex = chart.yAxis[0].getExtremes();

                        // Sets the min and max values for the chart
                        let minVal = 0;
                        let maxVal = 0;
                        let setVal = 0;

                        // If the min value of the chart is negative make it positive
                        if (ex.min < 0) {
                            minVal = ex.min * -1;
                        } else {
                            minVal = ex.min;
                        }
                        // If the max value of the chart is negative make it positive
                        if (ex.max < 0) {
                            maxVal = ex.max * -1;
                        } else {
                            maxVal = ex.max;
                        }
                        // Find the biggest value and set that as the one to use
                        if (maxVal > minVal) {
                            setVal = maxVal;
                        } else {
                            setVal = minVal;
                        }
                        // If the value is 0 then set it to ticInterval (6 or 30) as minimum
                        if (setVal === 0) {
                            setVal = 15;
                        }

                        // set the min and max and return the values
                        chart.yAxis[0].setExtremes(-setVal, setVal, true, false);
                    },
                    redraw: function(): void {
                        // @ts-ignore
                        const chart: ChartObject = this;
                        chart.series.filter(series => series.type === "bar" && series.visible).forEach(series => {
                            // @ts-ignore
                            series.points.forEach(point => {
                                const dataLabel = point.dataLabel;
                                const offset = point.shapeArgs.height + (point.y > 0 ? dataLabel.width : 0);

                                dataLabel?.attr({
                                    // @ts-ignore
                                    x: chart.plotWidth - point.plotY - Math.sign(point.y) * offset,
                                });
                            });
                        });
                    }
                }
            },
            title: {
                text: title
            },
            legend: {
                maxHeight: 100,
                itemMarginTop: 2
            },
            tooltip: {
                headerFormat: "",
                pointFormat: this.PIE_CHART_TOOLTIP_FORMAT[tooltipFormat],
                valueSuffix: `${viewCurrency ? ` ${Filters.currencySymbolByCurrency(viewCurrency)}` : ""}`
            },
            plotOptions: {
                column: {
                    grouping: false,
                },
                series: {
                    // подписи над стоблцами
                    dataLabels: {
                        enabled: true,
                        format: "{point.name}"
                    }
                }
            },
            xAxis: {
                visible: false,
                categories: chartData.categoryNames,
                crosshair: true,
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: "12px",
                        color: "#040427"
                    }
                },
            },
            yAxis: [{
                title: {
                    text: title
                },
                labels: {
                    style: {
                        fontSize: "12px",
                        color: "#040427"
                    }
                }
            }],
            exporting: {
                enabled: false
            },
            series: chartData.series
        });
    }

    /**
     * Отрисовывает график и возвращает объект
     * @param container контейнер где будет рисоваться график
     * @param chartData данные для графика
     * @param title заголовк графика
     * @param viewCurrency валюта
     * @param tooltipFormat формат тултипа
     */
    static drawColumnChart(container: HTMLElement, chartData: ColumnChartData, title: string = "", viewCurrency: string = "",
                           tooltipFormat: PieChartTooltipFormat = PieChartTooltipFormat.COMMON): ChartObject {
        if (!container) {
            return null;
        }
        return Highcharts.chart(container, {
            chart: {
                type: "column",
                backgroundColor: null,
                style: {
                    fontFamily: "\"OpenSans\" sans-serif",
                    fontSize: "12px",
                }
            },
            title: {
                text: title
            },
            plotOptions: {
                column: {
                    grouping: false,
                    stacking: "normals",
                },
            },
            xAxis: {
                categories: chartData.categoryNames,
                crosshair: true,
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: "12px",
                        color: "#040427"
                    }
                },
                stackLabels: {
                    enabled: true,
                }
            },
            yAxis: {
                title: {
                    text: ""
                },
                labels: {
                    style: {
                        fontSize: "12px",
                        color: "#040427"
                    }
                }
            },
            legend: {
                maxHeight: 100,
                itemMarginTop: 2
            },
            tooltip: {
                headerFormat: "",
                pointFormat: this.PIE_CHART_TOOLTIP_FORMAT[tooltipFormat],
                valueSuffix: `${viewCurrency ? ` ${Filters.currencySymbolByCurrency(viewCurrency)}` : ""}`
            },
            exporting: {
                enabled: false
            },
            series: chartData.series
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
                    result[key].data.push({y: amount});
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
        return ChartUtils.convertToDotsWithStartPoint(data, fieldName, true);
    }

    static convertToDotsWithStartPoint(data: LineChartItem[], fieldName: string, addStartZeroPoint: boolean = true): any[] {
        const result: any[] = [];
        data
            .filter(value => !!(value as any)[fieldName])
            .forEach(value => {
                const parsedDate = DateUtils.parseDate(value.date);
                const date = Date.UTC(parsedDate.year(), parsedDate.month(), parsedDate.date());
                const amount = new BigMoney((value as any)[fieldName]).amount.toDP(2, Decimal.ROUND_HALF_UP).toNumber();
                if (result.length === 0 && addStartZeroPoint) {
                    result.push([date - 1, 0]);
                }
                result.push([date, amount]);
            });
        return result;
    }

    static initPieChartAnimation(): void {
        // @ts-ignore
        // tslint:disable-next-line:typedef
        Highcharts.seriesTypes.pie.prototype.animate = function(init) {
            const series = this;
            const points = series.points;

            if (!init) {
                // @ts-ignore
                // tslint:disable-next-line:typedef
                Highcharts.each(points, function(point, index) {
                    const graphic = point.graphic;
                    const args = point.shapeArgs;

                    if (graphic) {
                        graphic.attr({
                            // r: 0,
                            start: 0,
                            end: 0
                        });

                        // tslint:disable-next-line:typedef
                        setTimeout(function() {
                            graphic.animate({
                                // r: args.r,
                                start: args.start,
                                end: args.end
                            }, series.options?.animation);
                        }, 100);
                    }
                });
                this.animate = null;
            }
        };
    }

    private static getColors(dataSetsCountValue: number = 10): string[] {
        const dataSetsCount = Math.min(dataSetsCountValue, 30);
        return chroma.scale(["#F44336", "#03A9F4", "#4CAF50", "#FFEB3B", "#9C27B0"].reverse()).mode("hcl").colors(dataSetsCount);
    }

    private static getRandomColor(colors: string[]): string {
        const min = 0;
        const max = 10;
        return colors[Math.floor(min + Math.random() * (max + 1 - min))];
    }
}
