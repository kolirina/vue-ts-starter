import Highcharts, {ChartObject, DataPoint, Gradient} from "highcharts";
import Highstock from "highcharts/highstock";
import {Container, Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {OverviewService} from "../../services/overviewService";
import {HighStockEventsGroup} from "../../types/charts/types";
import {Portfolio} from "../../types/types";
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

            <div v-show="chart" ref="container"
                 style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto"></div>
        </div>
    `
})
export class PortfolioLineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Inject
    private overviewService: OverviewService;
    @MainStore.Getter
    private portfolio: Portfolio;
    private chartData: any[] = [];
    private eventsChartData: HighStockEventsGroup[] = [];
    private chart: ChartObject = null;

    @CatchErrors
    async mounted(): Promise<void> {
        await this.doChart();
    }

    private async doChart(): Promise<void> {
        this.chartData = await this.overviewService.getCostChart(this.portfolio.id);
        this.eventsChartData = await this.overviewService.getEventsChartDataWithDefaults(this.portfolio.id);
        await this.draw(this.chartData);
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.doChart();
    }

    private async draw(chartData: any[]): Promise<void> {
        this.chart = Highstock.stockChart(this.$refs.container, {
            chart: {
                zoomType: "x",
                backgroundColor: null
            },
            title: {
                text: ""
            },
            subtitle: {
                text: "Выделите участок для увеличения"
            },
            xAxis: {
                type: "datetime",
                gridLineWidth: 1,
                labels: {
                    style: {
                        fontSize: "12px"
                    }
                }
            },
            yAxis: {
                title: {
                    text: "Стоимость портфеля"
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
                            [1, (Highcharts.Color(Highcharts.getOptions().colors[0]) as Gradient).setOpacity(0).get("rgba")]
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
                type: "area",
                name: this.portfolio.portfolioParams.name,
                data: this.chartData,
                id: "dataseries"
            },
                ...this.eventsChartData],
            exporting: {
                enabled: true
            }
        });
    }
}
