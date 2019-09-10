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

export class Tours {

    static readonly INTRO_STEPS: TourStep[] = [
        {
            target: `[data-v-step="0"]`,
            content: "Добро пожаловать в Intelinvest - сервис учёта и контроля инвестиций. Это основное меню, после импорта здесь у вас появятся главные показатели вашего портфеля (прибыль, доходность и пр.) Чтобы начать заполнять свой портфель, кликните на эту кнопку и загрузите отчёт о сделках вашего брокера.",
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
            content: "Ознакомьтесь с инструкцией по скачиванию отчета вашего брокера в корректном формате и с видео инструкцией по импорту сделок.",
            params: {
                placement: "top"
            }
        },
        {
            target: `[data-v-step="3"]`,
            content: "Шаг хинт на плюсик",
            params: {
                placement: "right"
            }
        },
        {
            target: `[data-v-step="4"]`,
            content: "В меню Аналитика вы найдете множество подсказок - как увеличить доходность вашего портфеля и снизить риски.",
            params: {
                placement: "right"
            }
        },
        {
            target: `[data-v-step="5"]`,
            content: "В меню Справка вы найдете все интересующие вас вопросы, а также каналы связи с техподдержкой. Желаем успехов в вашей инвестиционной деятельности!",
            params: {
                placement: "top"
            }
        }
    ];
}

export interface TourStep {
    target: string;
    content: string;
    params?: TourStepParams;
}

export interface TourStepParams {
    placement?: string;
}