import {UI} from '../../app/UI';
import Component from 'vue-class-component';
import Highcharts, {ChartObject, DataPoint} from 'highcharts';
import {Portfolio} from '../../types/types';
import {StoreType} from '../../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {Prop} from 'vue-property-decorator';
import {BigMoney} from '../../types/bigMoney';
import {Decimal} from 'decimal.js';

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container grid-list-md text-xs-center>
            <v-layout row wrap>
                <v-flex xs12>
                    <div v-show="chart" ref="container"
                         style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto"></div>
                    <v-progress-circular v-if="!chart" :size="70" :width="7" indeterminate
                                         color="indigo"></v-progress-circular>
                </v-flex>
            </v-layout>
        </v-container>
    `
})
export class BarChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @MainStore.Getter
    private portfolio: Portfolio;

    @Prop({default: '', type: String})
    private title: string;

    @Prop({default: '', type: String})
    private balloonTitle: string;

    @Prop({default: []})
    private categoryNames: string[];


    private chart: ChartObject = null;

    private async mounted(): Promise<void> {
        const data: DataPoint[] = [];
        this.portfolio.overview.stockPortfolio.rows.filter(value => value.currCost != '0').forEach(row => {
            console.log(row.currCost);
            data.push({
                name: row.stock.shortname,
                y: new Decimal(new BigMoney(row.currCost).amount.toString()).toDP(2, Decimal.ROUND_HALF_UP).toNumber()
            });
        });
        await this.draw(data);
    }

    private async draw(data: DataPoint[]): Promise<void> {
        this.chart =
            Highcharts.chart(this.$refs.container, {
                chart: {
                    type: 'bar'
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
                        text: 'Population (millions)',
                        align: 'high'
                    },
                    labels: {
                        overflow: 'justify'
                    }
                },
                tooltip: {
                    pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)',
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
                    name: 'Year 1800',
                    data: [
                        {name: 'Africa', y: 10},
                        {name: 'America', y: 20},
                        {name: 'Asia', y: 30},
                        {name: 'Europe', y: 40},
                        {name: 'Oceania', y: 50}
                    ]
                }]
            });
    }
}

/**
 JSONArray jSONArray = new JSONArray();
 BigMoney currentTotalCost = rows.stream().map(row -> row.getCurrCost().abs()).reduce(BigMoney.zero(currency), BigMoney::plus);
 Map<Sector, List<StockPortfolioRow>> rowsBySector = new HashMap<>();
 for (StockPortfolioRow row : rows.stream()
 .filter(row -> row.getQuantity() != 0).collect(Collectors.toList())) {
            Sector sector = row.getStock().getSector();
            rowsBySector.putIfAbsent(sector.isRoot() ? sector : sector.getParent(), new ArrayList<>());
            rowsBySector.get(sector.isRoot() ? sector : sector.getParent()).add(row);
        }
 rowsBySector.forEach((sector, stockRows) -> {
            BigMoney sumAmount = stockRows.stream().map(row -> row.getCurrCost().abs()).reduce(BigMoney.zero(currency), BigMoney::plus);
            String tickers = stockRows.stream().map(row -> row.getStock().getTicker()).collect(Collectors.joining(","));
            JSONObject ob = new JSONObject();
            ob.put("category", sector.isRoot() ? sector.getName() : sector.getParent().getName());
            ob.put("column-2", BigMoney.of(currency, sumAmount.dividedBy(currentTotalCost).multiply(BD._100)).getAmount()
                    .setScale(2, RoundingMode.HALF_UP).toString());
            ob.put("column-1", sumAmount.getAmount().setScale(2, RoundingMode.HALF_UP).toString());
            ob.put("tickers", Utils.splitToRows(tickers, 3));
            jSONArray.add(ob);
        });
 */
