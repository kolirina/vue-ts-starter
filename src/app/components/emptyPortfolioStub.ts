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
import {UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-container class="h100pc">
            <v-layout justify-center align-center column class="h100pc">
                <v-img src="./img/portfolio/empty-portfolio.svg" width="100%" heigth="100%" max-width="353" max-height="302" class="margB35"></v-img>
                <div class="alignC mw520">
                    <div class="fs16">
                        Для начала работы заполните свой портфель
                    </div>
                    <div class="fs16 alignC margT30">
                        Вы можете загрузить отчет со сделками вашего брокера или указать
                        остатки портфеля, если знаете цену или стоимость покупки бумаг.
                    </div>
                    <video-link>
                        <a>Смотреть видео инструкцию по импорту сделок</a>
                    </video-link>
                    <div class="margT20 alignC">
                        <v-btn class="btn mr-1" color="#EBEFF7" to="/settings/import" data-v-step="0">
                            Загрузить отчет
                        </v-btn>
                        <v-btn class="btn ml-3" color="#EBEFF7" to="/balances">
                            Указать остатки
                        </v-btn>
                    </div>
                </div>
            </v-layout>
        </v-container>
    `
})
export class EmptyPortfolioStub extends UI {
    created(): void {
        this.$tours["intro"].start();
    }
}
