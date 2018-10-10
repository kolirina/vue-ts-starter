import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {UI} from "../app/ui";
import {DividendChart} from "../components/charts/dividendChart";
import {MarketService} from "../services/marketService";
import {BaseChartDot, Dot, HighStockEventsGroup} from "../types/charts/types";
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
                                <el-rate
                                        :value="share.rating"
                                        disabled
                                        text-color="#ff9900">
                                </el-rate>
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
                        </tbody>
                    </table>
                </v-card-text>
            </v-card>
            <div style="height: 20px"></div>
            <v-card style="overflow: auto;">
                <v-card-text>
                    <line-chart :data="history" :events-chart-data="events" :balloon-title="share.ticker"></line-chart>
                </v-card-text>
            </v-card>
            <div style="height: 20px"></div>
            <v-card style="overflow: auto;">
                <v-card-text>
                    <dividend-chart :data="dividends" title="Дивиденды"></dividend-chart>
                </v-card-text>
            </v-card>
        </v-container>
    `,
    components: {DividendChart}
})
export class ShareInfoPage extends UI {

    @Inject
    private marketService: MarketService;

    private share: Share = null;
    private history: Dot[] = [];
    private dividends: BaseChartDot[] = [];
    private events: HighStockEventsGroup[] = [];

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

}
