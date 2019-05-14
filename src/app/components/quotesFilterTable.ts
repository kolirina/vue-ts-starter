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
import {Prop, UI} from "../app/ui";
import {QuotesFilter} from "../services/marketService";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <v-layout align-center class="pl-2">
            <table-filter-base @search="onSearch" :search-query="filter.searchQuery" :search-label="placeholder" :min-length="2" :is-default="filter.showUserShares">
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

    private onChange(): void {
        this.$emit("changeShowUserShares", this.filter.showUserShares);
    }

    private onSearch(searchQuery: string): void {
        this.$emit("input", searchQuery);
    }
}
