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
import {TradesFilter} from "../services/tradeService";
import {Operation} from "../types/operation";
import {TradeListType} from "../types/tradeListType";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <v-layout align-center>
            <table-filter-base @search="onSearch" :search-query="filter.search" :search-label="searchLabel" :min-length="2" :is-default="isDefault">
                <v-switch v-model="filter.showLinkedMoneyTrades" @change="onChange" class="margT0">
                    <template #label>
                        <span>Связанные сделки</span>
                    </template>
                </v-switch>

                <div class="trades-filter">
                    <div class="trades-filter__label">Тип списка</div>
                    <v-radio-group v-model="filter.listType" @change="onListTypeChange" style="margin-top: 15px !important;" column>
                        <v-radio v-for="listType in listTypes" :label="listType.description" :value="listType" :key="listType.enumName"></v-radio>
                    </v-radio-group>

                    <div class="trades-filter__label">Тип операции сделок</div>
                    <div class="trades-filter__operations">
                        <v-switch v-for="op in operations" @change="onOperationChange($event, op)" :disabled="!operationEnabled(op)" :label="operationLabel(op)"
                                v-model="filter.operation.includes(op)" :key="op.enumName">
                        </v-switch>
                    </div>
                </div>
            </table-filter-base>
            <v-layout>
                <v-menu ref="startDateMenuValue" :close-on-content-click="true" v-model="startDateMenuValue" :nudge-right="40"
                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                    <v-text-field slot="activator" v-model="filter.start" label="Начальная дата" readonly class="mr-3"></v-text-field>
                    <v-date-picker v-model="filter.start" :no-title="true" locale="ru" :first-day-of-week="1" @input="onStartDateSelected"></v-date-picker>
                </v-menu>
                <v-menu ref="endDateMenuValue" :close-on-content-click="true" v-model="endDateMenuValue" :nudge-right="40"
                        lazy transition="scale-transition" offset-y full-width min-width="290px">
                    <v-text-field slot="activator" v-model="filter.end" label="Конечная дата" readonly></v-text-field>
                    <v-date-picker v-model="filter.end" :no-title="true" locale="ru" :first-day-of-week="1" @input="onEndDateSelected"></v-date-picker>
                </v-menu>
            </v-layout>
        </v-layout>
    `,
    components: {TableFilterBase}
})
export class TradesTableFilter extends UI {

    /** Операции загружаемые по умполчанию */
    static readonly DEFAULT_OPERATIONS = [Operation.BUY, Operation.DIVIDEND, Operation.SELL, Operation.INCOME, Operation.COUPON, Operation.LOSS, Operation.AMORTIZATION];
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: TradesFilter;
    /** Признак дефолтного фильтра */
    @Prop({default: false, type: Boolean})
    private isDefault: boolean;
    /** Плэйсхолдер строки поиска */
    private searchLabel = "Поиск по названию бумаги, по тикеру бумаги, по заметке к сделке";
    /** Список типов */
    private listTypes = [TradeListType.FULL, TradeListType.STOCK, TradeListType.BOND, TradeListType.MONEY];
    /** Список операций */
    private operations: Operation[] = TradesTableFilter.DEFAULT_OPERATIONS;
    private startDateMenuValue = false;
    private endDateMenuValue = false;

    private onStartDateSelected(date: string): void {
        this.filter.start = date;
        this.emitFilterChange();
    }

    private onEndDateSelected(date: string): void {
        this.filter.end = date;
        this.emitFilterChange();
    }

    private onChange(): void {
        this.emitFilterChange();
    }

    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.search = searchQuery;
        this.emitFilterChange();
    }

    private onListTypeChange(): void {
        this.filter.operation = this.getDefaultOperations();
        this.emitFilterChange();
    }

    private onOperationChange(checked: boolean, op: Operation): void {
        if (checked) {
            this.filter.operation.push(op);
        } else {
            this.filter.operation = this.filter.operation.filter(operation => operation !== op);
        }
        this.emitFilterChange();
    }

    private getDefaultOperations(): Operation[] {
        switch (this.filter.listType) {
            case TradeListType.FULL:
                return [...TradesTableFilter.DEFAULT_OPERATIONS];
            case TradeListType.STOCK:
                return [Operation.BUY, Operation.SELL, Operation.DIVIDEND];
            case TradeListType.BOND:
                return [Operation.BUY, Operation.SELL, Operation.COUPON, Operation.AMORTIZATION];
            case TradeListType.MONEY:
                return [Operation.BUY, Operation.SELL, Operation.INCOME, Operation.LOSS];
        }
        return [...TradesTableFilter.DEFAULT_OPERATIONS];
    }

    private operationEnabled(operation: Operation): boolean {
        return this.getDefaultOperations().includes(operation);
    }

    private operationLabel(operation: Operation): string {
        if (this.filter.listType === TradeListType.MONEY && [Operation.BUY, Operation.SELL].includes(operation)) {
            switch (operation) {
                case Operation.BUY:
                    return "Внесение";
                case Operation.SELL:
                    return "Списание";
            }
        }
        return operation.description;
    }

    private emitFilterChange(): void {
        this.$emit("filter", this.filter);
    }
}
