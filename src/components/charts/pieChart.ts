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
export class PieChart extends UI {

    $refs: {
      container: HTMLElement
    };

    @MainStore.Getter
    private portfolio: Portfolio;

    @Prop({default: '', type: String})
    private title: string;

    @Prop({default: '', type: String})
    private balloonTitle: string;

    @Prop()
    private data: any[];

    private chart: ChartObject = null;

    private async mounted(): Promise<void> {
        console.log("MOUNT", this.data);
        await this.draw();
    }

    private async draw(): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                type: 'pie',
                options3d: {
                    enabled: true,
                    alpha: 45,
                    beta: 0
                }
            },
            title: {
                text: this.title
            },
            tooltip: {
                pointFormat: '<b>{point.y}</b> ({point.percentage:.1f}%)'
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: 'pointer',
                    dataLabels: {
                        enabled: true,
                        format: '<b>{point.name}</b>: {point.percentage:.1f} %',
                        style: {
                            color: 'black'
                        }
                    },
                    showInLegend: true,
                    depth: 35,
                }
            },
            series: [{
                name: this.balloonTitle,
                data: this.data
            }]
        });
    }
}
