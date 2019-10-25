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

import {Inject} from "typescript-ioc";
import {Component, Prop, UI} from "../app/ui";
import {FiltersService} from "../services/filtersService";
import {QuotesFilter} from "../services/marketService";
import {StoreKeys} from "../types/storeKeys";
import {CurrencyUnit} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <v-layout align-center class="pl-2">
            <table-filter-base @search="onSearch" :search-query="filter.searchQuery" :search-label="placeholder" :min-length="minLength" :is-default="isDefaultFilter">
                <div class="trades-filter">
                    <div class="trades-filter__label mb-0">Валюта бумаги</div>
                    <div class="trades-filter__currencies">
                        <v-select :items="currencyList" v-model="filter.currency" label="Валюта бумаги" @change="onCurrencyChange">
                            <template #append-outer>
                                <v-icon small @click="resetCurrency">clear</v-icon>
                            </template>
                        </v-select>
                    </div>

                    <div class="trades-filter__label">Категория актива</div>
                    <div class="trades-filter__operations">
                        <v-switch v-model="filter.showUserShares" @change="onChange">
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
                    </div>
                </div>
            </table-filter-base>
        </v-layout>
    `,
    components: {TableFilterBase}
})
export class QuotesFilterTable extends UI {

    @Prop({required: false, default: ""})
    private placeholder: string;
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: QuotesFilter;
    /** Минимальная длина поиска */
    @Prop({required: false, type: Number, default: 0})
    private minLength: number;
    /** Ключ для хранения состояния */
    @Prop({required: true, type: String})
    private storeKey: StoreKeys;
    @Inject
    private filtersService: FiltersService;

    /** Список валют */
    private currencyList = CurrencyUnit.values().map(c => c.code);

    private onChange(): void {
        this.$emit("changeShowUserShares", this.filter.showUserShares);
        this.saveFilter();
    }

    private onSearch(searchQuery: string): void {
        this.$emit("input", searchQuery);
        this.saveFilter();
    }

    private onCurrencyChange(): void {
        this.$emit("filter", this.filter);
        this.saveFilter();
    }

    private resetCurrency(): void {
        this.filter.currency = null;
        this.$emit("filter", this.filter);
        this.saveFilter();
    }

    private saveFilter(): void {
        this.filtersService.saveFilter(this.storeKey, this.filter);
    }

    private get isDefaultFilter(): boolean {
        return (!CommonUtils.exists(this.filter.showUserShares) || this.filter.showUserShares === false) && CommonUtils.isBlank(this.filter.searchQuery)
            && !CommonUtils.exists(this.filter.currency);
    }
}
