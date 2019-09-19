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
import {OnBoardingTourService, OnBoardTour, TourStep} from "../../services/onBoardingTourService";
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
                                <div v-if="!step.params.hideButtons">
                                    <button v-if="hasMore" @click="skipOnBoarding" class="btn btn-primary">Пропустить обучение</button>
                                    <button v-if="isLastStep" @click="doneOnBoarding" class="btn btn-primary">Завершить обучение</button>
                                    <button v-else-if="hasMore" @click="nextStep" class="btn btn-primary">Следющий шаг</button>
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
    @Inject
    private onBoardingTourService: OnBoardingTourService;

    private tourSteps: TourStep[] = [];
    private tourName: string = null;

    /**
     * TODO обновление при смене портфеля (через событие)
     */
    @Watch("$route", {immediate: true, deep: true})
    async onRouteUpdate(): Promise<void> {
        this.stop();
        this.tourSteps = [];
        this.tourName = null;
        const meta: RouteMeta = this.$router.currentRoute.meta;
        if (meta.tourName) {
            this.tourName = meta.tourName;
            this.tourSteps = await this.onBoardingTourService.getTourSteps(meta.tourName, this.portfolio.overview);
            setTimeout(() => this.start(), 1000);
        }
    }

    private start(): void {
        this.$tours["intro"].start();
    }

    private stop(): void {
        if (!this.$tours["intro"]) {
            return;
        }
        this.$tours["intro"].stop();
    }

    private nextStep(): void {
        this.$tours["intro"].nextStep();
    }

    private get isLastStep(): boolean {
        return this.$tours["intro"].isLast;
    }

    private doneOnBoarding(): void {
        this.stop();
    }

    private async skipOnBoarding(): Promise<void> {
        this.stop();
        const tour: OnBoardTour = {
            name: this.tourName,
            currentStep: this.$tours["intro"].currentStep,
            isComplete: false,
            isSkipped: true
        };
        await this.onBoardingTourService.saveOnBoardTour(tour);
    }

    private get hasMore(): boolean {
        return this.$tours["intro"].numberOfSteps - 1 !== this.$tours["intro"].currentStep;
    }

    private get isEmptyPortfolio(): boolean {
        return this.portfolio && this.portfolio.overview.totalTradesCount === 0;
    }
}