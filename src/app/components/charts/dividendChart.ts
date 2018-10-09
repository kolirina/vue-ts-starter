import Decimal from "decimal.js";
import Highcharts, {ChartObject} from "highcharts";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {BaseChartDot} from "../../types/charts/types";

@Component({
    // language=Vue
    template: `
        <div>
            <v-container grid-list-md text-xs-center v-if="!chart">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                    </v-flex>
                </v-layout>
            </v-container>

            <div v-show="chart" ref="container" style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto"></div>
        </div>
    `
})
export class DividendChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Prop({default: "", type: String})
    private title: string;

    @Prop({required: true})
    private data: BaseChartDot[];

    private chartData: number[] = [];

    private categoryNames: string[] = [];

    private chart: ChartObject = null;

    async mounted(): Promise<void> {
        this.prepareData();
        await this.draw();
    }

    @Watch("data")
    private async onDataChange(): Promise<void> {
        this.prepareData();
        await this.draw();
    }

    private prepareData(): void {
        this.chartData = [];
        this.categoryNames = [];
        this.data.forEach(dot => {
            this.chartData.push(new Decimal(dot.amount).toNumber());
        });
        this.categoryNames = this.data.map(dot => dot.date);
    }

    private async draw(): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                type: "column",
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
            plotOptions: {
                column: {
                    depth: 25
                }
            },
            xAxis: {
                categories: this.categoryNames,
                crosshair: true
            },
            yAxis: {
                min: 0,
                title: {
                    text: "Дивиденды"
                }
            },
            series: [{
                data: this.chartData,
                name: "Дивиденд",
            }]
        });
    }
}
