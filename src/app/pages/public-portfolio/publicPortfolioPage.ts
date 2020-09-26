import {Inject} from "typescript-ioc";
import {Component, UI} from "../../app/ui";
import {AdditionalPagination} from "../../components/additionalPagination";
import {PublicPortfolioItem} from "../../components/publicPortfolioItem";
import {DisableConcurrentExecution} from "../../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../../platform/decorators/showProgress";
import {Storage} from "../../platform/services/storage";
import {PortfolioService} from "../../services/portfolioService";
import {PublicPortfolio, PublicPortfolioService} from "../../services/publicPortfolioService";
import {PortfolioVote} from "../../types/eventObjects";
import {Pagination} from "../../types/types";

@Component({
    // language=Vue
    template: `
        <v-container fluid>
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">Инвестотека</div>
                </v-card-title>
            </v-card>
            <v-card flat class="template-wrapper">
                <v-slide-y-reverse-transition>
                    <div v-if="showHintPanel" class="info-block margB16">
                        Данный раздел поможет Вам быть в курсе тенденций инвестирования, узнать стратегии распределения активов успешных инвесторов,
                        а также поделиться своими идеями по ведению портфеля.<br><br>
                        Чтобы опубликовать портфель перейдите в раздел
                        <router-link :to="{name: 'portfolio-management'}">Управление портфелями</router-link>
                        → Выберете портфель, которым хотите поделиться,
                        и нажмите кнопку Опубликовать.<br>
                        <a class="big-link" @click="hideHintsPanel">Больше не показывать</a>
                    </div>
                </v-slide-y-reverse-transition>
                <additional-pagination :pagination="pagination" @update:pagination="onTablePaginationChange"></additional-pagination>
                <div class="public-portfolio-list">
                    <public-portfolio-item v-for="portfolio in publicPortfolios" :key="portfolio.id" :portfolio="portfolio" @vote="onVote"></public-portfolio-item>
                </div>
            </v-card>
        </v-container>
    `,
    components: {AdditionalPagination, PublicPortfolioItem}
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

    private pagination: Pagination = {
        page: 1,
        rowsPerPage: 20,
        totalItems: 0,
        pages: 0
    };

    /**
     * Загрузка данных компонента
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.showHintPanel = this.localStorage.get("publicPortfolioHintPanel", true);
        await this.loadPortfolios();
    }

    /**
     * Обрыбатывает событие изменения паджинации и загружает данные
     * @param pagination
     */
    @DisableConcurrentExecution
    @ShowProgress
    private async onTablePaginationChange(pagination: Pagination): Promise<void> {
        this.pagination = pagination;
        await this.loadPortfolios();
    }

    private async loadPortfolios(): Promise<void> {
        const result = await this.publicPortfolioService.getPublicPortfolios(
            this.pagination.rowsPerPage * (this.pagination.page - 1),
            this.pagination.rowsPerPage
        );
        this.publicPortfolios = result.content;
        this.pagination.totalItems = result.totalItems;
        this.pagination.pages = result.pages;
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
        const publicPortfolio = this.publicPortfolios.find(portfolio => portfolio.id === event.id);
        let needChangeVote = false;
        if (publicPortfolio?.voteHistory) {
            if (publicPortfolio.voteHistory.value === event.vote) {
                this.$snotify.warning("Ваш голос за текущий портфель уже учтен");
                return;
            } else {
                needChangeVote = true;
            }
        }
        await this.portfolioService.votePortfolio(event.id, event.vote);
        if (publicPortfolio?.voteHistory) {
            publicPortfolio.voteHistory.value = needChangeVote ? event.vote : publicPortfolio.voteHistory.value;
        } else {
            publicPortfolio.voteHistory = {value: event.vote};
        }
        if (event.vote > 0) {
            publicPortfolio.likes = publicPortfolio.likes + 1;
            publicPortfolio.dislikes = needChangeVote ? publicPortfolio.dislikes - 1 : publicPortfolio.dislikes;
        } else {
            publicPortfolio.dislikes = publicPortfolio.dislikes + 1;
            publicPortfolio.likes = needChangeVote ? publicPortfolio.likes - 1 : publicPortfolio.likes;
        }
        this.$snotify.info("Спасибо! Ваш голос учтен");
    }
}
