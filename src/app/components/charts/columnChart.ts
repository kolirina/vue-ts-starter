/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2020
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2020
 */

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

            <div v-show="chart" ref="container" style="min-width: 500px; width: 100%; height: 500px; margin: 0 auto"></div>
        </div>
    `
})
export class ColumnChart extends UI {

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
    /** Данные */
    @Prop({required: true})
    private data: ColumnChartData;

    async mounted(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    private async onDataChange(): Promise<void> {
        await this.draw();
    }

    private async draw(): Promise<void> {
        await this.$nextTick();
        this.chart = ChartUtils.drawColumnChart(this.$refs.container, this.data, this.title, this.viewCurrency, this.tooltipFormat as PieChartTooltipFormat);
    }
}
