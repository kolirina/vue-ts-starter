import {ChartObject} from "highcharts";
import Highstock from "highcharts/highstock";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {HighStockEventsGroup} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div>
            <span v-if="!isDefault" class="chart-custom-filter" title="Настроен фильтр"></span>
            <v-menu :close-on-content-click="false" :nudge-width="294" :nudge-bottom="40" bottom>
                <div class="pl-3" slot="activator">
                    <v-btn round class="chart-filter-btn">
                        Фильтры
                        <span class="portfolio-rows-filter__button__icon"></span>
                    </v-btn>
                </div>

                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                    <v-switch v-model="showTrades" @change="onShowTradesChange" class="margT0" hide-details>
                        <template #label>
                            <span>Сделки на графике</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите, если хотите чтобы на графике отображались сделки
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                    <v-switch v-model="showStockExchange" @change="onShowStockExchangeChange" class="mt-3" hide-details>
                        <template #label>
                            <span>Сравнение с индексом МосБиржи</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите, если хотите чтобы на графике отображалось сравнение с индексом МосБиржи
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                </v-card>
            </v-menu>
            <div v-show="chart" ref="container" style="width: 99%; height: 500px; margin: 0 auto" @click.stop></div>
        </div>
    `
})
export class PortfolioLineChart extends UI {

    $refs: {
        container: HTMLElement
    };

    /** Объект графика */
    chart: ChartObject = null;
    @Inject
    private localStorage: Storage;

    /** Заголовок в тултипе */
    @Prop({default: "", type: String})
    private balloonTitle: string;
    /** Данные для графика */
    @Prop({required: true})
    private data: any[];
    /** Данные для графика */
    @Prop({required: true})
    private compareData: any[];
    /** Данные по событиям */
    @Prop({required: false})
    private eventsChartData: HighStockEventsGroup[];
    /** Префикс ключа под которым будет хранится состояние */
    @Prop({type: String, required: false})
    private stateKeyPrefix: string;
    /** Набор доступных для выбора диапазонов дат */
    private ranges: Highstock.RangeSelectorButton[] = [];
    /** Индекс выбранного диапазона */
    private selectedRangeIndex: number = 1;
    /** Выбранный диапазон */
    private selectedRange: string = null;
    /** Признак отображения сделок на графике */
    private showTrades = true;
    /** Признак отображения диаграммы для сравнения с индексом Мос биржи */
    private showStockExchange = true;

    async mounted(): Promise<void> {
        this.showTrades = this.localStorage.get<string>(`${this.stateKeyPrefix}_SHOW_EVENTS`, "true") === "true";
        this.showStockExchange = this.localStorage.get<string>(`${this.stateKeyPrefix}_SHOW_INDEX_STOCK_EXCHANGE`, "true") === "true";
        this.ranges = [...ChartUtils.getChartRanges()];
        this.ranges.forEach(range => {
            range.events = {
                click: (event: Event): void => this.saveRange(range.text)
            };
        });
        this.selectedRange = this.localStorage.get(`${this.stateKeyPrefix}_RANGE`, "10d");
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
     * Отображает/скрывает сделки на графике
     */
    @ShowProgress
    private async onShowTradesChange(): Promise<void> {
        this.chart.series.forEach(s => {
            if (s.name.includes("events")) {
                if (this.showTrades) {
                    s.show();
                } else {
                    s.hide();
                }
            }
        });
        this.localStorage.set<string>(`${this.stateKeyPrefix}_SHOW_EVENTS`, String(this.showTrades));
    }

    private async onShowStockExchangeChange(): Promise<void> {
        this.localStorage.set<string>(`${this.stateKeyPrefix}_SHOW_INDEX_STOCK_EXCHANGE`, String(this.showStockExchange));
        await this.draw();
    }

    /**
     * Отрисовывает график
     */
    private async draw(): Promise<void> {
        this.chart = ChartUtils.drawLineChart(this.$refs.container, this.data,
            this.showTrades ? this.eventsChartData : [],
            this.ranges, this.selectedRangeIndex, 2, this.balloonTitle,
            "", "Стоимость портфеля", this.changeLoadState, null, this.showStockExchange ? this.compareData : [], "Индекс МосБиржи");
    }

    private changeLoadState(): void {
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

    private get isDefault(): boolean {
        return this.showTrades === true && this.showStockExchange === true;
    }
}
