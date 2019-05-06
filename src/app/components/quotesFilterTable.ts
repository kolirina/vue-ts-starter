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
import {Prop, UI, Watch} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <v-layout align-center class="pl-3 quotes-filter-wrap">
            <div class="pl-3">
                <v-menu :close-on-content-click="false" bottom nudge-bottom="37" content-class="filters-quotes-table">
                    <v-btn slot="activator" round class="portfolio-rows-filter__button">
                        Фильтры
                        <span class="portfolio-rows-filter__button__icon"></span>
                    </v-btn>

                    <v-card class="px-2">
                        <v-switch v-model="showUserShares" @change="onChange">
                            <template #label>
                                <span class="fs13">Показать мои бумаги</span>
                                <v-tooltip content-class="custom-tooltip-wrap" bottom>
                                    <sup class="custom-tooltip" slot="activator">
                                        <v-icon>fas fa-info-circle</v-icon>
                                    </sup>
                                    <span>
                                        Включите, если хотите увидеть только свои бумаги
                                    </span>
                                </v-tooltip>
                            </template>
                        </v-switch>
                    </v-card>
                </v-menu>
            </div>
            <v-btn fab small depressed @click="visibleSearchPlace">
                <v-icon>search</v-icon>
            </v-btn>
            <v-slide-x-transition>
                <div class="search-place-wrap" v-if="searchOpen">
                    <inplace-input @input="tableSearch" :placeholder="placeholder" :value="searchQuery"></inplace-input>
                </div>
            </v-slide-x-transition>
        </v-layout>
    `
})
export class QuotesFilterTable extends UI {

    @Prop({required: true})
    private searchQuery: string;
    @Prop({required: false, default: ""})
    private placeholder: string;
    @Prop({required: false, default: false})
    private showUserSharesValue: boolean;

    private searchOpen: boolean = false;

    private showUserShares: boolean = this.showUserSharesValue;

    @Watch("showUserSharesValue")
    private onSwitchChange(): void {
        this.showUserShares = this.showUserSharesValue;
    }

    private onChange(): void {
        this.$emit("changeShowUserShares", this.showUserShares);
    }

    private visibleSearchPlace(): void {
        this.searchOpen = !this.searchOpen;
    }

    private tableSearch(searchValue: string): void {
        this.$emit("input", searchValue);
    }
}
