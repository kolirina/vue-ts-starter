import {UI} from '../../app/UI';
import Component from 'vue-class-component';
import Highcharts, {ChartObject} from 'highcharts';
import {Portfolio, StockPortfolioRow} from '../../types/types';
import {StoreType} from '../../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {Prop} from 'vue-property-decorator';
import {BigMoney} from '../../types/bigMoney';
import {Decimal} from 'decimal.js';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
            <v-container grid-list-md text-xs-center v-if="!chart">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-progress-circular :size="70" :width="7" indeterminate
                                             color="indigo"></v-progress-circular>
                    </v-flex>
                </v-layout>
            </v-container>

            <div v-show="chart" ref="container" style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto"></div>
        </div>
    `
})
export class SectorsChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @MainStore.Getter
    private portfolio: Portfolio;

    @Prop({default: '', type: String})
    private title: string;

    @Prop({default: '', type: String})
    private balloonTitle: string;

    private categoryNames: string[];

    private chart: ChartObject = null;

    private async mounted(): Promise<void> {
        const data: any[] = [];
        const currentTotalCost = this.portfolio.overview.stockPortfolio.rows.map(row => new BigMoney(row.currCost).amount.abs())
            .reduce((result: Decimal, current: Decimal) => result.add(current), new Decimal("0"));
        const rowsBySector: { [sectorName: string]: StockPortfolioRow[] } = {};
        this.portfolio.overview.stockPortfolio.rows.filter(row => parseInt(row.quantity, 10) !== 0).forEach(row => {
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
        this.categoryNames = Object.keys(rowsBySector);
        await this.draw(data);
    }

    private async draw(data: any[]): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                type: 'bar',
                backgroundColor: null
            },
            title: {
                text: this.title
            },
            xAxis: {
                categories: this.categoryNames,
                title: {
                    text: null
                }
            },
            yAxis: {
                min: 0,
                title: {
                    text: 'Распеределение по отраслям',
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                pointFormat: '<b>{point.y}, ({point.percentage:.2f}%)</b> <br/>{point.tickers}',
                valueSuffix: ' RUR'
            },
            plotOptions: {
                bar: {
                    dataLabels: {
                        enabled: true
                    }
                }
            },
            legend: {
                layout: 'vertical',
                align: 'right',
                verticalAlign: 'top',
                x: -40,
                y: 80,
                floating: true,
                borderWidth: 1,
                backgroundColor: '#FFFFFF',
                shadow: true
            },
            credits: {
                enabled: false
            },
            series: [{
                name: 'Сектора',
                data: data
            }]
        });
    }
}
