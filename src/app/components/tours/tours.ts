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
import Component from "vue-class-component";
import {UI} from "../../app/ui";

const INTRO_STEPS: TourStep[] = [
    {
        target: `[data-v-step="0"]`,
        content: "Добро пожаловать в Intelinvest - сервис учёта и контроля инвестиций. Это основное меню, после импорта здесь у вас появятся главные" +
        "показатели вашего портфеля (прибыль, доходность и пр.) Чтобы начать заполнять свой портфель, кликните на эту кнопку и загрузите отчёт о сделках вашего брокера.",
        params: {
            placement: "top"
        }
    },
    {
        target: `[data-v-step="1"]`,
        content: "Выберите иконку вашего брокера.",
        params: {
            placement: "bottom"
        }
    },
    {
        target: `[data-v-step="2"]`,
        content: "Ознакомьтесь с инструкцией по скачиванию отчета вашего брокера в корректном формате и с видео инструкцией по импорту сделок." +
        "Далее загрузите отчет брокера использовав кнопку выбора файла или просто перетащите нужный файл в зону загрузки.",
        params: {
            placement: "top"
        }
    },
    {
        target: `[data-v-step="3"]`,
        content: "Если после загрузки отчета вы увидели ошибку импорта - вероятнее всего вы загрузили отчет в неверном формате." +
        "Перечитайте пожалуйста инструкцию по скачиванию отчета брокера на странице Настройки - Импорт сделок или обратитесь в техподдержку.",
        params: {
            placement: "right"
        }
    },
    {
        target: `[data-v-step="4"]`,
        content: "Если после загрузки отчета вы увидели список ошибок - ознакомьтесь пожалуйста с причинами их возникновения в инструкции на" +
        "странице импорта или обратитесь в техподдержку.",
        params: {
            placement: "right"
        }
    },
    {
        target: `[data-v-step="5"]`,
        content: "Если ваши остатки по валютам после импорта отчета не совпадают с реальными, их необходимо скорректировать. Ввести актуальные остатки вы можете в данной форме",
        params: {
            placement: "left"
        }
    },
    {
        target: `[data-v-step="6"]`,
        content: "Для просмотра результатов импорта отчета, перейдите в Портфель",
        params: {
            placement: "right"
        }
    },
    {
        target: `[data-v-step="7"]`,
        content: "Если вам необходимо добавить какую-либо сделку вручную, это можно сделать кликнув на иконку Плюсика. В данном диалоговом окне вы сможете внести сделки по купле/продаже акций и облигаций, купону, дивиденду, амортизации, расходу, доходу, внесению, списанию денег, конвертации валют.",
        params: {
            placement: "right"
        }
    },
    {
        target: `[data-v-step="8"]`,
        content: "В меню Аналитика вы найдете множество подсказок - как увеличить доходность вашего портфеля и снизить риски.",
        params: {
            placement: "right"
        }
    },
    {
        target: `[data-v-step="9"]`,
        content: "В меню Справка вы найдете все интересующие вас вопросы, а также каналы связи с техподдержкой. Желаем успехов в вашей инвестиционной деятельности!",
        params: {
            placement: "top"
        }
    }
];

@Component({
    // language=Vue
    template: `
        <v-tour name="intro" :steps="tourSteps">
            <template slot-scope="tour">
                <transition name="fade">
                    <v-step
                        v-if="tour.currentStep === index"
                        v-for="(step, index) of tour.steps"
                        :key="index"
                        :step="step"
                        :previous-step="tour.previousStep"
                        :next-step="tour.nextStep"
                        :stop="tour.stop"
                        :is-first="tour.isFirst"
                        :is-last="tour.isLast"
                        :labels="tour.labels"
                    >
                        <template>
                            <slot name="content">
                                <div class="v-step__content">
                                    <div v-html="step.content"></div>
                                </div>
                            </slot>
                        </template>
                        <template>
                            <div slot="actions">
                                <button @click="onboardingDone" class="btn btn-primary">Пропустить обучение</button>
                                <button v-if="isLastStep" @click="onboardingDone" class="btn btn-primary">Завершить обучение</button>
                                <button v-else-if="isPenultimate || isAddTradeBtnHint" @click="myCustomNextStep" class="btn btn-primary">Следющий шаг</button>
                            </div>
                        </template>
                    </v-step>
                </transition>
            </template>
        </v-tour>`
})

export class Tours extends UI {
    private tourSteps: TourStep[] = INTRO_STEPS;

    private myCustomNextStep(): void {
        this.$tours["intro"].nextStep();
    }

    private get isLastStep(): boolean {
        return this.$tours["intro"].isLast;
    }

    private onboardingDone(): void {
        this.$tours["intro"].stop();
    }

    private get isPenultimate(): boolean {
        return this.$tours["intro"].numberOfSteps - 1 === this.$tours["intro"].currentStep;
    }

    private get isAddTradeBtnHint(): boolean {
        return this.$tours["intro"].currentStep === 6;
    }
}
export interface TourStep {
    target: string;
    content: string;
    params?: TourStepParams;
}

export interface TourStepHeader {
    title: string;
}

export interface TourStepParams {
    placement?: string;
}