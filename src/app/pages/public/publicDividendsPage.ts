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
import {Component, UI, Watch} from "../../app/ui";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {DividendAggregateInfo, DividendService} from "../../services/dividendService";
import {OverviewService} from "../../services/overviewService";
import {Portfolio} from "../../types/types";
import {BaseDividendsPage} from "../baseDividendsPage";

@Component({
    // language=Vue
    template: `
        <div>
            <base-dividends-page v-if="dividendInfoShowed" :portfolio="portfolio" :dividend-info="dividendInfo" :side-bar-opened="sideBarOpened"></base-dividends-page>

            <v-container v-else grid-list-md text-xs-center>
                <v-layout align-center justify-center column fill-height>
                    <v-flex xs12>
                        <span v-if="statusCode === 403">Доступ к портфелю запрещен</span>
                        <span v-if="statusCode === 404">Портфель не найден</span>
                    </v-flex>
                </v-layout>
            </v-container>
        </div>

    `,
    components: {BaseDividendsPage}
})
export class PublicDividendsPage extends UI {

    /** Портфель пользователя */
    private portfolio: Portfolio = null;
    @Inject
    private overviewService: OverviewService;
    /** Признак открытой боковой панели */
    private sideBarOpened: boolean = false;
    @Inject
    private dividendService: DividendService;
    /** Информация по дивидендам */
    private dividendInfo: DividendAggregateInfo = null;
    /** Статус ответа */
    private statusCode: number = null;

    /**
     * Инициализация данных страницы
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        const portfolioId = Number(this.$route.params.id);
        try {
            this.portfolio = await this.overviewService.getById(portfolioId, true);
            if (this.portfolio.portfolioParams.dividendsAccess) {
                await this.loadPortfolioLineChart();
            } else {
                this.statusCode = 403;
            }
        } catch (e) {
            this.statusCode = this.getStatusCode(e);
        }
    }

    @Watch("$route.params.id")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        await this.loadPortfolioLineChart();
    }

    @ShowProgress
    private async loadPortfolioLineChart(): Promise<void> {
        await this.loadDividendAggregateInfo();
    }

    private async loadDividendAggregateInfo(): Promise<void> {
        this.dividendInfo = await this.dividendService.getDividendAggregateInfo(this.portfolio.id, true);
    }

    /**
     * Возвращает признак отображения данных по дивидендам
     * Когда загружен портфель и разрешено отображение данных по дивидендам
     */
    private get dividendInfoShowed(): boolean {
        return this.portfolio && this.portfolio.portfolioParams.dividendsAccess;
    }

    private getStatusCode(e: any): number {
        try {
            return Number(e.code);
        } catch (e) {
            return null;
        }
    }
}
