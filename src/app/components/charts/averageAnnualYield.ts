import Highcharts, {ChartObject} from "highcharts";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {YieldCompareData} from "../../types/types";

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

            <div v-show="chart" ref="container" style="width: 100%; height: 300px; margin: 0 auto"></div>
        </div>
    `
})
export class AverageAnnualYieldChart extends UI {

    $refs: {
        container: HTMLElement
    };
    /** Объект графика */
    chart: ChartObject = null;

    @Prop({default: "", type: String})
    private title: string;

    @Prop({required: true})
    private data: YieldCompareData;

    private categoryNames: string[] = [
        "Портфель",
        "Индекс",
        "Инфляция",
        "Депозит"
    ];

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
                type: "column",
                style: {
                    fontFamily: "\"Open Sans\" sans-serif",
                    fontSize: "13px"
                }
            },
            title: {
                text: ""
            },
            xAxis: {
                categories: this.categoryNames,
                labels: {
                    style: {
                        fontFamily: "\Open Sans\" sans-serif",
                        fontSize: "13px",
                        color: "#040427"
                    }
                }
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
            exporting: {
                enabled: false
            },
            legend: {
                enabled: false
            },
            plotOptions: {
                series: {
                    dataLabels: {
                        enabled: true,
                        format: "{point.y:.1f}%"
                    }
                }
            },
            tooltip: {
                headerFormat: "",
                pointFormat: "<span style='color:{point.color}'>{point.name}</span>: <b>{point.y:.2f}%</b><br/>"
            },
            series: [
                {
                    data: [
                        {
                            name: "Доходность портфеля",
                            color: "#b294ff",
                            y: Number(this.data.portfolioYearYield)
                        },
                        {
                            name: "Доходность индекса",
                            color: "#fdd400",
                            y: Number(this.data.micexYearYield)
                        },
                        {
                            name: "Инфляция",
                            color: "#cc4748",
                            y: Number(this.data.inflationYearYield)
                        },
                        {
                            name: "Доходность депозита",
                            color: "#84b761",
                            y: Number(this.data.depositYearYield)
                        }
                    ]
                }
            ]
        });
    }
}
