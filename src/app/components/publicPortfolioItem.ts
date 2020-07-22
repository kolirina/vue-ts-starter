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

/**
 * Компонент для отображения ссылки на просмотр информации по акции
 */
import {Component, Prop, UI} from "../app/ui";
import {PublicPortfolio} from "../services/publicPortfolioService";
import {LineChartItem} from "../types/charts/types";
import {PortfolioVote} from "../types/eventObjects";
import {ChartUtils} from "../utils/chartUtils";

@Component({
    // language=Vue
    template: `
        <div :key="portfolio.id" @click="openPublicPortfolio(portfolio.id)" class="public-portfolio-item">
            <div class="public-portfolio-item__header">{{ portfolio.ownerName }}</div>
            <div class="public-portfolio-item__title">{{ portfolio.description }}</div>
            <div class="public-portfolio-item__chart">
                <micro-line-chart :data="getChartData(portfolio.lineChartData)" :height="64"></micro-line-chart>
            </div>
            <div class="public-portfolio-item__footer">
                <div>
                    <div class="public-portfolio-item__footer-title">Стоимость</div>
                    {{ portfolio.currentCost | amount(true) }} {{ portfolio.currentCost | currencySymbol }}
                </div>
                <div>
                    <div class="public-portfolio-item__footer-title">Прибыль</div>
                    <span class="public-portfolio-positive">{{ portfolio.percentProfit }}%</span>
                </div>
                <div class="margRAuto">
                    <div class="public-portfolio-item__footer-title">Доходность</div>
                    <span class="public-portfolio-positive">{{ portfolio.yearYield }}%</span>
                </div>
                <div class="public-portfolio-item__footer-social" @click.stop>
                    <div class="public-portfolio-item__footer-referrals" title="Количество подписчиков">
                        {{ portfolio.referralsCount | friendlyNumber }}
                    </div>
                    <div class="public-portfolio-item__footer-like" @click="vote(portfolio, 1)">{{ portfolio.likes | friendlyNumber }}</div>
                    <div class="public-portfolio-item__footer-dislike" @click="vote(portfolio, -1)">{{ portfolio.dislikes | friendlyNumber }}</div>
                </div>
            </div>
        </div>
    `
})
export class PublicPortfolioItem extends UI {

    @Prop({type: Object, required: true})
    private portfolio: PublicPortfolio;

    /**
     * Осуществляет переход на страницу просмотра портфеля
     * @param id идентификатор портфеля
     */
    private openPublicPortfolio(id: number): void {
        const url = `${window.location.protocol}//${window.location.host}/public-portfolio/${id}/`;
        window.open(url, "_blank");
    }

    private getChartData(chartData: LineChartItem[]): any {
        return ChartUtils.convertToDots(chartData, "amount");
    }

    private vote(portfolio: PublicPortfolio, vote: number): void {
        this.$emit("vote", {id: portfolio.id, vote: vote} as PortfolioVote);
    }
}
