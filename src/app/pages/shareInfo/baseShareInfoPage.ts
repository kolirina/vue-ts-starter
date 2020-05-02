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

import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class/lib/bindings";
import {Component, Prop, UI, Watch} from "../../app/ui";
import {DividendChart} from "../../components/charts/dividendChart";
import {AddTradeDialog} from "../../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../../components/dialogs/createOrEditNotificationDialog";
import {FeedbackDialog} from "../../components/dialogs/feedbackDialog";
import {StockRate} from "../../components/stockRate";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Filters} from "../../platform/filters/Filters";
import {ClientInfo} from "../../services/clientService";
import {MarketService} from "../../services/marketService";
import {NotificationType} from "../../services/notificationsService";
import {TradeService} from "../../services/tradeService";
import {AssetType} from "../../types/assetType";
import {BaseChartDot, Dot, HighStockEventsGroup} from "../../types/charts/types";
import {Operation} from "../../types/operation";
import {Asset, ErrorInfo, Portfolio, Share, ShareDynamic, ShareType, StockTypeShare} from "../../types/types";
import {ChartUtils} from "../../utils/chartUtils";
import {StoreType} from "../../vuex/storeType";
import {AssetCategory} from "../../services/assetService";

const MainStore = namespace(StoreType.MAIN);

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
                <share-search @change="onShareSelect" @requestNewShare="onRequestNewShare" allow-request></share-search>
                <div v-if="share && (share.shareType === 'STOCK' || share.shareType === 'ASSET')" data-v-step="0">
                    <v-layout class="info-share-page__name-stock-block" justify-space-between align-center wrap>
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
                                <span v-if="isStockAsset">
                                    (ISIN {{ share.isin }})
                                </span>
                            </div>
                            <div v-if="share.sector">
                                <div class="info-share-page__name-stock-block__sector-rating">
                                    <span class="info-share-page__name-stock-block__subtitle">
                                        {{ sectorDescription }}
                                    </span>
                                    <span v-if="share.sector.parent" class="info-share-page__name-stock-block__subtitle">
                                        ,&nbsp;родительский сектор: {{ share.sector.parent.name }}
                                    </span>
                                    <span v-if="share.shareType === 'STOCK'" class="rating-section" data-v-step="1">
                                        <stock-rate :share="share"></stock-rate>
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="info-share-page__btns">
                            <v-btn class="btn mt-1" @click.stop="openDialog">
                                Добавить в портфель
                            </v-btn>
                            <v-btn class="btn mt-1" @click.stop="openCreateNotificationDialog">
                                Добавить уведомление
                            </v-btn>
                        </div>
                    </v-layout>
                </div>
                <div class="info-share-page__empty" v-else>
                    <span v-if="!shareNotFound">
                        Здесь будет показана информация об интересующих Вас ценных бумагах, а также о доходности по ним.
                    </span>
                    <span v-else>
                        Бумага не была найдена в системе.
                        <a @click.stop="openFeedBackDialog">
                            <span>Напишите нам</span> <i class="fas fa-envelope"></i>
                        </a> и мы постараемся ее добавить
                    </span>
                </div>
                <v-card-text class="info-about-stock" v-if="share">
                    <v-layout justify-space-between wrap>
                        <div>
                            <div class="info-about-stock__title">
                                {{ isStockAsset ? 'Об акции' : 'Об активе' }}
                            </div>
                            <table class="info-about-stock__content information-table">
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
                                            {{ share.lotsize || 'н/д' }}
                                        </span>
                                        <span v-if="share.lotsize" class="info-about-stock__content-legend">шт.</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Последняя цена</td>
                                    <td>
                                        <span class="info-about-stock__content-value" :title="'Время последнего обновления ' + share.lastUpdateTime">
                                            {{ share.price | amount(false, null, false, true) }}
                                        </span>
                                        <span class="info-about-stock__content-legend">{{ currencySymbol }}</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Дата последнего обновления</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.lastUpdateTime | date("DD.MM.YYYY HH:mm:ss") }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Кол-во бумаг в обращении</td>
                                    <td v-if="share.issueSize">
                                        <span class="info-about-stock__content-value">
                                            {{ share.issueSize | integer }}
                                        </span>
                                        <span class="info-about-stock__content-legend">шт.</span>
                                    </td>
                                    <td v-else>
                                        <span class="info-about-stock__content-value">н/д</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Рыночная капитализация</td>
                                    <td v-if="share.issueCapitalization">
                                        <span class="info-about-stock__content-value">
                                            {{ share.issueCapitalization | number }}
                                        </span>
                                        <span class="info-about-stock__content-legend">{{ currencySymbol }}</span>
                                    </td>
                                    <td v-else>
                                        <span class="info-about-stock__content-value">н/д</span>
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
                                <table class="info-about-stock__content information-table">
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
                                                <div :class="shareDynamic.yieldMonth1 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (shareDynamic.yieldMonth1 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ shareDynamic.yieldMonth1 }} %
                                                </span>
                                            </v-layout>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">За 6 месяцев</td>
                                        <td>
                                            <v-layout align-center>
                                                <div :class="shareDynamic.yieldMonth6 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (shareDynamic.yieldMonth6 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ shareDynamic.yieldMonth6 }} %
                                                </span>
                                            </v-layout>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">За 12 месяцев</td>
                                        <td>
                                            <v-layout align-center>
                                                <div :class="shareDynamic.yieldMonth12 >= 0 ? 'icon-positive' : 'icon-negative'"></div>
                                                <span :class="['info-about-stock__content', (shareDynamic.yieldMonth12 >= 0 ? 'above' : 'less') + '-than-zero']">
                                                    {{ shareDynamic.yieldMonth12 }} %
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
                                <table class="info-about-stock__content information-table">
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
                                                {{ shareDynamic.minYearPrice | amount }}
                                            </span>
                                            <span class="info-about-stock__content-legend">{{ currencySymbol }}</span>
                                        </td>
                                    </tr>
                                    <tr>
                                        <td class="info-about-stock__content-title">Максимум</td>
                                        <td>
                                            <span class="info-about-stock__content-value">
                                                {{ shareDynamic.maxYearPrice | amount }}
                                            </span>
                                            <span class="info-about-stock__content-legend">{{ currencySymbol }}</span>
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </v-layout>
                    <v-layout justify-space-between wrap>
                        <div>
                            <div v-if="isStockAsset" class="info-about-stock__title">
                                Доходность
                            </div>
                            <table v-if="isStockAsset" class="info-about-stock__content information-table">
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
                                    <micro-line-chart :data="microChartData" :height="150" :width="410"></micro-line-chart>
                                </div>
                            </v-card>
                        </div>
                    </v-layout>
                    <div v-if="isStockAsset" class="info-share-page__footer">
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

            <template v-if="share">
                <div class="space-between-blocks"></div>
                <v-card class="chart-overflow" flat data-v-step="2">
                    <v-card-title class="chart-title">
                        Цена бумаги
                    </v-card-title>
                    <v-card-text>
                        <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker" :avg-line-value="portfolioAvgPrice"
                                    class="portfolioAvgPriceChart"></line-chart>
                    </v-card-text>
                </v-card>
            </template>

            <template v-if="dividends.length">
                <div class="space-between-blocks"></div>
                <v-card v-if="share" flat class="dividends-chart" data-v-step="3">
                    <v-card-title class="chart-title">
                        Дивиденды
                        <v-spacer></v-spacer>
                        <chart-export-menu @print="print" @exportTo="exportTo($event)"></chart-export-menu>
                    </v-card-title>
                    <v-card-text class="chart-overflow">
                        <dividend-chart ref="chartComponent" :data="dividends" title="Дивиденды"></dividend-chart>
                    </v-card-text>
                </v-card>
            </template>
        </v-container>
    `,
    components: {DividendChart, StockRate}
})
export class BaseShareInfoPage extends UI {

    $refs: {
        chartComponent: DividendChart
    };

    @Prop({type: String, default: null, required: true})
    private ticker: string;

    @Prop({type: Number, default: null, required: false})
    private portfolioAvgPrice: number;

    @Prop({type: Object, default: (): AssetType => AssetType.STOCK, required: false})
    /** Тип активов */
    private assetType: AssetType;

    @Inject
    private tradeService: TradeService;
    @Inject
    private marketService: MarketService;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    /** Ценная бумага */
    private share: Share = null;
    /** История цены по бумаге */
    private history: Dot[] = [];
    /** Дивиденды */
    private dividends: BaseChartDot[] = [];
    /** События по бумаге */
    private events: HighStockEventsGroup[] = [];
    /** События по бумаге */
    private shareEvents: HighStockEventsGroup[] = [];
    /** Динамика цены по бумаге */
    private shareDynamic: ShareDynamic = null;
    /** Данные для микрографика */
    private microChartData: any[] = [];
    /** Типы активов */
    private AssetType = AssetType;
    /** Признак, если бумага не была найдена */
    private shareNotFound = false;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadShareInfo();
    }

    /**
     * Следит за изменение тикера в url.
     * Не вызывается при первоначальной загрузке
     */
    @Watch("ticker")
    private async onTickerChange(): Promise<void> {
        await this.loadShareInfo();
    }

    @Watch("portfolio")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        if (this.share) {
            this.events = [];
            this.events.push(...this.shareEvents);
            await this.loadTradeEvents();
        }
    }

    @ShowProgress
    private async loadShareInfo(): Promise<void> {
        this.shareNotFound = false;
        const ticker = this.$route.params.ticker;
        if (!ticker) {
            return;
        }
        try {
            const result = this.isStockAsset ? await this.marketService.getStockInfo(this.ticker) : await this.marketService.getAssetInfo(this.ticker);
            this.events = [];
            this.shareEvents = [];
            this.share = result.share;
            this.history = result.history;
            this.dividends = result.dividends;
            this.shareDynamic = result.shareDynamic;
            this.microChartData = ChartUtils.convertPriceDataDots(result.shareDynamic.yearHistory);
            this.events.push(result.events);
            this.shareEvents.push(result.events);
            await this.loadTradeEvents();
        } catch (e) {
            if ((e as ErrorInfo).errorCode === "NOT_FOUND") {
                this.shareNotFound = true;
            } else {
                throw e;
            }
        }
    }

    private async loadTradeEvents(): Promise<void> {
        const tradeEvents = this.isStockAsset ? await this.tradeService.getShareTradesEvent(this.portfolio.id, this.share.ticker) :
            await this.tradeService.getAssetShareTradesEvent(this.portfolio.id, String(this.share.id));
        this.events.push(...ChartUtils.processEventsChartData(tradeEvents, "flags", "dataseries", "circlepin", 10, "rgba(20,140,0,0.45)"));
    }

    private async openDialog(): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: this.share,
            operation: Operation.BUY,
            assetType: this.assetType
        });
    }

    private async onShareSelect(share: Share): Promise<void> {
        if ([share?.ticker, String(share?.id)].includes(this.$router.currentRoute.params.ticker) &&
            this.share?.shareType === share?.shareType) {
            this.share = share;
            return;
        }
        this.share = share;
        if (this.share) {
            if (this.share.shareType === ShareType.BOND) {
                this.$router.push(`/bond-info/${share.isin}`);
                return;
            }
            if (this.share.shareType === ShareType.ASSET) {
                this.$router.push(`/asset-info/${share.id}`);
                return;
            }
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

    private get currencySymbol(): string {
        return Filters.currencySymbolByCurrency(this.share.currency);
    }

    private get isStockAsset(): boolean {
        return this.assetType === AssetType.STOCK;
    }

    private get sectorDescription(): string {
        if (this.share.shareType === ShareType.ASSET) {
            const assetCategory: AssetCategory = AssetCategory.valueByName((this.share as Asset).category);
            return assetCategory == null ? "Активы" : assetCategory.description;
        }
        return (this.share as StockTypeShare).sector.name;
    }

    /**
     * Вызывает диалог обратной связи для добавления новой бумаги в систему
     * @param newTicket название новой бумаги из компонента поиска
     */
    private async onRequestNewShare(newTicket: string): Promise<void> {
        const message = `Пожалуйста добавьте бумагу ${newTicket} в систему.`;
        await new FeedbackDialog().show({clientInfo: this.clientInfo.user, message: message});
    }

    private async openFeedBackDialog(): Promise<void> {
        const message = `Пожалуйста добавьте бумагу ${this.$route.params.ticker} в систему.`;
        await new FeedbackDialog().show({clientInfo: this.clientInfo.user, message: message});
    }
}
