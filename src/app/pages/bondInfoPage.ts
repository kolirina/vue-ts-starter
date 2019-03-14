import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {BondPaymentsChart} from "../components/charts/bondPaymentsChart";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {CreateOrEditNotificationDialog} from "../components/dialogs/createOrEditNotificationDialog";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketService} from "../services/marketService";
import {NotificationType} from "../services/notificationsService";
import {AssetType} from "../types/assetType";
import {ColumnChartData, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Operation} from "../types/operation";
import {Portfolio, Share} from "../types/types";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="share" fluid>
            <div slot="header">Информация по бумаге</div>
            <v-layout>
                <share-search :asset-type="assetType.BOND" @change="onShareSelect"></share-search>
            </v-layout>
            <v-card>
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
                            <td>SECID</td>
                            <td>{{ share.ыусшв }}</td>
                        </tr>
                        <tr>
                            <td>ISIN</td>
                            <td>{{ share.isin }}</td>
                        </tr>
                        <tr>
                            <td>Компания</td>
                            <td>{{ share.shortname }}</td>
                        </tr>
                        <tr>
                            <td>Регистрационный номер</td>
                            <td>{{ share.regnumber }}</td>
                        </tr>
                        <tr>
                            <td>След. купон</td>
                            <td>{{ share.nextcoupon }}</td>
                        </tr>
                        <tr>
                            <td>Купон</td>
                            <td>{{ share.couponvalue | amount }}</td>
                        </tr>
                        <tr>
                            <td>НКД</td>
                            <td>{{ share.accruedint | amount }}</td>
                        </tr>
                        <tr>
                            <td>Дата погашения</td>
                            <td>{{ share.matdate }}</td>
                        </tr>
                        <tr>
                            <td>Номинал</td>
                            <td>{{ share.formattedFacevalue }}</td>
                        </tr>
                        <tr>
                            <td>Последняя цена</td>
                            <td>{{ share.prevprice }} %</td>
                        </tr>
                        <tr>
                            <td>Валюта</td>
                            <td>{{ share.currency }}</td>
                        </tr>
                        <tr v-if="share.currency === 'RUB'">
                            <td>Профиль эмитента</td>
                            <td>
                                <a :href="'http://moex.com/ru/issue.aspx?code=' + share.secid" target="_blank"
                                   :title="'Профиль эмитента' + share.shortname + ' на сайте биржи'" style="word-break: break-all;">
                                    {{ 'http://moex.com/ru/issue.aspx?code=' + share.secid }}
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
            <v-card style="overflow: auto;">
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.isin" :avg-line-value="portfolioAvgPrice"></line-chart>
                </v-card-text>
            </v-card>
            <div style="height: 20px"></div>
            <v-card style="overflow: auto;">
                <v-card-text>
                    <bond-payments-chart :data="paymentsData" title="Платежи по бумаге"></bond-payments-chart>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {BondPaymentsChart}
})
export class BondInfoPage extends UI {

    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @MainStore.Getter
    private portfolio: Portfolio;
    @Inject
    private marketService: MarketService;

    private share: Share = null;
    private history: Dot[] = [];
    private paymentsData: ColumnChartData = null;
    private events: HighStockEventsGroup[] = [];
    private assetType = AssetType;

    @CatchErrors
    @ShowProgress
    async created(): Promise<void> {
        const isin = this.$route.params.isin;
        if (isin) {
            const result = await this.marketService.getBondInfo(isin);
            this.share = result.bond;
            this.history = result.history;
            this.paymentsData = result.payments;
            this.events.push(...result.events);
        }
    }

    @CatchErrors
    @ShowProgress
    private async onShareSelect(share: Share): Promise<void> {
        this.share = share;
        if (this.share) {
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

    private get portfolioAvgPrice(): number {
        const row = this.portfolio.overview.bondPortfolio.rows.find(r => r.bond.ticker === this.share.ticker);
        return row ? Number(row.avgBuy) : null;
    }
}
