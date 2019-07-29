import Highcharts, {ChartObject} from "highcharts";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {AdviserSchedule} from "../../types/types";

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

            <div v-show="chart" ref="container" style="width: 100%; height: 117px; margin: 0 auto"></div>
        </div>
    `
})
export class MonthlyInflationChart extends UI {

    $refs: {
        container: HTMLElement
    };
    /** Объект графика */
    chart: ChartObject = null;

    @Prop({default: "", type: String})
    private title: string;

    @Prop({required: true})
    private data: AdviserSchedule;

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
                style: {
                    fontFamily: "\"Open Sans\" sans-serif",
                    fontSize: "13px"
                }
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
                        fontFamily: "\Open Sans\" sans-serif",
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
                        fontFamily: "\Open Sans\" sans-serif",
                        fontSize: "13px",
                        color: "#040427"
                    }
                }
            },
            exporting: {
                enabled: false
            },
            tooltip: {
                headerFormat: "",
                pointFormat: "<span>Инфляция за {point.name}</span>: <b>{point.y:.2f}%</b>"
            },
            series: [
                {
                    data: [...this.data.values]
                },
            ]
        });
    }
}
