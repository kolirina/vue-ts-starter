/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {DividendNewsItem, ShareEvent} from "../services/eventService";
import {TABLE_HEADERS} from "../services/tablesService";
import {BigMoney} from "../types/bigMoney";
import {BondPortfolioRow, StockPortfolioRow} from "../types/types";
import {CommonUtils} from "./commonUtils";
import {DateUtils} from "./dateUtils";

export class SortUtils {

    private constructor() {
    }

    static simpleSort<T>(items: T[], index: string, isDesc: boolean): T[] {
        items.sort((a: any, b: any): number => {
            const first = (a as any)[index];
            const second = (b as any)[index];
            if (!isDesc) {
                return this.compareValues(first, second) * -1;
            } else {
                return this.compareValues(first, second);
            }
        });
        return items;
    }

    static stockSort(items: StockPortfolioRow[], index: string, isDesc: boolean): StockPortfolioRow[] {
        items.sort((a: StockPortfolioRow, b: StockPortfolioRow): number => {
            if (!CommonUtils.exists(a.stock)) {
                return 1;
            }
            if (!CommonUtils.exists(b.stock)) {
                return -1;
            }
            if (index === TABLE_HEADERS.TICKER) {
                if (!isDesc) {
                    return a.stock.ticker.localeCompare(b.stock.ticker);
                } else {
                    return b.stock.ticker.localeCompare(a.stock.ticker);
                }
            } else if (index === TABLE_HEADERS.COMPANY) {
                if (!isDesc) {
                    return a.stock.shortname.localeCompare(b.stock.shortname);
                } else {
                    return b.stock.shortname.localeCompare(a.stock.shortname);
                }
            } else {
                const first = (a as any)[index];
                const second = (b as any)[index];
                if (!isDesc) {
                    return this.compareValues(first, second) * -1;
                } else {
                    return this.compareValues(first, second);
                }
            }
        });
        return items;
    }

    static bondSort(items: BondPortfolioRow[], index: string, isDesc: boolean): BondPortfolioRow[] {
        items.sort((a: BondPortfolioRow, b: BondPortfolioRow): number => {
            if (!CommonUtils.exists(a.bond)) {
                return 1;
            }
            if (!CommonUtils.exists(b.bond)) {
                return -1;
            }
            if (index === TABLE_HEADERS.TICKER) {
                if (!isDesc) {
                    return a.bond.ticker.localeCompare(b.bond.ticker);
                } else {
                    return b.bond.ticker.localeCompare(a.bond.ticker);
                }
            } else if (index === TABLE_HEADERS.COMPANY) {
                if (!isDesc) {
                    return a.bond.shortname.localeCompare(b.bond.shortname);
                } else {
                    return b.bond.shortname.localeCompare(a.bond.shortname);
                }
            } else {
                const first = (a as any)[index];
                const second = (b as any)[index];
                if (!isDesc) {
                    return this.compareValues(first, second) * -1;
                } else {
                    return this.compareValues(first, second);
                }
            }
        });
        return items;
    }

    static customSortEvents(items: ShareEvent[], index: string, isDesc: boolean): ShareEvent[] {
        items.sort((a: ShareEvent, b: ShareEvent): number => {
            if (index === "ticker") {
                if (!isDesc) {
                    return a.share.ticker.localeCompare(b.share.ticker);
                } else {
                    return b.share.ticker.localeCompare(a.share.ticker);
                }
            } else {
                const first = (a as any)[index];
                const second = (b as any)[index];
                if (!isDesc) {
                    return this.compareValues(first, second) * -1;
                } else {
                    return this.compareValues(first, second);
                }
            }
        });
        return items;
    }

    static customSortNews(items: DividendNewsItem[], index: string, isDesc: boolean): DividendNewsItem[] {
        items.sort((a: DividendNewsItem, b: DividendNewsItem): number => {
            if (index === "ticker") {
                if (!isDesc) {
                    return a.ticker.localeCompare(b.ticker);
                } else {
                    return b.ticker.localeCompare(a.ticker);
                }
            } else {
                const first = (a as any)[index];
                const second = (b as any)[index];
                if (!isDesc) {
                    return this.compareValues(first, second) * -1;
                } else {
                    return this.compareValues(first, second);
                }
            }
        });
        return items;
    }

    static compareValues(first: any, second: any): number {
        if (!CommonUtils.exists(first) || !CommonUtils.exists(second)) {
            return !CommonUtils.exists(first) ? -1 : !CommonUtils.exists(second) ? 1 : 0;
        }
        if (!isNaN(first) && !isNaN(second)) {
            return +first - +second;
        }
        const regex = new RegExp("^(RUB|RUR|USD|EUR)");
        if (regex.test(first) && regex.test(second)) {
            try {
                return new BigMoney(first).amount.comparedTo(new BigMoney(second).amount);
            } catch (ignored) {
            }
        }
        const dateRegex = new RegExp("\\d{4}-\\d{2}-\\d{2}");
        if (dateRegex.test(first) && dateRegex.test(second)) {
            try {
                return DateUtils.parseDate(first).isAfter(DateUtils.parseDate(second)) ? 1 : -1;
            } catch (ignored) {
            }
        }
        if (typeof first === "string" && typeof second === "string") {
            return first.toUpperCase() > second.toUpperCase() ? 1 : first.toUpperCase() < second.toUpperCase() ? -1 : 0;
        }
        return first > second ? 1 : first < second ? -1 : 0;
    }
}
