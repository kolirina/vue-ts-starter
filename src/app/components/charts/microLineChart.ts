/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {ChartObject} from "highcharts";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div :style="'width: ' + width + 'px'" @click.stop>
            <v-container grid-list-md text-xs-center v-if="!chart">
                <v-layout row wrap>
                    <v-flex xs12>
                        <v-progress-circular :size="70" :width="7" indeterminate color="indigo"></v-progress-circular>
                    </v-flex>
                </v-layout>
            </v-container>

            <div v-show="chart" ref="container" :style="'width: 100%; height:' + height + 'px; margin: 0 auto'"></div>
        </div>
    `
})
export class MicroLineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    /** Данные для графика */
    @Prop({required: true})
    private data: any[];
    /** Высота графика */
    @Prop({required: false, type: Number, default: 500})
    private height: number;
    /** Ширина родительского контейнера */
    @Prop({required: false, type: Number, default: 500})
    private width: number;
    /** Объект графика */
    private chart: ChartObject = null;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async mounted(): Promise<void> {
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
        this.chart = ChartUtils.drawMicroLineChart(this.$refs.container, this.data);
    }
}
