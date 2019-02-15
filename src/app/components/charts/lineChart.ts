import Highcharts, {ChartObject, Gradient} from "highcharts";
import Highstock from "highcharts/highstock";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {HighStockEventsGroup} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div @click.stop>
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
export class LineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    /** Заголовок графика */
    @Prop({default: "", type: String})
    private title: string;
    /** Заголовок в тултипе */
    @Prop({default: "", type: String})
    private balloonTitle: string;
    /** Заголовк оси y */
    @Prop({default: "", type: String})
    private yAxisTitle: string;
    /** Данные для графика */
    @Prop({required: true})
    private data: any[];
    /** Данные по событиям */
    @Prop({required: false})
    private eventsChartData: HighStockEventsGroup[];
    /** Объект графика */
    private chart: ChartObject = null;
    /** Набор доступных для выбора диапазонов дат */
    private ranges: Highstock.RangeSelectorButton[] = [];
    /** Количество знаков для округления на графике */
    private decimals = 2;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        this.decimals = this.defineDecimals();
        this.ranges = [...ChartUtils.getChartRanges()];
        await this.draw();
    }

    @Watch("eventsChartData")
    private async onDataChange(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onEventsChartDataChange(): Promise<void> {
        await this.draw();
    }

    /**
     * Отрисовывает график
     */
    private async draw(): Promise<void> {
        this.chart = ChartUtils.drawLineChart(this.$refs.container, this.data, this.eventsChartData, this.ranges,
            this.ranges.length - 1, this.decimals, this.balloonTitle, this.title, this.yAxisTitle);
    }

    private defineDecimals(): number {
        if (this.data.length === 0) {
            return 2;
        }
        try {
            const value = this.data[0][1].toString();
            return value.substring(value.indexOf(".") + 1).length;
        } catch (ignored) {
            return 2;
        }
    }
}
