import Component from "vue-class-component";
import {UI} from "../app/UI";
import {Share} from "../types/types";
import {Inject} from "typescript-ioc";
import {MarketService} from "../services/marketService";
import {Dot} from "../types/charts/types";

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
                                <span v-if="share.sector.parent">родительский сектор:{{ share.sector.parent.name }}</span>
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

                    <!-- TODO див доходность и кнопка добавить в портфель -->
                </v-card-text>
            </v-card>
            <div style="height: 20px"></div>
            <v-card>
                <v-card-text>
                    <line-chart :data="chartData" :balloon-title="share.ticker"></line-chart>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class ShareInfoPage extends UI {

    @Inject
    private marketService: MarketService;

    private share: Share = null;
    private chartData: Dot[] = [];

    private async created(): Promise<void> {
        const ticker = this.$route.params.ticker;
        if (ticker) {
            const result = await this.marketService.searchStocks(ticker);
            if (result && result.length) {
                this.share = result[0];
                console.log('SHARE PAGE', this.share);
                this.chartData = await this.marketService.getStockPriceHistory(ticker);
            }
        }
    }

}
