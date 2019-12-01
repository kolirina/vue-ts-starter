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

import {PortfolioBlockType} from "../services/onBoardingTourService";
import {Overview} from "../types/types";

export class PortfolioUtils {

    private constructor() {
    }

    static getShowedBlocks(overview: Overview): { [key: string]: number } {
        const result: { [key: string]: number } = {};
        let count = 0;
        // сделки есть, отображается дашборд и таблица активов
        if (overview.totalTradesCount > 0) {
            result[PortfolioBlockType.DASHBOARD] = count++;
            result[PortfolioBlockType.AGGREGATE_TABLE] = count++;
        }
        // есть акции или облигации, отображаем график
        if (overview.bondPortfolio.rows.length !== 0 || overview.stockPortfolio.rows.length !== 0) {
            // есть акции, отображаем таблицу
            if (overview.stockPortfolio.rows.length > 0) {
                result[PortfolioBlockType.STOCK_TABLE] = count++;
            }
            // есть облигации, отображаем таблицу
            if (overview.bondPortfolio.rows.length > 0) {
                result[PortfolioBlockType.BOND_TABLE] = count++;
            }
            // если акции или облигации, отображаем график
            result[PortfolioBlockType.HISTORY_CHART] = count++;
        }
        // сделки есть, отображается диаграмма активов
        if (overview.totalTradesCount > 0) {
            result[PortfolioBlockType.ASSETS_CHART] = count++;
        }
        // есть акции, не проданные в ноль, отображаем диаграмму круговую и сектора
        if (overview.stockPortfolio.rows.some(row => Number(row.quantity) !== 0)) {
            result[PortfolioBlockType.STOCK_CHART] = count++;
        }
        // есть акции, не проданные в ноль, отображаем диаграмму круговую
        if (overview.bondPortfolio.rows.some(row => Number(row.quantity) !== 0)) {
            result[PortfolioBlockType.BOND_CHART] = count++;
        }
        // есть акции, не проданные в ноль, отображаем диаграмму круговую и сектора
        if (overview.stockPortfolio.rows.some(row => Number(row.quantity) !== 0)) {
            result[PortfolioBlockType.SECTORS_CHART] = count++;
        }
        // если ни одного блока не добавлено, значит портфель пустой
        if (count === 0) {
            result[PortfolioBlockType.EMPTY] = count++;
        }
        return result;
    }

    static isBlockShowed(overview: Overview, type: PortfolioBlockType): boolean {
        switch (type) {
            case PortfolioBlockType.HISTORY_CHART:
                return overview.bondPortfolio.rows.length !== 0 || overview.stockPortfolio.rows.length !== 0;
            case PortfolioBlockType.BOND_TABLE:
                return overview.bondPortfolio.rows.length > 0;
            case PortfolioBlockType.STOCK_TABLE:
                return overview.stockPortfolio.rows.length > 0;
            case PortfolioBlockType.STOCK_CHART:
            case PortfolioBlockType.SECTORS_CHART:
                return overview.stockPortfolio.rows.some(row => Number(row.quantity) !== 0);
            case PortfolioBlockType.BOND_CHART:
                return overview.bondPortfolio.rows.some(row => Number(row.quantity) !== 0);
            case PortfolioBlockType.AGGREGATE_TABLE:
            case PortfolioBlockType.DASHBOARD:
            case PortfolioBlockType.ASSETS_CHART:
                return overview.totalTradesCount > 0;
            case PortfolioBlockType.EMPTY:
                return overview.totalTradesCount === 0;
            default:
                true;
        }
        return true;
    }
}
