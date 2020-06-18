import {Inject} from "typescript-ioc";
import {Component, UI} from "../../app/ui";
import {Storage} from "../../platform/services/storage";
import {ChartUtils} from "../../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Публичные портфели</div>
                </v-card-title>
            </v-card>
            <v-card flat class="template-wrapper">
                <div v-if="showHintPanel" class="info-block margB16">
                    Данный раздел поможет Вам быть в курсе тенденций инвестирования,  узнать стратегии распределения активов успешных инвесторов,
                    а также  поделиться своими идеями по ведению портфеля.<br><br>
                    Чтобы опубликовать портфель перейдите в раздел «Управление портфелями» → Выберете портфель, которым хотите поделиться, и нажмите кнопку «Опубликовать».<br>
                    <a @click="hideHintsPanel">Больше не показывать</a>
                </div>
                <div class="public-portfolio-list">
                    <div v-for="portfolio in publicPortfolios" :key="portfolio.id" @click="viewPortfolio(portfolio.id)" class="public-portfolio-item">
                        <div class="public-portfolio-item__header">{{ portfolio.investorName }}</div>
                        <div class="public-portfolio-item__title">{{ portfolio.portfolioName }}</div>
                        <div class="public-portfolio-item__chart">
                            <micro-line-chart :data="getChartData(portfolio.chartData)" :height="64"></micro-line-chart>
                        </div>
                        <div class="public-portfolio-item__footer">
                            <div>
                                <div class="public-portfolio-item__footer-title">Стоимость</div>
                                {{ portfolio.cost}}
                            </div>
                            <div>
                                <div class="public-portfolio-item__footer-title">Прибыль</div>
                                <span class="public-portfolio-positive">{{ portfolio.profit }}</span>
                            </div>
                            <div class="margRAuto">
                                <div class="public-portfolio-item__footer-title">Доходность</div>
                                <span class="public-portfolio-positive">{{ portfolio.profitability }}</span>
                            </div>
                            <div class="public-portfolio-item__footer-social">
                                <div class="public-portfolio-item__footer-referrals">{{ getFriendlyNumber(portfolio.referrals) }}</div>
                                <div class="public-portfolio-item__footer-like">{{ getFriendlyNumber(portfolio.like) }}</div>
                                <div class="public-portfolio-item__footer-dislike">{{ getFriendlyNumber(portfolio.dislike) }}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </v-card>
        </v-container>
    `
})
export class PublicPortfolioPage extends UI {
    @Inject
    private localStorage: Storage;
    /** Публичные портфели */
    private publicPortfolios: PublicPortfolio[] = null;
    /** Признак отображения панели с подсказкой */
    private showHintPanel = this.localStorage.get("publicPortfolioHintPanel", true);

    async created(): Promise<void> {
        this.publicPortfolios = await this.getPublicPortfolios();
    }

    /** Скрывает панель с подсказкой */
    private hideHintsPanel(): void {
        this.localStorage.set("publicPortfolioHintPanel", false);
        this.showHintPanel = false;
    }

    /**
     * Осуществляет переход на страницу просмотра портфеля
     * @param id идентификатор портфеля
     */
    private viewPortfolio(id: number): void {
        // this.$router.push();
    }

    /** Возвращает список публичных портфелей */
    private async getPublicPortfolios(): Promise<PublicPortfolio[]> {
        return [
            {
                id: 1,
                investorName: "Иван Смирнов",
                portfolioName: "Построение портфеля на рос облигациях с получением доходности от 7% годовых",
                cost: "17000000",
                profit: "87,5%",
                profitability: "12%",
                referrals: 2000,
                dislike: 123000,
                like: 5,
                chartData: [
                    {date: "2019-06-17", price: "0.61"},
                    {date: "2019-06-18", price: "1.63"},
                    {date: "2019-06-20", price: "0.9"},
                    {date: "2019-06-25", price: "3.63"}
                ]
            },
            {
                id: 2,
                investorName: "Барнаби Мармадюк Алоизий Бенджи Кобвеб Дартаньян Эгберт Феликс Гаспар Гумберт Игнатий Джейден Каспер Лерой Максимилиан",
                portfolioName: "Получение стабильного дохода с американский дивидендных акций",
                cost: "17000000",
                profit: "87,5%",
                profitability: "12%",
                referrals: 2000,
                dislike: 123000,
                like: 5,
                chartData: [
                    {date: "2019-06-17", price: "5.61"},
                    {date: "2019-06-18", price: "6.63"},
                    {date: "2019-06-20", price: "9.9"},
                    {date: "2019-06-25", price: "3.63"}
                ]
            }
        ];
    }

    /** Конвертирует число в аббревиатуру */
    private getFriendlyNumber(num: number): string {
        let formattedNumber;
        if (num >= 1000000) {
            formattedNumber =  (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
        } else  if (num >= 1000) {
            formattedNumber =  (num / 1000).toFixed(1).replace(/\.0$/, "") + "K";
        } else {
            formattedNumber = num.toString();
        }
        return formattedNumber;
    }

    private getChartData(chartData: any): any {
        return ChartUtils.convertPriceDataDots(chartData);
    }
}

/** Модель публичного портфеля */
export type PublicPortfolio = {
    /** id */
    id: number,
    /** Имя инвестора */
    investorName: string,
    /** Название портфеля */
    portfolioName: string,
    /** Стоимость */
    cost: string,
    /** Выгода */
    profit: string,
    /** Доходность */
    profitability: string,
    /** Количество рефералов */
    referrals: number,
    /** Количество лайков */
    like: number,
    /** Количество дислайков */
    dislike: number,
    /** Данные для графика */
    chartData: any[]
};