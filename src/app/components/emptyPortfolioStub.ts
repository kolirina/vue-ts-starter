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
import {namespace} from "vuex-class";
import {UI} from "../app/ui";
import {TourEvent, TourEventType} from "../services/onBoardingTourService";
import {EventType} from "../types/eventType";
import {Portfolio} from "../types/types";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container class="h100pc">
            <v-layout justify-center align-center column class="h100pc">
                <img src="./img/portfolio/empty-portfolio-2.svg" class="empty-portfolio-image">
                <div class="alignC mw540">
                    <div class="fs18 bold">
                        <template v-if="combinedPortfolioSelected">
                            Для начала работы сформируйте составной портфель
                        </template>
                        <template v-else>
                            Для начала работы заполните свой портфель
                        </template>
                    </div>
                    <div class="margT32 color-lite">
                        Вы можете загрузить отчет со сделками вашего брокера или завести
                        сделки самостоятельно, если знаете цены и даты покупок/продаж
                    </div>
                    <div class="margT14 center-elements">
                        <template v-if="combinedPortfolioSelected">
                            <v-btn class="btn margL12" color="#EBEFF7" @click.stop="showDialogCompositePortfolio">
                                Сформировать
                            </v-btn>
                        </template>
                        <template v-else>
                            <v-btn class="btn" color="#EBEFF7" @click="goToImport" data-v-step="0">
                                Загрузить отчет
                            </v-btn>
                            <v-btn class="btn margL12" color="#EBEFF7" to="/balances">
                                Указать остатки
                            </v-btn>
                        </template>
                    </div>
                </div>
            </v-layout>
        </v-container>
    `
})
export class EmptyPortfolioStub extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;

    private goToImport(): void {
        this.$router.push("/settings/import");
        UI.emit(EventType.TOUR_EVENT, {type: TourEventType.DONE} as TourEvent);
    }

    private showDialogCompositePortfolio(): void {
        this.$emit("openCombinedDialog");
    }

    private get combinedPortfolioSelected(): boolean {
        return this.portfolio.portfolioParams.combinedFlag;
    }
}
