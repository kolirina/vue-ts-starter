import {ChartObject} from "highcharts";
import Highstock from "highcharts/highstock";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {CatchErrors} from "../../platform/decorators/catchErrors";
import {Storage} from "../../platform/services/storage";
import {HighStockEventsGroup} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div v-show="chart" ref="container" style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto" @click.stop></div>
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
    /** Ключ под которым будет хранится состояние */
    @Prop({type: String, required: false})
    private stateKey: string;
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
        this.selectedRange = this.localStorage.get(this.stateKey, "10d");
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
            "", "Стоимость портфеля", this.changeLoadState);
    }

    private changeLoadState(): void {
    }

    /**
     * Сохраняет выбранный диапазон графика
     * @param range выбранный диапазон графика
     */
    private saveRange(range: string): void {
        if (this.stateKey) {
            this.localStorage.set(this.stateKey, range);
        }
    }
}
