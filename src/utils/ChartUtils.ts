import {Overview, SectorChartData, StockPortfolioRow} from "../types/types";
import {BigMoney} from "../types/bigMoney";
import {Decimal} from "decimal.js";

export class ChartUtils {

    private ChartUtils() {}

    static doSectorsChartData(overview: Overview): SectorChartData {
        const data: any[] = [];
        const currentTotalCost = overview.stockPortfolio.rows.map(row => new BigMoney(row.currCost).amount.abs())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        const rowsBySector: { [sectorName: string]: StockPortfolioRow[] } = {};
        overview.stockPortfolio.rows.filter(row => parseInt(row.quantity, 10) !== 0).forEach(row => {
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
            const tickers = rowsBySector[key].map(row => row.stock.ticker).join(',');
            const percentage = new Decimal(sumAmount).mul(100).dividedBy(currentTotalCost).toDP(2, Decimal.ROUND_HALF_UP).toString();
            data.push({
                name: key,
                y: sumAmount.toDP(2, Decimal.ROUND_HALF_UP).toNumber(),
                percentage,
                tickers
            })
        });
        const categoryNames = Object.keys(rowsBySector);
        return {data, categories: categoryNames};
    }
}