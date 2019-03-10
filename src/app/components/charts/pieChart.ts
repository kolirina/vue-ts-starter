import Highcharts, {ChartObject} from "highcharts";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {TradeUtils} from "../../utils/tradeUtils";
import {StoreType} from "../../vuex/storeType";

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
export class PieChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Prop({required: true, type: String})
    private viewCurrency: string;

    @Prop({default: "", type: String})
    private title: string;

    @Prop({default: "", type: String})
    private balloonTitle: string;

    @Prop()
    private data: any[];

    private chart: ChartObject = null;

    async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onPortfolioChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
        this.chart = Highcharts.chart(this.$refs.container, {
            chart: {
                type: "pie",
                backgroundColor: null,
                style: {
                    fontFamily: "\"OpenSans\" sans-serif",
                    fontSize: "12px"
                }
            },
            title: {
                text: this.title
            },
            tooltip: {
                pointFormat: "<b>{point.y}, ({point.percentage:.2f}%)</b> <br/>{point.tickers}",
                valueSuffix: " " + TradeUtils.getCurrencySymbol(this.viewCurrency)
            },
            plotOptions: {
                pie: {
                    allowPointSelect: true,
                    cursor: "pointer",
                    dataLabels: {
                        enabled: true,
                        format: "<b>{point.name}</b>: {point.percentage:.1f} %",
                        style: {
                            color: "black"
                        }
                    }
                }
            },
            series: [{
                name: this.balloonTitle,
                data: this.data
            }]
        });
    }
}
