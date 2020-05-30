import {ChartObject} from "highcharts";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {ColumnChartData, PieChartTooltipFormat} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div>
            <v-container v-if="!chart" grid-list-md text-xs-center>
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                    </v-flex>
                </v-layout>
            </v-container>

            <div v-show="chart" ref="container" :style="style"></div>
        </div>
    `
})
export class BarChart extends UI {

    $refs: {
        container: HTMLElement
    };
    /** Объект графика */
    chart: ChartObject = null;
    /** Валюта просмотра. Может быть не указана, тогда будет браться значения из данных о точке */
    @Prop({required: false, default: null, type: String})
    private viewCurrency: string;
    /** Формат тултипа. Пол умолчанию для типов Акции, Облигации, Сектора */
    @Prop({default: "COMMON", type: String})
    private tooltipFormat: string;
    /** Заголовок */
    @Prop({default: "", type: String})
    private title: string;
    /** Подпись к легенде */
    @Prop({default: "", type: String})
    private legend: string;
    /** Данные */
    @Prop({required: true})
    private data: ColumnChartData;
    /** Стили */
    private style: string = "";

    async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onDataChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
        this.style = this.getStyles();
        await this.$nextTick();
        this.chart = ChartUtils.drawBarChart(this.$refs.container, this.data, this.title, this.viewCurrency, this.tooltipFormat as PieChartTooltipFormat);
    }

    private get height(): number {
        return this.data.categoryNames.length < 16 ? 400 : this.data.categoryNames.length * 25;
    }

    private getStyles(): string {
        return `min-width: 500px; width: 100%; height: ${this.height}px; margin: 0 auto`;
    }
}
