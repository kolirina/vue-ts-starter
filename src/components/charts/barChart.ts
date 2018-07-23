import Highcharts, {ChartObject} from 'highcharts';
import Component from 'vue-class-component';
import {Prop, Watch} from 'vue-property-decorator';
import {UI} from '../../app/UI';

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
export class BarChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Prop({default: '', type: String})
    private title: string;

    @Prop({default: '', type: String})
    private seriesName: string;

    @Prop({default: '', type: String})
    private tooltipValueSuffix: string;

    @Prop({default: '', type: String})
    private balloonTitle: string;

    @Prop()
    private data: any[];

    @Prop()
    private categoryNames: string[];

    private chart: ChartObject = null;

    private async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch('data')
    private async onDataChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
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
                    text: this.title,
                    align: 'high'
                },
                labels: {
                    overflow: 'justify'
                }
            },
            tooltip: {
                pointFormat: '<b>{point.y}, ({point.percentage:.2f}%)</b> <br/>',
                valueSuffix: ` ${this.tooltipValueSuffix}`
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
                name: this.seriesName,
                data: this.data
            }]
        });
    }
}
