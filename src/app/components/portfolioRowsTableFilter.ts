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
import {Storage} from "../platform/services/storage";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <table-filter-base @search="$emit('update:search', $event)" :search-label="searchLabel" :min-length="0" :is-default="isDefaultFilter">
            <v-switch v-model="filter.hideSoldRows" @change="onChange">
                <template #label>
                    <span>Скрыть проданные</span>
                    <v-tooltip content-class="custom-tooltip-wrap" bottom>
                        <sup class="custom-tooltip" slot="activator">
                            <v-icon>fas fa-info-circle</v-icon>
                        </sup>
                        <span>
                            Включите, если хотите скрыть проданные позиции
                        </span>
                    </v-tooltip>
                </template>
            </v-switch>
        </table-filter-base>
    `,
    components: {TableFilterBase}
})
export class PortfolioRowsTableFilter extends UI {

    @Inject
    private storageService: Storage;
    /** Ключ для хранения состояния */
    @Prop({required: true, type: String})
    private storeKey: string;
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: PortfolioRowFilter;
    /** Плэйсхолдер строки поиска */
    private searchLabel = "Поиск по Названию/Тикеру бумаги, Текущей цене и Доходности";

    private onChange(): void {
        this.$emit("update:filter", this.filter);
        this.storageService.set(this.storeKey, this.filter);
    }

    private get isDefaultFilter(): boolean {
        return this.filter.hideSoldRows === false;
    }
}

export interface PortfolioRowFilter {
    hideSoldRows?: boolean;
}
