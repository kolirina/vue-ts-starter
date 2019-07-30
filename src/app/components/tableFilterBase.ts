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
import {Prop, UI} from "../app/ui";

@Component({
    // language=Vue
    template: `
        <div :class="['portfolio-rows-filter', isDateFilterShow ? 'section-with-pickers' : '']">
            <span v-if="!isDefault" class="custom-filter" title="Настроен фильтр"></span>
            <v-menu v-model="menu" :close-on-content-click="false" :nudge-width="294" :nudge-bottom="40" bottom>
                <v-btn slot="activator" round :class="['portfolio-rows-filter__button', isDateFilterShow ? 'mr-3' : '']">
                    Фильтры
                    <span class="portfolio-rows-filter__button__icon"></span>
                </v-btn>

                <v-card class="portfolio-rows-filter__settings" style="box-shadow: none !important;">
                    <slot></slot>
                </v-card>
            </v-menu>
            <v-layout v-if="isDateFilterShow" class="picker-section">
                <v-menu :close-on-content-click="true" v-model="startMenuValue"
                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                    <v-text-field slot="activator" v-model="start" label="Начальная дата" readonly class="mr-3" clearable
                                  @click:clear="startChanged('')"></v-text-field>
                    <v-date-picker v-model="start" :no-title="true" locale="ru" :first-day-of-week="1" @input="startChanged"></v-date-picker>
                </v-menu>
                <v-menu :close-on-content-click="true" v-model="endMenuValue"
                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                    <v-text-field slot="activator" v-model="end" label="Конечная дата" readonly clearable
                                  @click:clear="endChanged('')"></v-text-field>
                    <v-date-picker v-model="end" :no-title="true" locale="ru" :first-day-of-week="1" @input="endChanged"></v-date-picker>
                </v-menu>
            </v-layout>
            <v-layout class="search-section" align-center>
                <v-icon @click.native="toggleSearch">search</v-icon>
                <v-slide-x-transition>
                    <v-text-field v-if="showSearch" :value="searchQueryMutated" @input="onSearch" @click:clear="onClear" @blur="hideInput"
                                :label="searchLabel" single-line hide-details autofocus></v-text-field>
                </v-slide-x-transition>
            </v-layout>
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

    @Prop({default: false, type: Boolean})
    private isDateFilterShow: boolean;
    /** Поисковая строка */
    @Prop({default: "", type: String})
    private searchQuery: string;

    @Prop({default: "", type: String})
    private startDate: string;

    @Prop({default: "", type: String})
    private endDate: string;
    /** Строка для работы внутри компонента */
    private searchQueryMutated: string = "";
    private menu = false;
    private showSearch = false;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    private start: string = null;
    private end: string = null;
    private startMenuValue: boolean = false;
    private endMenuValue: boolean = false;

    created(): void {
        this.searchQueryMutated = this.searchQuery;
        this.showSearch = !!this.searchQueryMutated;
        this.start = this.startDate;
        this.end = this.endDate;
    }

    @Watch("startDate")
    private startDateChanged(): void {
        this.start = this.startDate;
    }

    @Watch("endDate")
    private endDateChanged(): void {
        this.end = this.endDate;
    }

    private startChanged(date: string): void {
        this.start = date;
        this.$emit("startDateChanged", this.start);
    }

    private endChanged(date: string): void {
        this.end = date;
        this.$emit("endDateChanged", this.end);
    }

    @Watch("searchQuery")
    private setSearchData(): void {
        this.searchQueryMutated = this.searchQuery;
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
