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
import {namespace} from "vuex-class";
import {Component, Prop, UI} from "../app/ui";
import {ClientInfo} from "../services/clientService";
import {PublicPortfolio} from "../services/publicPortfolioService";
import {LineChartItem} from "../types/charts/types";
import {PortfolioVote} from "../types/eventObjects";
import {ChartUtils} from "../utils/chartUtils";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <div :key="portfolio.id" @click="openPublicPortfolio(portfolio.id)" class="public-portfolio-item">
            <div :class="['public-portfolio-item__header', verification ? 'verification' : '']"
                 :title="verification ? 'Верифицированный инвестор' : 'Инвестор'">
                <span>{{ portfolio.ownerName }}</span>
            </div>
            <div class="public-portfolio-item__title" :title="portfolio.description">
                {{ shortDescription }}
            </div>
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
                    <span :class="[isPositive(portfolio.percentProfit) ? 'public-portfolio-positive' : 'public-portfolio-negative']">
                        {{ portfolio.percentProfit }}%
                    </span>
                </div>
                <div class="margRAuto">
                    <div class="public-portfolio-item__footer-title">Доходность</div>
                    <span :class="[isPositive(portfolio.yearYield) ? 'public-portfolio-positive' : 'public-portfolio-negative']">
                        {{ portfolio.yearYield }}%
                    </span>
                </div>
                <div class="public-portfolio-item__footer-social" @click.stop>
                    <div class="public-portfolio-item__footer-referrals" title="Количество подписчиков">
                        {{ portfolio.referralsPaidCountWithPrevious | friendlyNumber }}
                    </div>
                    <div :class="['public-portfolio-item__footer-like', alreadyVoted(1) ? 'active' : '']" @click="vote(1)">{{ portfolio.likes | friendlyNumber }}</div>
                    <div :class="['public-portfolio-item__footer-dislike', alreadyVoted(-1) ? 'active' : '']" @click="vote(-1)">{{ portfolio.dislikes | friendlyNumber }}</div>
                </div>
            </div>
        </div>
    `
})
export class PublicPortfolioItem extends UI {

    @MainStore.Getter
    private clientInfo: ClientInfo;
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
        return ChartUtils.convertToDotsWithStartPoint(chartData, "amount", false);
    }

    private vote(vote: number): void {
        this.$emit("vote", {id: this.portfolio.id, vote: vote} as PortfolioVote);
    }

    private alreadyVoted(vote: number): boolean {
        return this.portfolio.voteHistory?.value === vote;
    }

    private isPositive(value: string): boolean {
        return Number(value) >= 0;
    }

    private get shortDescription(): string {
        if (this.portfolio.description) {
            return this.portfolio.description?.length > 80 ? `${this.portfolio.description.substr(0, 77)}...` : this.portfolio.description;
        }
        return this.portfolio.name;
    }

    private get verification(): boolean {
        return this.portfolio.verified;
    }
}
