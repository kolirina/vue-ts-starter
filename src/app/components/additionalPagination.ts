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
        <v-layout class="up-pagination" justify-end align-center>
            <div class="pagination-info">
                {{ getStartRowsOnPage }} - {{ getEndRowsOnPage }} из {{ totalItems }}
            </div>
            <v-pagination v-model="pagination.page" @input="onPageChange" :length="pages"></v-pagination>
        </v-layout>
    `
})
export class AdditionalPagination extends UI {

    @Prop({required: true})
    private page: number;
    @Prop({required: true})
    private rowsPerPage: number;
    @Prop({required: true})
    private totalItems: number;
    @Prop({required: true})
    private pages: number;

    private pagination: Pagination = {
        page: this.page,
        rowsPerPage: this.rowsPerPage,
        totalItems: this.totalItems
    };

    private get getStartRowsOnPage(): string {
        return `${this.page * this.rowsPerPage - this.rowsPerPage + 1}`;
    }

    private get getEndRowsOnPage(): string {
        return `${this.page * this.rowsPerPage > this.totalItems ? this.totalItems : this.page * this.rowsPerPage}`;
    }

    private onPageChange(): void {
        this.$emit("paginationChange", this.pagination.page);
    }
}
