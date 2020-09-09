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
import {namespace} from "vuex-class";
import {Component, UI, Watch} from "../../app/ui";
import {ClientInfo} from "../../services/clientService";
import {OnBoardingTourService, OnBoardTour, TourEvent, TourEventType, TourStep, UserOnBoardTours} from "../../services/onBoardingTourService";
import {EventType} from "../../types/eventType";
import {RouteMeta} from "../../types/router/types";
import {Portfolio} from "../../types/types";
import {StoreType} from "../../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-tour name="intro" :steps="tourSteps">
            <template slot-scope="tour">
                <transition name="fade">
                    <v-step v-if="tour.currentStep === index"
                            v-for="(step, index) of tour.steps"
                            :key="index"
                            :step="step"
                            :previous-step="tour.previousStep"
                            :next-step="tour.nextStep"
                            :stop="tour.stop"
                            :is-first="tour.isFirst"
                            :is-last="tour.isLast"
                            :labels="tour.labels">
                        <template>
                            <slot name="content">
                                <div class="v-step__content">
                                    <div v-html="step.content"></div>
                                </div>
                            </slot>
                        </template>
                        <template>
                            <div slot="actions">
                                <div class="buttons" v-if="!step.params.hideButtons">
                                    <button v-if="hasMore" @click="skipOnBoarding" class="btn btn-primary">Пропустить</button>
                                    <button v-if="isLastStep" @click="doneOnBoarding" class="btn btn-primary">Понятно</button>
                                    <button v-else-if="hasMore" @click="nextStep" class="btn btn-primary">Далее</button>
                                </div>
                            </div>
                        </template>
                    </v-step>
                </transition>
            </template>
        </v-tour>`
})

export class Tours extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Getter
    private clientInfo: ClientInfo;
    @Inject
    private onBoardingTourService: OnBoardingTourService;
    /** Набор шагов для текущего тура */
    private tourSteps: TourStep[] = [];
    /** Название текущего тура */
    private tourName: string = null;
    /** Набор пользовательских туров (которые он уже мог пройти) */
    private userOnBoardings: UserOnBoardTours = null;

    /**
     * Получает набор пользовательских туров
     */
    created(): void {
        this.userOnBoardings = this.onBoardingTourService.getOnBoardingTours();
        UI.on(EventType.TOUR_EVENT, this.onTourEvent);
    }

    /**
     * Отписывается от события
     */
    beforeDestroy(): void {
        UI.off(EventType.TOUR_EVENT);
    }

    /**
     * Следит за изменением портфеля и создает туры
     */
    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        if (!this.clientInfo.user.needShowTour) {
            return;
        }
        await this.reInitTours();
    }

    /**
     * Следит за изменением роутинга и создает туры
     */
    @Watch("$route", {immediate: true, deep: true})
    private async onRouteUpdate(): Promise<void> {
        if (!this.clientInfo.user.needShowTour) {
            return;
        }
        await this.reInitTours();
    }

    /**
     * Обрабатывает событие для взаимодействия на текущий тур
     * @param event событие с данными
     */
    private async onTourEvent(event: TourEvent): Promise<void> {
        if (!this.clientInfo.user.needShowTour) {
            return;
        }
        switch (event.type) {
            case TourEventType.DONE:
                await this.doneOnBoarding();
                break;
            case TourEventType.SKIP:
                await this.skipOnBoarding();
                break;
        }
        this.stop();
    }

    /**
     * Переинициализирует туры учитывая текущий портфель
     */
    private async reInitTours(): Promise<void> {
        this.stop();
        this.tourSteps = [];
        this.tourName = null;
        const currentRoute = this.$router.currentRoute;
        const meta: RouteMeta = currentRoute.meta;
        if (meta.tourName) {
            const tabName = currentRoute.params.tab ?? "";
            this.tourName = `${meta.tourName}${tabName ? "_" + tabName : ""}`;
            if (currentRoute.params.combined === "combined") {
                this.tourName = "combined_portfolio";
            }
            this.tourSteps = await this.onBoardingTourService.getTourSteps(this.tourName, this.portfolio.overview);
            if (this.tourSteps.length) {
                this.start();
            }
        }
    }

    /**
     * Запускает тур
     */
    private start(): void {
        setTimeout(() => this.$tours["intro"].start(), 1000);
    }

    /**
     * Останавливает тур (если он был ранее запущен)
     */
    private stop(): void {
        if (!this.$tours["intro"]) {
            return;
        }
        this.$tours["intro"].stop();
    }

    /**
     * Осуществляет переход к следующему шагу
     */
    private nextStep(): void {
        this.$tours["intro"].nextStep();
    }

    /**
     * Возвращает признак последнего шага
     */
    private get isLastStep(): boolean {
        return this.$tours["intro"].isLast;
    }

    /**
     * Завершает тур
     */
    private async doneOnBoarding(): Promise<void> {
        const tour = this.getTour();
        tour.complete = true;
        await this.onBoardingTourService.saveOrUpdateOnBoardTour(tour);
        this.stop();
    }

    /**
     * Пропускает тут
     */
    private async skipOnBoarding(): Promise<void> {
        const tour = this.getTour();
        tour.skipped = true;
        await this.onBoardingTourService.saveOrUpdateOnBoardTour(tour);
        this.stop();
    }

    /**
     * Возвращает тур пользователя (если он есть) или создает новый
     */
    private getTour(): OnBoardTour {
        let tour: OnBoardTour = this.userOnBoardings[this.tourName];
        if (!tour) {
            tour = {
                name: this.tourName,
                currentStep: this.$tours["intro"].currentStep,
                totalSteps: this.$tours["intro"].numberOfSteps,
                complete: false,
                skipped: false
            };
        }
        return tour;
    }

    /**
     * Возвращает признак что в туре есть еще доступные шаги
     */
    private get hasMore(): boolean {
        return this.$tours["intro"].numberOfSteps - 1 !== this.$tours["intro"].currentStep;
    }
}
