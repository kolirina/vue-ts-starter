import {Inject} from "typescript-ioc";
import {Component, UI} from "../../app/ui";
import {PublicPortfolioItem} from "../../components/publicPortfolioItem";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {PortfolioService} from "../../services/portfolioService";
import {PublicPortfolio, PublicPortfolioService} from "../../services/publicPortfolioService";
import {PortfolioVote} from "../../types/eventObjects";

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
                    Данный раздел поможет Вам быть в курсе тенденций инвестирования, узнать стратегии распределения активов успешных инвесторов,
                    а также поделиться своими идеями по ведению портфеля.<br><br>
                    Чтобы опубликовать портфель перейдите в раздел
                    <router-link :to="{name: 'portfolio-management'}">Управление портфелями</router-link> → Выберете портфель, которым хотите поделиться,
                    и нажмите кнопку Опубликовать.<br>
                    <a class="big-link" @click="hideHintsPanel">Больше не показывать</a>
                </div>
                <div class="public-portfolio-list">
                    <public-portfolio-item v-for="portfolio in publicPortfolios" :key="portfolio.id" :portfolio="portfolio" @vote="onVote"></public-portfolio-item>
                </div>
            </v-card>
        </v-container>
    `,
    components: {PublicPortfolioItem}
})
export class PublicPortfolioPage extends UI {

    @Inject
    private localStorage: Storage;
    @Inject
    private publicPortfolioService: PublicPortfolioService;
    @Inject
    private portfolioService: PortfolioService;
    /** Публичные портфели */
    private publicPortfolios: PublicPortfolio[] = null;
    /** Признак отображения панели с подсказкой */
    private showHintPanel = true;

    /**
     * Загрузка данных компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.showHintPanel = this.localStorage.get("publicPortfolioHintPanel", true);
        this.publicPortfolios = await this.publicPortfolioService.getPublicPortfolios();
    }

    /** Скрывает панель с подсказкой */
    private hideHintsPanel(): void {
        this.localStorage.set("publicPortfolioHintPanel", false);
        this.showHintPanel = false;
    }

    /**
     * Отправляет запрос голосования за портфель
     * @param event событие
     */
    @ShowProgress
    private async onVote(event: PortfolioVote): Promise<void> {
        await this.portfolioService.votePortfolio(event.id, event.vote);
        const publicPortfolio = this.publicPortfolios.find(portfolio => portfolio.id === event.id);
        if (event.vote > 0) {
            publicPortfolio.likes = publicPortfolio.likes + 1;
        } else {
            publicPortfolio.dislikes = publicPortfolio.dislikes + 1;
        }
    }
}
