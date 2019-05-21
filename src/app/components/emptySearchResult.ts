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
        <v-layout align-center justify-center column class="pb-5">
            <div>
                <v-img src="./img/common/no-result-search.svg" width="39" heigth="45"></v-img>
            </div>
            <div class="fs14 mt-3">
                Ничего не найдено
            </div>
            <div class="margT30">
                <v-btn color="#EBEFF7" @click="resetFilter">
                    Сбросить фильтры
                </v-btn>
            </div>
        </v-layout>
    `
})
export class EmptySearchResult extends UI {
    private resetFilter(): void {
        this.$emit("resetFilter");
    }
}
