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
import {Watch} from "vue-property-decorator";
import {DateUtils} from "../utils/dateUtils";
import {Prop, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div class="portfolio-rows-filter">
            <span v-if="!isDefault" class="custom-filter" title="Настроен фильтр"></span>
            <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="294" :nudge-bottom="40" bottom>
                <v-btn slot="activator" round class="portfolio-rows-filter__button">
                    Фильтры
                    <span class="portfolio-rows-filter__button__icon"></span>
                </v-btn>

                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                    <slot></slot>
                </v-card>
            </v-menu>
            <v-icon @click.native="toggleSearch">search</v-icon>
            <v-slide-x-transition>
                <v-text-field v-if="showSearch" :value="searchQueryMutated" @input="onSearch" @click:clear="onClear" @blur="hideInput"
                              :label="searchLabel" single-line hide-details autofocus></v-text-field>
            </v-slide-x-transition>
            <v-menu ref="dateMenu" :close-on-content-click="true" v-model="dateMenuValue" :nudge-right="40" :return-value.sync="date"
                    lazy transition="scale-transition" offset-y full-width min-width="290px">
                <v-text-field name="date" slot="activator" v-model="date" label="Начальная дата" v-validate="'required'"
                              readonly></v-text-field>
                <v-date-picker v-model="date" :no-title="true" locale="ru" :first-day-of-week="1" @input="onDateSelected"></v-date-picker>
            </v-menu>
        </div>
    `
})
export class TableFilterBase extends UI {

    /** Подсказка поисковой строки */
    @Prop({required: false, type: String, default: "Поиск"})
    private searchLabel: string;
    /** Минимальная длина поиска */
    @Prop({required: false, type: Number, default: 0})
    private minLength: number;
    /** Признак дефолтного фильтра */
    @Prop({default: false, type: Boolean})
    private isDefault: boolean;
    /** Поисковая строка */
    @Prop({default: "", type: String})
    private searchQuery: string;
    /** Строка для работы внутри компонента */
    private searchQueryMutated: string = "";
    private menu = false;
    private showSearch = false;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    private dateMenuValue = false;
    private date = DateUtils.currentDate();

    created(): void {
        this.searchQueryMutated = this.searchQuery;
        this.showSearch = !!this.searchQueryMutated;
    }

    @Watch("searchQuery")
    private setSearchData(): void {
        this.searchQueryMutated = this.searchQuery;
    }

    private onDateSelected(date: string): void {
        console.log(date);
    }

    private onSearch(value: string): void {
        this.searchQueryMutated = value;
        clearTimeout(this.currentTimer);
        this.currentTimer = setTimeout((): void => {
            if (!this.searchQueryMutated.length) {
                this.emitClear();
            } else if (this.searchQueryMutated.length >= this.minLength) {
                this.emitSearch();
            }
        }, 1000);
    }

    private onClear(): void {
        this.emitClear();
    }

    private emitSearch(): void {
        this.$emit("search", this.searchQueryMutated);
    }

    private emitClear(): void {
        this.$emit("search", "");
    }

    private toggleSearch(): void {
        this.showSearch = !this.showSearch;
    }

    private hideInput(): void {
        this.showSearch = this.searchQueryMutated.length !== 0;
    }
}
