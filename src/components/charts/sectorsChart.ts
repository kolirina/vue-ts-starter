import {UI} from '../../app/UI';
import Component from 'vue-class-component';
import Highcharts, {ChartObject} from 'highcharts';
import {Portfolio} from '../../types/types';
import {StoreType} from '../../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {Prop, Watch} from 'vue-property-decorator';
import {ChartUtils} from "../../utils/ChartUtils";

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
        await this.doChart();
    }

    private async doChart(): Promise<void> {
        const chartData = ChartUtils.doSectorsChartData(this.portfolio.overview);
        this.categoryNames = chartData.categories;
        await this.draw(chartData.data);
    }

    @Watch('portfolio')
    private async onPortfolioChange(): Promise<void> {
        await this.doChart();
    }

    private async draw(data: any[]): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                type: 'bar',
                backgroundColor: null,
                options3d: {
                    enabled: true,
                    alpha: 0,
                    beta: 0,
                    depth: 20,
                    viewDistance: 25
                }
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
                name: 'Отрасли',
                data: data
            }]
        });
    }
}
