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
import {Pagination} from "../types/types";

@Component({
    // language=Vue
    template: `
        <v-layout v-if="pagination" class="up-pagination" justify-end align-center>
            <div class="pagination-info">
                {{ getStartRowsOnPage }} - {{ getEndRowsOnPage }} из {{ pagination.totalItems }}
            </div>
            <v-pagination v-model="pagination.page" @input="onPageChange" :length="pagination.pages"></v-pagination>
        </v-layout>
    `
})
export class AdditionalPagination extends UI {

    /** Паджинация */
    @Prop({required: true})
    private pagination: Pagination;

    /**
     * Возвращает начальный номер строки
     */
    private get getStartRowsOnPage(): string {
        return `${this.pagination.page * this.pagination.rowsPerPage - this.pagination.rowsPerPage + 1}`;
    }

    /**
     * Возвращает конечный номер строки
     */
    private get getEndRowsOnPage(): string {
        return `${this.pagination.page * this.pagination.rowsPerPage > this.pagination.totalItems ?
            this.pagination.totalItems : this.pagination.page * this.pagination.rowsPerPage}`;
    }

    private onPageChange(): void {
        this.$emit("update:pagination", this.pagination);
    }
}
