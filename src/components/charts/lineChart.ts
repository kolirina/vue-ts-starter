import {UI} from '../../app/UI';
import Component from 'vue-class-component';
import Highcharts, {ChartObject, Gradient} from 'highcharts';
import {StoreType} from '../../vuex/storeType';
import {namespace} from 'vuex-class/lib/bindings';
import {Prop, Watch} from 'vue-property-decorator';

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
export class LineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Prop({default: '', type: String})
    private title: string;

    @Prop({default: '', type: String})
    private balloonTitle: string;

    @Prop({default: '', type: String})
    private yAxisTitle: string;

    @Prop()
    private data: any[];

    private chart: ChartObject = null;

    private async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch('data')
    private async onDataChange(): Promise<void> {
        this.draw();
    }

    private async draw(): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                zoomType: 'x',
                backgroundColor: null
            },
            title: {
                text: this.title
            },
            subtitle: {
                text: 'Выделите участок для увеличения'
            },
            xAxis: {
                type: 'datetime'
            },
            yAxis: {
                title: {
                    text: this.yAxisTitle
                }
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
                            [1, (Highcharts.Color(Highcharts.getOptions().colors[0]) as Gradient).setOpacity(0).get('rgba')]
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
                type: 'area',
                name: this.balloonTitle,
                data: this.data
            }]
        });
    }
}
