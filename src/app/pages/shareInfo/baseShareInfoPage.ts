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

import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {DividendChart} from "../../components/charts/dividendChart";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../../components/dialogs/createOrEditNotificationDialog";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {MarketService} from "../../services/marketService";
import {NotificationType} from "../../services/notificationsService";
import {AssetType} from "../../types/assetType";
import {BaseChartDot, Dot, HighStockEventsGroup} from "../../types/charts/types";
import {Operation} from "../../types/operation";
import {Share, Stock, StockDynamic} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
import {StoreType} from "../../vuex/storeType";

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Информация</div>
                </v-card-title>
            </v-card>
            <v-card flat class="info-share-page">
                <share-search :asset-type="assetType.STOCK" @change="onShareSelect"></share-search>
                <div v-if="share">
                    <v-layout class="info-share-page__name-stock-block" justify-space-between align-center>
                        <div>
                            <div class="info-share-page__name-stock-block__title selectable">
                                <span>
                                    {{ share.name }}
                                </span>
                                <span>
                                    <strong>
                                        {{ share.ticker }}
                                    </strong>
                                </span>
                                <span>
                                    (ISIN {{ share.isin }})
                                </span>
                            </div>
                            <div>
                                <div class="info-share-page__name-stock-block__sector-rating">
                                    <span class="info-share-page__name-stock-block__subtitle">
                                        Сектор - {{ share.sector.name }}
                                    </span>
                                    <span v-if="share.sector.parent" class="info-share-page__name-stock-block__subtitle">
                                        родительский сектор: {{ share.sector.parent.name }}
                                    </span>
                                    <v-rating color="#A1A6B6" size="10" v-model="share.rating" dense readonly full-icon="fiber_manual_record"
                                              empty-icon="panorama_fish_eye" title=""></v-rating>
                                </div>
                            </div>
                        </div>
                        <div v-if="!publicZone">
                            <v-btn class="btn" @click.stop="openDialog">
                                Добавить в портфель
                            </v-btn>
                            <v-btn class="btn" @click.stop="openCreateNotificationDialog">
                                Добавить уведомление
                            </v-btn>
                        </div>
                    </v-layout>
                </div>
                <div class="info-share-page__empty" v-else>
                    <span>
                        Здесь будет показана информация об интересующих Вас акциях, а также о доходности по ним.
                    </span>
                </div>
                <v-card-text class="info-about-stock" v-if="share">
                    <v-layout justify-space-between wrap>
                        <div>
                            <div class="info-about-stock__title">
                                Об акции
                            </div>
                            <table class="info-about-stock__content">
                                <thead>
                                <tr>
                                    <th class="indent-between-title-value-200"></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="info-about-stock__content-title">
                                        Размер лота
                                    </td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.lotsize }}
                                        </span>
                                        <span class="info-about-stock__content-legend">шт.</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Последняя цена</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.price | amount }}
                                        </span>
                                        <span class="info-about-stock__content-legend">RUB</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Кол-во акций в обращении</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.issueSize | number }}
                                        </span>
                                    </td>
                                </tr>
                                <tr v-if="share.issueCapitalization">
                                    <td class="info-about-stock__content-title">Рыночная капитализация</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.issueCapitalization | number }}
                                        </span>
                                        <span class="info-about-stock__content-legend">RUB</span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="info-share-page__dynamics">
                            <div>
                                <div class="info-about-stock__title">
                                    Динамика
                                </div>
                                <table class="info-about-stock__content">
                                    <thead>
                                    <tr>
                                        <th class="indent-between-title-value-110"></th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td class="info-about-stock__content-title">За 1 месяц</td>
                                        <td>
                                            <v-layout align-center>
                                                <div :class="stockDynamic.yieldMonth1 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (stockDynamic.yieldMonth1 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ stockDynamic.yieldMonth1 }} %
                                                </span>
                                            </v-layout>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">За 6 месяцев</td>
                                        <td>
                                            <v-layout align-center>
                                                <div :class="stockDynamic.yieldMonth6 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (stockDynamic.yieldMonth6 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ stockDynamic.yieldMonth6 }} %
                                                </span>
                                            </v-layout>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">За 12 месяцев</td>
                                        <td>
                                            <v-layout align-center>
                                                <div :class="stockDynamic.yieldMonth12 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (stockDynamic.yieldMonth12 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ stockDynamic.yieldMonth12 }} %
                                                </span>
                                            </v-layout>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div class="info-share-page__dynamics__for-year">
                                <div class="info-about-stock__title">
                                    За год
                                </div>
                                <table class="info-about-stock__content">
                                    <thead>
                                    <tr>
                                        <th class="indent-between-title-value-100"></th>
                                        <th></th>
                                    </tr>
                                    </thead>
                                    <tbody>
                                    <tr>
                                        <td class="info-about-stock__content-title">Минимум</td>
                                        <td>
                                            <span class="info-about-stock__content-value">
                                                {{ stockDynamic.minYearPrice | amount }}
                                            </span>
                                            <span class="info-about-stock__content-legend">RUB</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">Максимум</td>
                                        <td>
                                            <span class="info-about-stock__content-value">
                                                {{ stockDynamic.maxYearPrice | amount }}
                                            </span>
                                            <span class="info-about-stock__content-legend">RUB</span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </v-layout>
                    <v-layout justify-space-between wrap>
                        <div>
                            <div class="info-about-stock__title">
                                Доходность
                            </div>
                            <table class="info-about-stock__content">
                                <thead>
                                <tr>
                                    <th class="indent-between-title-value-200"></th>
                                    <th></th>
                                </tr>
                                </thead>
                                <tbody>
                                <tr>
                                    <td class="info-about-stock__content-title">Див. доходность за 3 года</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.yield3 }}
                                        </span>
                                        <span class="info-about-stock__content-legend">%</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Див. доходность за 5 лет</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.yield5 }}
                                        </span>
                                        <span class="info-about-stock__content-legend">%</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Див. доходность суммарная</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.yieldAll }}
                                        </span>
                                        <span class="info-about-stock__content-legend">%</span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="info-about-stock__chart">
                            <v-card v-if="share" class="chart-overflow" flat>
                                <div>
                                    <micro-line-chart :data="microChartData" :height="150" :width="440"></micro-line-chart>
                                </div>
                            </v-card>
                        </div>
                    </v-layout>
                    <div class="info-share-page__footer">
                        <a class="info-share-page__footer__link" v-if="share.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + share.ticker" target="_blank"
                           :title="'Профиль эмитента' + share.companyName + ' на сайте биржи'">
                            Перейти на профиль эмитента
                        </a>

                        <a class="info-share-page__footer__link" v-else :href="'https://finance.yahoo.com/quote/' + share.ticker" target="_blank"
                           :title="'Профиль эмитента' + share.companyName + '  на сайте Yahoo Finance'">
                            Перейти на профиль эмитента
                        </a>
                    </div>
                </v-card-text>
            </v-card>

            <div class="space-between-blocks"></div>
            <v-card v-if="share" class="chart-overflow" flat>
                <v-card-title class="chart-title">
                    Цена бумаги
                </v-card-title>
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker" :avg-line-value="portfolioAvgPrice"></line-chart>
                </v-card-text>
            </v-card>

            <template v-if="dividends.length">
                <div class="space-between-blocks"></div>
                <v-card v-if="share" flat class="dividends-chart">
                    <v-card-title class="chart-title">
                        Дивиденды
                        <v-spacer></v-spacer>
                        <chart-export-menu @print="print" @exportTo="exportTo($event)"></chart-export-menu>
                    </v-card-title>
                    <v-card-text>
                        <dividend-chart ref="chartComponent" :data="dividends" title="Дивиденды"></dividend-chart>
                    </v-card-text>
                </v-card>
            </template>
        </v-container>
    `,
    components: {DividendChart}
})
export class BaseShareInfoPage extends UI {

    $refs: {
        chartComponent: DividendChart
    };

    @Prop({type: String, default: null, required: true})
    private ticker: string;

    @Prop({type: Number, default: null, required: false})
    private portfolioAvgPrice: number;

    @Prop({type: Boolean, default: false, required: false})
    private publicZone: boolean;
    @Inject
    private marketService: MarketService;
    /** Типы активов */
    private assetType = AssetType;
    /** Ценная бумага */
    private share: Share = null;
    /** История цены по бумаге */
    private history: Dot[] = [];
    /** Дивиденды */
    private dividends: BaseChartDot[] = [];
    /** События по бумаге */
    private events: HighStockEventsGroup[] = [];
    /** Динамика цены по бумаге */
    private stockDynamic: StockDynamic = null;
    /** Данные для микрографика */
    private microChartData: any[] = [];

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        const ticker = this.$route.params.ticker;
        if (ticker) {
            await this.loadShareInfo(ticker);
        }
    }

    /**
     * Следит за изменение тикера в url.
     * Не вызывается при первоначальной загрузке
     */
    @Watch("$route.params.ticker")
    private async onRouterChange(): Promise<void> {
        const ticker = this.$route.params.ticker;
        if (ticker) {
            await this.loadShareInfo(ticker);
        }
    }

    @ShowProgress
    private async loadShareInfo(ticker: string): Promise<void> {
        const result = await this.marketService.getStockInfo(ticker);
        this.share = result.stock;
        this.history = result.history;
        this.dividends = result.dividends;
        this.events.push(result.events);
        this.stockDynamic = result.stockDynamic;
        this.microChartData = ChartUtils.convertPriceDataDots(result.stockDynamic.yearHistory);
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: this.share,
            operation: Operation.BUY,
            assetType: AssetType.STOCK
        });
        if (result) {
            await this.$emit("reloadPortfolio");
        }
    }

    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        if (this.share) {
            this.$router.push(`/share-info/${share.ticker}`);
        }
    }

    private async openCreateNotificationDialog(): Promise<void> {
        await new CreateOrEditNotificationDialog().show({type: NotificationType.stock, shareId: this.share.id});
    }

    private async print(): Promise<void> {
        this.$refs.chartComponent.chart.print();
    }

    private async exportTo(type: string): Promise<void> {
        this.$refs.chartComponent.chart.exportChart({type: ChartUtils.EXPORT_TYPES[type]});
    }

    // private get portfolioAvgPrice(): number {
    //     const row = this.portfolio.overview.stockPortfolio.rows.find(r => r.stock.ticker === this.share.ticker);
    //     return row ? new BigMoney(row.avgBuy).amount.toNumber() : null;
    // }

    private get totalVoices(): number {
        try {
            const stock: Stock = this.share as Stock;
            return new Decimal(stock.maxRating / stock.rating).toDP(0).toNumber();
        } catch (e) {
            return 50;
        }
    }
}
