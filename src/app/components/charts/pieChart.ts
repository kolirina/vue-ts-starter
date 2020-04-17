import {ChartObject, DataPoint} from "highcharts";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {PieChartTooltipFormat} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div style="position: relative; width: 100%; height: 100%;">
            <v-container grid-list-md text-xs-center v-if="!chart">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                    </v-flex>
                </v-layout>
            </v-container>

            <div v-show="chart" ref="container" class="pie-chart-wrapper"></div>
        </div>
    `
})
export class PieChart extends UI {

    $refs: {
        container: HTMLElement
    };
    /** Объект графика */
    chart: ChartObject = null;
    /** Валюта просмотра. Может быть не указана, тогда будет браться значения из данных о точке */
    @Prop({required: false, default: null, type: String})
    private viewCurrency: string;
    /** Заголовок графика */
    @Prop({default: "", type: String})
    private title: string;
    /** Заголовок тултипа */
    @Prop({default: "", type: String})
    private balloonTitle: string;
    /** Формат тултипа. Пол умолчанию для типов Акции, Облигации, Сектора */
    @Prop({default: "COMMON", type: String})
    private tooltipFormat: string;
    /** Данные */
    @Prop({required: true})
    private data: DataPoint[];

    async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onPortfolioChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
        this.chart = ChartUtils.drawPieChart(this.$refs.container, this.data, this.balloonTitle, this.title, this.viewCurrency, this.tooltipFormat as PieChartTooltipFormat);
    }
}
