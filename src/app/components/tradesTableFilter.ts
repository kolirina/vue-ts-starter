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
import {TradesFilter} from "../services/tradeService";
import {Operation} from "../types/operation";
import {TradeListType} from "../types/tradeListType";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <table-filter-base @search="onSearch" :search-label="searchLabel" :min-length="2" :is-default="isDefault">
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
                    <v-switch v-for="op in operations" @change="onOperationChange($event, op)" :disabled="!operationEnabled(op)" :label="op.description"
                              v-model="filter.operation.includes(op)" :key="op.enumName">
                    </v-switch>
                </div>
            </div>
        </table-filter-base>
    `,
    components: {TableFilterBase}
})
export class TradesTableFilter extends UI {

    /** Операции загружаемые по умполчанию */
    static readonly DEFAULT_OPERATIONS = [Operation.BUY, Operation.DIVIDEND, Operation.SELL, Operation.INCOME, Operation.COUPON, Operation.LOSS, Operation.AMORTIZATION];
    @Inject
    private storageService: Storage;
    /** Ключ для хранения состояния */
    @Prop({required: true, type: String})
    private storeKey: string;
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: TradesFilter;
    /** Признак дефолтного фильтра */
    @Prop({default: false, type: Boolean})
    private isDefault: boolean;
    /** Плэйсхолдер строки поиска */
    private searchLabel = "Поиск по названию бумаги, по тикеру бумаги, по заметке к сделке";
    /** Текущий объект таймера */
    private currentTimer: number = null;
    /** Список типов */
    private listTypes = [TradeListType.FULL, TradeListType.STOCK, TradeListType.BOND, TradeListType.MONEY];
    /** Список операций */
    private operations: Operation[] = TradesTableFilter.DEFAULT_OPERATIONS;

    private onChange(): void {
        this.$emit("filter", this.filter);
        this.storageService.set(this.storeKey, this.filter);
    }

    private async onSearch(searchQuery: string): Promise<void> {
        this.filter.search = searchQuery;
        // поле было очищено
        if (!this.filter.search) {
            this.filter.search = "";
            this.emitFilterChange();
            return;
        }
        if (this.filter.search.length <= 2) {
            this.emitFilterChange();
            return;
        }
        const delay = new Promise((resolve, reject): void => {
            this.currentTimer = setTimeout(async (): Promise<void> => {
                this.emitFilterChange();
            }, 1000);
        });

        try {
            delay.then(() => {
                clearTimeout(this.currentTimer);
            });
        } catch (error) {
            clearTimeout(this.currentTimer);
            throw error;
        }
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

    private emitFilterChange(): void {
        this.$emit("filter", this.filter);
    }
}
