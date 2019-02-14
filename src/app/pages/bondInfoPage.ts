import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../app/ui";
import {BondPaymentsChart} from "../components/charts/bondPaymentsChart";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {MarketService} from "../services/marketService";
import {ColumnChartData, Dot, HighStockEventsGroup} from "../types/charts/types";
import {Share} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-container v-if="share" fluid>
            <div slot="header">Информация по бумаге</div>
            <v-layout>
                <v-text-field placeholder="Введите тикер или название компании"></v-text-field>
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
                        </tbody>
                    </table>
                </v-card-text>
            </v-card>
            <div style="height: 20px"></div>
            <v-card style="overflow: auto;">
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.isin"></line-chart>
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

    @Inject
    private marketService: MarketService;

    private share: Share = null;
    private history: Dot[] = [];
    private paymentsData: ColumnChartData = null;
    private events: HighStockEventsGroup[] = [];

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
}
