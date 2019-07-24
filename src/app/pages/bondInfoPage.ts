import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {BondPaymentsChart} from "../components/charts/bondPaymentsChart";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../components/dialogs/createOrEditNotificationDialog";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketService} from "../services/marketService";
import {NotificationType} from "../services/notificationsService";
import {AssetType} from "../types/assetType";
import {ColumnChartData, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Operation} from "../types/operation";
import {Portfolio, Share, ShareType} from "../types/types";
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
                    <span>
                        Здесь будет показана информация об интересующих Вас облигациях, а также о доходности по ним.
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
            <v-card v-if="share" class="chart-overflow dividends-chart" flat>
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
    @Inject
    private marketService: MarketService;

    private share: Share = null;
    private history: Dot[] = [];
    private paymentsData: ColumnChartData = null;
    private events: HighStockEventsGroup[] = [];
    private assetType = AssetType;

    @ShowProgress
    async created(): Promise<void> {
        const isin = this.$route.params.isin;
        if (isin) {
            const result = await this.marketService.getBondInfo(isin);
            this.share = result.bond;
            this.history = result.history;
            this.paymentsData = result.payments;
            console.log(this.paymentsData);
            this.events.push(...result.events);
        }
    }

    @ShowProgress
    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        if (this.share) {
            if (this.share.shareType === ShareType.STOCK) {
                this.$router.push(`/share-info/${share.ticker}`);
                return;
            }
            this.events = [];
            const result = await this.marketService.getBondInfo(this.share.isin);
            this.share = result.bond;
            this.history = result.history;
            this.paymentsData = result.payments;
            this.events.push(...result.events);
        }
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
}
