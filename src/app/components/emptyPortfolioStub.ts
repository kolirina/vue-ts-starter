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
import {TourEvent, TourEventType} from "../services/onBoardingTourService";
import {EventType} from "../types/eventType";

@Component({
    // language=Vue
    template: `
        <v-container class="h100pc">
            <v-layout justify-center align-center column class="h100pc">
                <img src="./img/portfolio/empty-portfolio-2.svg" class="margB32 maxW100">
                <div class="alignC mw540">
                    <div class="fs18 bold">
                        Для начала работы заполните свой портфель
                    </div>
                    <div class="margT32 color-lite">
                        Вы можете загрузить отчет со сделками вашего брокера или завести
                        сделки самостоятельно, если знаете цены и даты покупок/продаж
                    </div>
                    <div class="margT14 center-elements">
                        <v-btn class="btn" color="#EBEFF7" @click="goToImport" data-v-step="0">
                            Загрузить отчет
                        </v-btn>
                        <v-btn class="btn margL12" color="#EBEFF7" to="/balances">
                            Указать остатки
                        </v-btn>
                    </div>
                </div>
            </v-layout>
        </v-container>
    `
})
export class EmptyPortfolioStub extends UI {

    private goToImport(): void {
        this.$router.push("/settings/import");
        UI.emit(EventType.TOUR_EVENT, {type: TourEventType.DONE} as TourEvent);
    }
}
