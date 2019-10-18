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

import {Component, Prop, UI} from "../app/ui";
import {AssetCategory} from "../services/assetService";
import {AssetQuotesFilter} from "../services/marketService";
import {CommonUtils} from "../utils/commonUtils";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <v-layout align-center class="pl-2">
            <table-filter-base @search="onSearch" :search-query="filter.searchQuery" :search-label="placeholder" :min-length="minLength" :is-default="isDefaultFilter">
                <div class="trades-filter">
                    <div class="trades-filter__label">Категория актива</div>
                    <div class="trades-filter__operations">
                        <v-switch v-for="category in categories" @change="onCategoryChange($event, category)" :label="category.description"
                                  v-model="filter.categories.includes(category)" :key="category.enumName">
                        </v-switch>
                    </div>
                </div>
            </table-filter-base>
        </v-layout>
    `,
    components: {TableFilterBase}
})
export class CommonAssetQuotesFilter extends UI {

    @Prop({required: false, default: ""})
    private placeholder: string;
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: AssetQuotesFilter;
    /** Минимальная длина поиска */
    @Prop({required: false, type: Number, default: 0})
    private minLength: number;

    private categories = AssetCategory.values();

    private onCategoryChange(checked: boolean, category: AssetCategory): void {
        if (checked) {
            this.filter.categories.push(category);
        } else {
            this.filter.categories = this.filter.categories.filter(operation => operation !== category);
        }
        this.emitFilterChange();
    }

    private onSearch(searchQuery: string): void {
        this.$emit("input", searchQuery);
    }

    private get isDefaultFilter(): boolean {
        return this.filter.categories.length === this.categories.length && CommonUtils.isBlank(this.filter.searchQuery);
    }

    private emitFilterChange(): void {
        // todo assets сохранение фильтра
        this.$emit("filter", this.filter);
    }
}
