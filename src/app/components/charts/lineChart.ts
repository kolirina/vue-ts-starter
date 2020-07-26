import {ChartObject} from "highcharts";
import Highstock from "highcharts/highstock";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {UI} from "../../app/ui";
import {Storage} from "../../platform/services/storage";
import {HighStockEventsGroup, LineChartSeries} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

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
    @Inject
    private localStorage: Storage;
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
    /** Значение для линии средней цены в портфеле */
    @Prop({required: false})
    private avgLineValue: number;
    /** Объект графика */
    private chart: ChartObject = null;
    /** Набор доступных для выбора диапазонов дат */
    private ranges: Highstock.RangeSelectorButton[] = [];
    /** Количество знаков для округления на графике */
    private decimals = 2;
    /** Префикс ключа под которым будет хранится состояние */
    private stateKeyPrefix: string = "SHARE_LINE_CHART";
    /** Выбранный диапазон */
    private selectedRange: string = null;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async mounted(): Promise<void> {
        this.decimals = this.defineDecimals();
        this.restoreState();
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
        const compareData: LineChartSeries = {
            balloonTitle: this.balloonTitle,
            data: this.data,
            id: "dataseries"
        };
        this.chart = ChartUtils.drawLineChart(this.$refs.container, this.eventsChartData, this.ranges,
            this.selectedRangeIndex, this.decimals, this.title, this.yAxisTitle, null, this.avgLineValue, [compareData]);
    }

    private restoreState(): void {
        this.ranges = [...ChartUtils.getChartRanges()];
        this.ranges.forEach(range => {
            range.events = {
                click: (event: Event): void => this.saveRange(range.text)
            };
        });
        this.selectedRange = this.localStorage.get(`${this.stateKeyPrefix}_RANGE`, "YTD");
    }

    /**
     * Возвращает Индекс выбранного диапазона
     */
    private get selectedRangeIndex(): number {
        this.selectedRange = this.localStorage.get(`${this.stateKeyPrefix}_RANGE`, "YTD");
        const selectedIndex = this.ranges.map(range => range.text).indexOf(this.selectedRange);
        return selectedIndex === -1 ? 1 : selectedIndex;
    }

    /**
     * Сохраняет выбранный диапазон графика
     * @param range выбранный диапазон графика
     */
    private saveRange(range: string): void {
        if (this.stateKeyPrefix) {
            this.localStorage.set(`${this.stateKeyPrefix}_RANGE`, range);
        }
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
