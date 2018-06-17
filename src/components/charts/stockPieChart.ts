import {UI} from '../../app/UI';
import Component from 'vue-class-component';
import {DataPoint} from 'highcharts';
import {Portfolio} from '../../types/types';
import {StoreType} from '../../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {BigMoney} from '../../types/bigMoney';
import {Decimal} from 'decimal.js';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <pie-chart :data="chartData" :balloon-title="portfolio.portfolioParams.name"></pie-chart>
    `
})
export class StockPieChart extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private chartData: DataPoint[]  = [];

    private created(): void {
        this.chartData = this.stockPieChartData();
    }

    private stockPieChartData(): DataPoint[] {
        const data: DataPoint[] = [];
        this.portfolio.overview.stockPortfolio.rows.filter(value => value.currCost != '0').forEach(row => {
            console.log(row.currCost);
            data.push({name: row.stock.shortname, y: new Decimal(new BigMoney(row.currCost).amount.toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()});
        });
        return data;
    }
}
