import Highcharts, {ChartObject} from "highcharts";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {AdviserLineChart} from "../../types/charts/types";

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

            <div v-show="chart" ref="container" style="width: 100%; height: 170px; margin: 0 auto"></div>
        </div>
    `
})
export class SimpleLineChart extends UI {

    $refs: {
        container: HTMLElement
    };
    /** Объект графика */
    chart: ChartObject = null;

    @Prop({default: "", type: String})
    private title: string;

    @Prop({required: true})
    private data: AdviserLineChart;

    @Prop({required: true})
    private tooltip: string;

    async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onDataChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                backgroundColor: "#F7F9FB",
                type: "spline"
            },
            title: {
                text: ""
            },
            yAxis: {
                title: {
                    text: ""
                },
                labels: {
                    style: {
                        fontSize: "13px",
                        color: "#040427"
                    }
                }
            },
            legend: {
                enabled: false
            },
            xAxis: {
                categories: this.data.categoryNames,
                labels: {
                    style: {
                        fontSize: "13px",
                        color: "#040427"
                    }
                },
                gridLineWidth: 1
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                headerFormat: "",
                pointFormat: `<span>${this.tooltip} {point.name}</span>: <b>{point.y:.2f}%</b>`
            },
            plotOptions: {
                series: {
                    color: "#FF3E70"
                }
            },
            series: [
                {
                    data: this.data.values
                },
            ]
        });
    }
}
