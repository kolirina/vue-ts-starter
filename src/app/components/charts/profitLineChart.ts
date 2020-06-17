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
import Highstock from "highcharts/highstock";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {ChartSeries, ChartSeriesFilter, HighStockEventsGroup, LineChartItem, LineChartSeries} from "../../types/charts/types";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div v-tariff-expired-hint>
            <span v-if="!isDefault" class="chart-custom-filter" title="Настроен фильтр"></span>
            <v-menu :close-on-content-click="false" :nudge-width="294" :nudge-bottom="40" bottom>
                <div class="pl-3" slot="activator">
                    <v-btn round class="portfolio-rows-filter__button">
                        Фильтры
                        <span class="portfolio-rows-filter__button__icon"></span>
                    </v-btn>
                </div>

                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                    <v-switch v-model="seriesFilter.totalProfit" @change="toggleChartOption(ChartSeries.TOTAL_PROFIT)" class="margT0" hide-details>
                        <template #label>
                            <span>{{ ChartSeries.TOTAL_PROFIT.description }}</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите для отображения графика суммарной прибыли портфеля
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                    <v-switch v-model="seriesFilter.showTrades" @change="onShowTradesChange" class="mt-3" hide-details>
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
                    <v-switch v-model="seriesFilter.rateProfit" @change="toggleChartOption(ChartSeries.RATE_PROFIT)" class="mt-3" hide-details>
                        <template #label>
                            <span>{{ ChartSeries.RATE_PROFIT.description }}</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите для отображения графика курсовой прибыли
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                    <v-switch v-model="seriesFilter.exchangeProfit" @change="toggleChartOption(ChartSeries.EXCHANGE_PROFIT)" class="mt-3" hide-details>
                        <template #label>
                            <span>{{ ChartSeries.EXCHANGE_PROFIT.description }}</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите для отображения графика прибыли по сделкам
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                    <v-switch v-model="seriesFilter.calculationProfit" @change="toggleChartOption(ChartSeries.CALCULATION_PROFIT)" class="mt-3" hide-details>
                        <template #label>
                            <span>{{ ChartSeries.CALCULATION_PROFIT.description }}</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите для отображения графика прибыли от начислений (Дивиденды, Купоны)
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                    <v-switch v-model="compare" @change="toggleCompareOption" class="mt-3" hide-details>
                        <template #label>
                            <span>Процентное сравнение</span>
                            <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Включите, если хотите чтобы графики сравнивались по относительной шкале
                                </span>
                            </v-tooltip>
                        </template>
                    </v-switch>
                </v-card>
            </v-menu>
            <div v-show="chartShowed()">
                <div v-show="chart" ref="container" style="width: 99%; height: 500px; margin: 0 auto" @click.stop></div>
            </div>
            <v-layout v-if="!chartShowed()" align-center justify-center column class="pb-5">
                <div>
                    <v-img src="./img/common/no-result-search.svg" width="39" heigth="45"></v-img>
                </div>
                <div class="fs14 mt-3">
                    Нет графиков для отображения. Настройте фильтр
                </div>
                <div class="margT30">
                    <v-btn color="#EBEFF7" @click="resetFilter">
                        Сбросить фильтры
                    </v-btn>
                </div>
            </v-layout>
        </div>
    `
})
export class ProfitLineChart extends UI {

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
    private data: LineChartItem[];
    /** Данные для графика */
    @Prop({required: true})
    private moexIndexData: any[];
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
    /** Данные фильтра */
    private seriesFilter: ChartSeriesFilter = {
        /** Признак отображения графика Прибыль по сделкам */
        exchangeProfit: false,
        /** Признак отображения графика Прибыль курсовая */
        rateProfit: false,
        /** Признак отображения графика Прибыль от начислений (Дивиденды, Купоны) */
        calculationProfit: false,
        /** Признак отображения графика Прибыль общая */
        totalProfit: true
    };
    /** Сравнение графиков. Для отображения процентов */
    private compare: boolean = false;

    /** Префиксы */
    private ChartSeries = ChartSeries;
    /** Набор графиков для отображения */
    private lineChartSeries: { [key: string]: LineChartSeries } = {};

    async mounted(): Promise<void> {
        this.restoreState();
        ChartSeries.values().forEach(series => {
            (this.seriesFilter as any)[series.code] = this.getStorageValue(series, [ChartSeries.EVENTS, ChartSeries.TOTAL_PROFIT].includes(series));
        });

        this.prepareLineData();
        this.lineChartSeries[ChartSeries.INDEX_STOCK_EXCHANGE.code] = {
            data: this.moexIndexData,
            balloonTitle: ChartSeries.INDEX_STOCK_EXCHANGE.description,
            enabled: (this.seriesFilter as any)[ChartSeries.INDEX_STOCK_EXCHANGE.code],
            id: ChartSeries.INDEX_STOCK_EXCHANGE.code
        };
        setTimeout(async () => await this.draw(), 0);
    }

    @Watch("eventsChartData")
    async onEventsChartDataChange(): Promise<void> {
        await this.draw();
    }

    @Watch("data")
    async onDataChange(): Promise<void> {
        this.prepareLineData();
        await this.draw();
    }

    /**
     * Отображает/скрывает сделки на графике
     */
    @ShowProgress
    async onShowTradesChange(): Promise<void> {
        this.chart.series.forEach(s => {
            if (s.name.includes("events")) {
                if (this.seriesFilter.showTrades) {
                    s.show();
                } else {
                    s.hide();
                }
            }
        });
        this.localStorage.set<boolean>(`${this.stateKeyPrefix}_SHOW_EVENTS`, this.seriesFilter.showTrades);
    }

    async toggleCompareOption(): Promise<void> {
        this.localStorage.set<boolean>(`${this.stateKeyPrefix}_COMPARE`, this.compare);
        await this.draw();
    }

    async toggleChartOption(series: ChartSeries): Promise<void> {
        this.toggleChartSeries(series);
        if (series === ChartSeries.TOTAL_PROFIT) {
            this.seriesFilter.showTrades = this.seriesFilter.totalProfit;
        }
        setTimeout(async () => await this.draw(), 0);
        if (series === ChartSeries.TOTAL_PROFIT && this.seriesFilter.totalProfit) {
            await this.onShowTradesChange();
        }
    }

    async resetFilter(): Promise<void> {
        this.seriesFilter.totalProfit = true;
        this.seriesFilter.showTrades = true;
        await this.onShowTradesChange();
        this.toggleChartSeries(ChartSeries.TOTAL_PROFIT);
        setTimeout(async () => await this.draw(), 0);
    }

    private toggleChartSeries(series: ChartSeries): void {
        const seriesEnabled = (this.seriesFilter as any)[series.code];
        this.localStorage.set<boolean>(`${this.stateKeyPrefix}${series.storagePrefix}`, seriesEnabled);
        this.lineChartSeries[series.code].enabled = seriesEnabled;
    }

    private prepareLineData(): void {
        [ChartSeries.TOTAL_PROFIT, ChartSeries.RATE_PROFIT, ChartSeries.EXCHANGE_PROFIT, ChartSeries.CALCULATION_PROFIT]
            .forEach(series => {
                this.lineChartSeries[series.code] = {
                    data: ChartUtils.convertToDots(this.data, series.fieldName),
                    balloonTitle: series.description,
                    enabled: (this.seriesFilter as any)[series.code],
                    id: series.code
                };
            });
    }

    /**
     * Отрисовывает график
     */
    private async draw(): Promise<void> {
        this.chart = ChartUtils.drawLineChart(this.$refs.container,
            this.seriesFilter.showTrades ? this.eventsChartData : [],
            this.ranges,
            this.selectedRangeIndex,
            2,
            "",
            "Прибыль портфеля",
            this.changeLoadState,
            null,
            Object.keys(this.lineChartSeries).map(key => this.lineChartSeries[key]).filter(series => series.enabled),
            this.compare
        );
    }

    private changeLoadState(): void {
    }

    private restoreState(): void {
        this.compare = this.localStorage.get<boolean>(`${this.stateKeyPrefix}_COMPARE`, false);
        this.ranges = [...ChartUtils.getChartRanges()];
        this.ranges.forEach(range => {
            range.events = {
                click: (event: Event): void => this.saveRange(range.text)
            };
        });
        this.selectedRange = this.localStorage.get(`${this.stateKeyPrefix}_RANGE`, "10d");
        const selectedIndex = this.ranges.map(range => range.text).indexOf(this.selectedRange);
        this.selectedRangeIndex = selectedIndex === -1 ? 1 : selectedIndex;
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
        return this.seriesFilter.showTrades && this.seriesFilter.totalProfit && !this.seriesFilter.rateProfit && !this.seriesFilter.exchangeProfit &&
            !this.seriesFilter.calculationProfit;
    }

    private getStorageValue(chartSeries: ChartSeries, defaultValue: boolean = false): boolean {
        return this.localStorage.get<boolean>(`${this.stateKeyPrefix}${chartSeries.storagePrefix}`, defaultValue);
    }

    private chartShowed(): boolean {
        return Object.keys(this.lineChartSeries).map(key => this.lineChartSeries[key]).filter(series => series.enabled).length > 0;
    }
}
