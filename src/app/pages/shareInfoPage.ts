import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {DividendChart} from "../components/charts/dividendChart";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../components/dialogs/createOrEditNotificationDialog";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketService} from "../services/marketService";
import {NotificationType} from "../services/notificationsService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {BaseChartDot, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Operation} from "../types/operation";
import {Portfolio, Share} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div>
            <div class="title-page">
                <span>
                    Информация
                </span>
            </div>
            <v-container fluid>
                <v-card flat class="info-share-page">
                    <share-search :asset-type="assetType.STOCK" @change="onShareSelect"></share-search>
                    <div v-if="share">
                        <v-layout class="info-share-page__name-stock-block" justify-space-between align-center>
                            <div>
                                <div class="info-share-page__name-stock-block__title">
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
                                    <div>
                                        <span class="info-share-page__name-stock-block__subtitle">
                                            Сектор - {{ share.sector.name }}
                                        </span>
                                        <span class="info-share-page__name-stock-block__subtitle" v-if="share.sector.parent">родительский сектор: {{ share.sector.parent.name }}</span>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <v-btn class="info-share-page__name-stock-block__action-btn" outline color="#3D4656" @click.stop="openDialog">Добавить в портфель</v-btn>
                                <v-btn class="info-share-page__name-stock-block__action-btn" outline color="#3D4656" @click.stop="openCreateNotificationDialog">Добавить уведомление</v-btn>
                            </div>
                        </v-layout>
                    </div>
                    <div class="info-share-page__empty" v-else>
                        <span>
                            Здесь будет показана информация об интересующих Вас акциях, а также о доходности по ним.
                        </span>
                    </div>
                    <v-card-text class="info-about-stock">
                        <v-layout justify-space-between wrap>
                            <div>
                                <div class="info-about-stock__title">
                                    Об акции
                                </div>
                                <table class="info-about-stock__content">
                                    <thead>
                                        <tr>
                                            <th style="width: 200px"></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="info-about-stock__content-title">
                                                Размер лота
                                            </td>
                                            <td><strong>{{ share.lotsize }}</strong> <span class="info-about-stock__content-legend">шт.</span></td>
                                        </tr>
                                        <tr>
                                            <td class="info-about-stock__content-title">Последняя цена</td>
                                            <td><strong>{{ share.price | amount }}</strong> <span class="info-about-stock__content-legend">RUB</span></td>
                                        </tr>
                                        <tr>
                                            <td class="info-about-stock__content-title">Кол-во акций в обращении</td>
                                            <td><strong>{{ share.issueSize | number }}</strong></td>
                                        </tr>
                                        <tr v-if="share.issueCapitalization">
                                            <td class="info-about-stock__content-title">Рыночная капитализация</td>
                                            <td><strong>{{ share.issueCapitalization | number }}</strong> <span class="info-about-stock__content-legend">RUB</span></td>
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
                                                <th style="width: 110px"></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="info-about-stock__content-title">За 1 месяц</td>
                                                <td>
                                                    <v-layout align-center>
                                                        <img src="img/share/plus.png">
                                                        <span class="info-about-stock__content__above-zero">0,86%</span>
                                                    </v-layout>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="info-about-stock__content-title">За 6 месяцев</td>
                                                <td>
                                                    <v-layout align-center>
                                                        <img src="img/share/minus.png">
                                                        <span class="info-about-stock__content__less-than-zero">-2,07%</span>
                                                    </v-layout>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="info-about-stock__content-title">За 12 месяцев</td>
                                                <td> 
                                                    <v-layout align-center>
                                                        <img src="img/share/plus.png">
                                                        <span class="info-about-stock__content__above-zero">9,78%</span>
                                                    </v-layout>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div style="margin-left: 50px">
                                    <div class="info-about-stock__title">
                                        За год
                                    </div>
                                    <table class="info-about-stock__content">
                                        <thead>
                                            <tr>
                                                <th style="width: 100px"></th>
                                                <th></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td class="info-about-stock__content-title">Минимум</td>
                                                <td>
                                                    <span>
                                                        <strong>
                                                            134,4
                                                        </strong>
                                                        <span class="info-about-stock__content-legend">RUB</span>
                                                    </span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="info-about-stock__content-title">Максимум</td>
                                                <td>
                                                    <span>
                                                        <strong>
                                                            172,11
                                                        </strong>
                                                        <span class="info-about-stock__content-legend">RUB</span>
                                                    </span>
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
                                            <th style="width: 200px"></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td class="info-about-stock__content-title">Див. доходность за 3 года</td>
                                            <td>
                                                <strong>{{ share.yield3 }}</strong>
                                                <span class="info-about-stock__content-legend">%</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="info-about-stock__content-title">Див. доходность за 5 лет</td>
                                            <td>
                                                <strong>{{ share.yield5 }}</strong>
                                                <span class="info-about-stock__content-legend">%</span>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td class="info-about-stock__content-title">Див. доходность суммарная</td>
                                            <td>
                                                <strong>{{ share.yieldAll }}</strong>
                                                <span class="info-about-stock__content-legend">%</span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                            <div style="max-width: 435px; padding-top: 30px;" class="">
                                <v-card v-if="share" style="overflow: auto;" flat>
                                    <div>
                                        <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker" :avg-line-value="portfolioAvgPrice"></line-chart>
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

                <div style="height: 20px"></div>
                <v-card v-if="share" style="overflow: auto;" flat>
                    <v-card-title class="headline">
                        Цена бумаги
                    </v-card-title>
                    <v-card-text>
                        <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker" :avg-line-value="portfolioAvgPrice"></line-chart>
                    </v-card-text>
                </v-card>

                <div style="height: 20px"></div>
                <v-card v-if="share" style="overflow: auto;" flat>
                    <v-card-title class="headline">
                        Дивиденды
                        <v-spacer></v-spacer>
                        <chart-export-menu @print="print" @exportTo="exportTo($event)"></chart-export-menu>
                    </v-card-title>
                    <v-card-text>
                        <dividend-chart ref="chartComponent" :data="dividends" title="Дивиденды"></dividend-chart>
                    </v-card-text>
                </v-card>
            </v-container>
        </div>
    `,
    components: {DividendChart}
})
export class ShareInfoPage extends UI {

    $refs: {
        chartComponent: DividendChart
    };

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private marketService: MarketService;

    private assetType = AssetType;
    private share: Share = null;
    private history: Dot[] = [];
    private dividends: BaseChartDot[] = [];
    private events: HighStockEventsGroup[] = [];

    @ShowProgress
    async created(): Promise<void> {
        const ticker = this.$route.params.ticker;
        if (ticker) {
            const result = await this.marketService.getStockInfo(ticker);
            this.share = result.stock;
            this.history = result.history;
            this.dividends = result.dividends;
            this.events.push(result.events);
        }
    }

    @ShowProgress
    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        if (this.share) {
            const result = await this.marketService.getStockInfo(this.share.ticker);
            this.share = result.stock;
            this.history = result.history;
            this.dividends = result.dividends;
            this.events.push(result.events);
        }
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
            await this.reloadPortfolio(this.portfolio.id);
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

    private get portfolioAvgPrice(): number {
        const row = this.portfolio.overview.stockPortfolio.rows.find(r => r.stock.ticker === this.share.ticker);
        return row ? new BigMoney(row.avgBuy).amount.toNumber() : null;
    }
}
