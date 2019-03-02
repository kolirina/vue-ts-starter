import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {DividendChart} from "../components/charts/dividendChart";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../components/dialogs/createOrEditNotificationDialog";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketService} from "../services/marketService";
import {AssetType} from "../types/assetType";
import {BigMoney} from "../types/bigMoney";
import {BaseChartDot, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Operation} from "../types/operation";
import {Portfolio, Share} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-layout>
                <share-search :asset-type="assetType.STOCK" @change="onShareSelect"></share-search>
            </v-layout>
            <v-card v-if="share">
                <v-card-text>
                    <table>
                        <thead>
                        <tr>
                            <th style="width: 250px"></th>
                            <th></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>Тикер</td>
                            <td>{{ share.ticker }}</td>
                        </tr>
                        <tr>
                            <td>Компания</td>
                            <td>{{ share.name }}</td>
                        </tr>
                        <tr>
                            <td>ISIN</td>
                            <td>{{ share.isin }}</td>
                        </tr>
                        <tr>
                            <td>Сектор</td>
                            <td>
                                <div>{{ share.sector.name }}</div>
                                <span v-if="share.sector.parent">родительский сектор: {{ share.sector.parent.name }}</span>
                            </td>
                        </tr>
                        <tr>
                            <td>Размер лота</td>
                            <td>{{ share.lotsize }}</td>
                        </tr>
                        <tr>
                            <td>Последняя цена</td>
                            <td>{{ share.price | amount }}</td>
                        </tr>
                        <tr>
                            <td>Кол-во акций в обращении</td>
                            <td>{{ share.issueSize | number }}</td>
                        </tr>
                        <tr v-if="share.issueCapitalization">
                            <td>Рыночная капитализация</td>
                            <td>{{ share.issueCapitalization | number }}</td>
                        </tr>
                        <tr>
                            <td>Див. доходность за 3 года</td>
                            <td>
                                {{ share.yield3 }} %
                            </td>
                        </tr>
                        <tr>
                            <td>Див. доходность за 5 лет</td>
                            <td>
                                {{ share.yield5 }} %
                            </td>
                        </tr>
                        <tr>
                            <td>Див. доходность суммарная</td>
                            <td>
                                {{ share.yieldAll }} %
                            </td>
                        </tr>
                        <tr>
                            <td>Рейтинг</td>
                            <td>
                                <v-rating v-model="share.rating" dense readonly></v-rating>
                            </td>
                        </tr>
                        <tr>
                            <td>Профиль эмитента</td>
                            <td>
                                <a v-if="share.currency === 'RUB'" :href="'http://moex.com/ru/issue.aspx?code=' + share.ticker" target="_blank"
                                   :title="'Профиль эмитента' + share.companyName + ' на сайте биржи'" style="word-break: break-all;">
                                    {{ 'http://moex.com/ru/issue.aspx?code=' + share.ticker }}
                                </a>

                                <a v-else :href="'https://finance.yahoo.com/quote/' + share.ticker" target="_blank"
                                   :title="'Профиль эмитента' + share.companyName + '  на сайте Yahoo Finance'" style="word-break: break-all;">
                                    {{ 'https://finance.yahoo.com/quote/' + share.ticker }}
                                </a>
                            </td>
                        </tr>
                        <tr>
                            <td>Добавить в портфель</td>
                            <td>
                                <v-btn fab dark small color="primary" @click.stop="openDialog">
                                    <v-icon dark>add</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                        <tr>
                            <td>Добавить уведомление</td>
                            <td>
                                <v-btn fab dark small color="primary" @click.stop="openCreateNotificationDialog">
                                    <v-icon dark>far fa-bell</v-icon>
                                </v-btn>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </v-card-text>
            </v-card>

            <div style="height: 20px"></div>
            <v-card v-if="share" style="overflow: auto;">
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker" :avg-line-value="portfolioAvgPrice"></line-chart>
                </v-card-text>
            </v-card>

            <div style="height: 20px"></div>
            <v-card v-if="share" style="overflow: auto;">
                <v-card-text>
                    <dividend-chart :data="dividends" title="Дивиденды"></dividend-chart>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {DividendChart}
})
export class ShareInfoPage extends UI {

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

    @CatchErrors
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

    @CatchErrors
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
        await new CreateOrEditNotificationDialog().show();
    }

    private get portfolioAvgPrice(): number {
        const row = this.portfolio.overview.stockPortfolio.rows.find(r => r.stock.ticker === this.share.ticker);
        return row ? new BigMoney(row.avgBuy).amount.toNumber() : null;
    }
}
