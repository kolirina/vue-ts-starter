import {Inject} from "typescript-ioc";
import {namespace} from "vuex-class";
import {Component, UI, Watch} from "../app/ui";
import {BondPaymentsChart} from "../components/charts/bondPaymentsChart";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../components/dialogs/createOrEditNotificationDialog";
import {FeedbackDialog} from "../components/dialogs/feedbackDialog";
import {ShowProgress} from "../platform/decorators/showProgress";
import {ClientInfo} from "../services/clientService";
import {MarketService} from "../services/marketService";
import {NotificationType} from "../services/notificationsService";
import {TradeService} from "../services/tradeService";
import {AssetType} from "../types/assetType";
import {ColumnChartData, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Operation} from "../types/operation";
import {ErrorInfo, Portfolio, Share, ShareType} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Информация по облигации</div>
                </v-card-title>
            </v-card>
            <v-card flat class="info-share-page">
                <share-search @change="onShareSelect"></share-search>
                <div v-if="share">
                    <v-layout wrap class="info-share-page__name-stock-block" justify-space-between align-center>
                        <div>
                            <div class="info-share-page__name-stock-block__title selectable">
                                <span>
                                    {{ share.shortname }}
                                </span>
                                <span>
                                    <strong>
                                        {{ share.ticker }}
                                    </strong>
                                </span>
                                <span>
                                    ISIN: ({{ share.isin }})
                                </span>
                            </div>
                        </div>
                        <div>
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
                                Об облигации
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
                                    <td class="info-about-stock__content-title">Последняя цена</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.prevprice }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Номинал</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.formattedFacevalue }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">НКД</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.accruedint | amount }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Валюта</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.currency }}
                                        </span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </v-layout>
                    <v-layout justify-space-between wrap>
                        <div>
                            <div class="info-about-stock__title">
                                События
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
                                    <td class="info-about-stock__content-title">Следующий купон</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.nextcoupon }}, {{ share.couponvalue | amount }}
                                        </span>
                                    </td>
                                </tr>
                                <tr>
                                    <td class="info-about-stock__content-title">Дата погашения</td>
                                    <td>
                                        <span class="info-about-stock__content-value">
                                            {{ share.matdate }}
                                        </span>
                                    </td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    </v-layout>
                    <div class="info-share-page__footer" v-if="share.currency === 'RUB'">
                        <a class="info-share-page__footer__link" :href="'http://moex.com/ru/issue.aspx?code=' + share.secid" target="_blank"
                           :title="'Профиль эмитента' + share.shortname + ' на сайте биржи'">
                            Перейти на профиль эмитента
                        </a>
                    </div>
                </v-card-text>
            </v-card>
            <div class="space-between-blocks"></div>
            <v-card v-if="share" class="chart-overflow" flat>
                <v-card-title class="chart-title">
                    Цена облигации
                </v-card-title>
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.isin" :avg-line-value="portfolioAvgPrice"></line-chart>
                </v-card-text>
            </v-card>
            <div class="space-between-blocks"></div>
            <v-card v-if="paymentsData && paymentsData.series.length" class="chart-overflow dividends-chart" flat>
                <v-card-title class="chart-title">
                    Начисления
                    <v-spacer></v-spacer>
                    <chart-export-menu @print="print" @exportTo="exportTo($event)"></chart-export-menu>
                </v-card-title>
                <v-card-text class="chart-overflow">
                    <bond-payments-chart ref="chartComponent" :data="paymentsData" title="Платежи по бумаге"></bond-payments-chart>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {BondPaymentsChart}
})
export class BondInfoPage extends UI {

    $refs: {
        chartComponent: BondPaymentsChart
    };

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @Inject
    private marketService: MarketService;
    @Inject
    private tradeService: TradeService;

    /** Идентификатор бумаги */
    private isin: string = null;
    /** Ценная бумага */
    private share: Share = null;
    /** История цены по бумаге */
    private history: Dot[] = [];
    /** Платежи по бумаге */
    private paymentsData: ColumnChartData = null;
    /** События по бумаге */
    private events: HighStockEventsGroup[] = [];
    /** События по бумаге */
    private shareEvents: HighStockEventsGroup[] = [];
    /** Типы активов */
    private AssetType = AssetType;
    /** Признак, если бумага не была найдена */
    private shareNotFound = false;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadBondInfo();
    }

    /**
     * Следит за изменение тикера в url.
     * Не вызывается при первоначальной загрузке
     */
    @Watch("$route.params.isin")
    private async onRouterChange(): Promise<void> {
        this.isin = this.$route.params.isin;
        await this.loadBondInfo();
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

    private async onShareSelect(share: Share): Promise<void> {
        if (this.$router.currentRoute.params.isin === share?.isin) {
            this.share = share;
            return;
        }
        if (share) {
            if (share.shareType === ShareType.STOCK) {
                this.$router.push(`/share-info/${share.ticker}`);
                return;
            }
            if (share.shareType === ShareType.ASSET) {
                this.$router.push(`/asset-info/${share.id}`);
                return;
            }
            this.$router.push(`/bond-info/${share.isin}`);
        }
    }

    @ShowProgress
    private async loadBondInfo(): Promise<void> {
        this.shareNotFound = false;
        this.isin = this.$route.params.isin;
        if (!this.isin) {
            return;
        }
        try {
            this.events = [];
            this.shareEvents = [];
            const result = await this.marketService.getBondInfo(this.isin);
            this.share = result.bond;
            this.history = result.history;
            this.paymentsData = result.payments;
            this.events.push(...result.events);
            this.shareEvents.push(...result.events);
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
        const tradeEvents = await this.tradeService.getShareTradesEvent(this.portfolio.id, this.share.ticker);
        this.events.push(...ChartUtils.processEventsChartData(tradeEvents, "flags", "dataseries", "circlepin", 10, "rgba(20,140,0,0.45)"));
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: this.share,
            operation: Operation.BUY,
            assetType: AssetType.BOND
        });
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async openCreateNotificationDialog(): Promise<void> {
        await new CreateOrEditNotificationDialog().show({type: NotificationType.bond, shareId: this.share.id});
    }

    private async print(): Promise<void> {
        this.$refs.chartComponent.chart.print();
    }

    private async exportTo(type: string): Promise<void> {
        this.$refs.chartComponent.chart.exportChart({type: ChartUtils.EXPORT_TYPES[type]});
    }

    private get portfolioAvgPrice(): number {
        const row = this.portfolio.overview.bondPortfolio.rows.find(r => r.bond.ticker === this.share.ticker);
        return row ? Number(row.avgBuy) : null;
    }

    private async openFeedBackDialog(): Promise<void> {
        const message = `Пожалуйста добавьте бумагу ${this.$route.params.isin} в систему.`;
        await new FeedbackDialog().show({clientInfo: this.clientInfo, message: message});
    }
}
