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
import {TradesFilter} from "../services/tradeService";
import {TradesFilterService} from "../services/tradesFilterService";
import {ALLOWED_CURRENCIES} from "../types/currency";
import {Operation} from "../types/operation";
import {StoreKeys} from "../types/storeKeys";
import {TradeListType} from "../types/tradeListType";
import {TableFilterBase} from "./tableFilterBase";

@Component({
    // language=Vue
    template: `
        <v-layout align-center wrap>
            <table-filter-base @search="onSearch" :search-query="filter.search" :search-label="searchLabel" :min-length="2" :is-default="isDefault"
                               :start-date="filter.start" :end-date="filter.end" @startDateChanged="onStartDateChanged" @endDateChanged="onEndDateChanged"
                               :search-timeout="500"
                               :is-date-filter-show="true">
                <v-switch v-model="filter.showLinkedMoneyTrades" @change="onChange" class="margT0">
                    <template #label>
                        <span>Связанные сделки</span>
                    </template>
                </v-switch>

                <div class="trades-filter__label">Валюта сделки</div>
                <div class="trades-filter__currencies">
                    <v-select :items="currencyList" v-model="filter.currency" label="Валюта бумаги" @change="onCurrencyChange">
                        <template #append-outer>
                            <v-icon small @click="resetCurrency">clear</v-icon>
                        </template>
                    </v-select>
                </div>

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
        </v-layout>
    `,
    components: {TableFilterBase}
})
export class TradesTableFilter extends UI {

    /** Операции загружаемые по умполчанию */
    static readonly DEFAULT_OPERATIONS = [Operation.BUY, Operation.DIVIDEND, Operation.SELL, Operation.INCOME, Operation.COUPON, Operation.LOSS, Operation.AMORTIZATION,
        Operation.CURRENCY_BUY, Operation.CURRENCY_SELL];
    @Inject
    private tradesFilterService: TradesFilterService;
    /** Фильтр */
    @Prop({required: true, type: Object})
    private filter: TradesFilter;
    /** Признак дефолтного фильтра */
    @Prop({default: false, type: Boolean})
    private isDefault: boolean;
    /** Плэйсхолдер строки поиска */
    private searchLabel = "Поиск по названию бумаги, по тикеру бумаги, по заметке к сделке";
    /** Список типов */
    private listTypes = [TradeListType.FULL, TradeListType.STOCK, TradeListType.BOND, TradeListType.ASSET, TradeListType.MONEY];
    /** Список операций */
    private operations: Operation[] = TradesTableFilter.DEFAULT_OPERATIONS;
    /** Список валют */
    private currencyList = ALLOWED_CURRENCIES;

    private onChange(): void {
        this.emitFilterChange();
    }

    private onStartDateChanged(date: string): void {
        this.filter.start = date;
        this.emitFilterChange();
    }

    private onEndDateChanged(date: string): void {
        this.filter.end = date;
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

    private onCurrencyChange(): void {
        this.emitFilterChange();
    }

    private resetCurrency(): void {
        this.filter.currency = null;
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
            case TradeListType.ASSET:
                return [Operation.BUY, Operation.SELL, Operation.DIVIDEND];
            case TradeListType.BOND:
                return [Operation.BUY, Operation.SELL, Operation.COUPON, Operation.AMORTIZATION];
            case TradeListType.MONEY:
                return [Operation.BUY, Operation.SELL, Operation.INCOME, Operation.LOSS, Operation.CURRENCY_BUY, Operation.CURRENCY_SELL];
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
        this.tradesFilterService.saveFilter(StoreKeys.TRADES_FILTER_SETTINGS_KEY, this.filter);
    }
}
