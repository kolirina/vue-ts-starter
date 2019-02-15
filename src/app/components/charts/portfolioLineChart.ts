import {ChartObject} from "highcharts";
import Highstock from "highcharts/highstock";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Prop, Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../../app/ui";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {Storage} from "../../platform/services/storage";
import {HighStockEventsGroup} from "../../types/charts/types";
import {StoreKeys} from "../../types/storeKeys";
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
export class PortfolioLineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    @Inject
    private localStorage: Storage;

    /** Заголовок в тултипе */
    @Prop({default: "", type: String})
    private balloonTitle: string;
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
    /** Индекс выбранного диапазона */
    private selectedRangeIndex: number = 1;
    /** Выбранный диапазон */
    private selectedRange: string = null;

    @CatchErrors
    async mounted(): Promise<void> {
        this.ranges = [...ChartUtils.getChartRanges()];
        this.ranges.forEach(range => {
            range.events = {
                click: (event: Event): void => this.saveRange(range.text)
            };
        });
        this.selectedRange = this.localStorage.get(StoreKeys.PORTFOLIO_CHART_RANGE, "10d");
        const selectedIndex = this.ranges.map(range => range.text).indexOf(this.selectedRange);
        this.selectedRangeIndex = selectedIndex === -1 ? 1 : selectedIndex;
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
        this.chart = ChartUtils.drawLineChart(this.$refs.container, this.data, this.eventsChartData, this.ranges, this.selectedRangeIndex, 2, this.balloonTitle,
            "", "Стоимость портфеля");
    }

    /**
     * Сохраняет выбранный диапазон графика
     * @param range выбранный диапазон графика
     */
    private saveRange(range: string): void {
        this.localStorage.set(StoreKeys.PORTFOLIO_CHART_RANGE, range);
    }
}
