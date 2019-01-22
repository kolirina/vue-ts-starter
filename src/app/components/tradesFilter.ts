import {Component, Prop, UI, Watch} from "../app/ui";
import {TradesFilter} from "../services/tradeService";
import {ListType} from "../types/listType";
import {Operation} from "../types/operation";

@Component({
    // language=Vue
    template: `
        <v-expansion-panel focusable expand :value="$uistate.tradesFilter">
            <v-expansion-panel-content class="trades-filter" :lazy="true" v-state="$uistate.TRADES_FILTER">
                <div slot="header">
                    <h2>Фильтры</h2>
                </div>

                <form>
                    <v-layout row wrap>
                        <v-flex xs8>
                            <v-text-field
                                v-model="tradesFilter.search"
                                placeholder="Поиск по названию бумаги,по тикеру бумаги, по заметке к сделке"
                            ></v-text-field>
                        </v-flex>

                        <v-flex xs3 offset-xs1>
                            <v-select
                                @change="onListTypeChange()"
                                :items="listTypes"
                                item-text="description"
                                :return-object="true"
                                v-model="tradesFilter.listType"
                                label="Тип списка">
                            </v-select>
                        </v-flex>
                    </v-layout>

                    <v-layout row wrap>
                        <v-flex xs6>
                            <v-checkbox @change="onFilterParamChange()" label="Сделки по денежным средствам" v-model="tradesFilter.showMoneyTrades"></v-checkbox>
                        </v-flex>
                        <v-flex xs6>
                            <v-checkbox @change="onFilterParamChange()" label="Связанные сделки" v-model="tradesFilter.showLinkedMoneyTrades"></v-checkbox>
                        </v-flex>
                    </v-layout>

                    <h2>Тип операции сделок</h2>

                    <v-layout row wrap>
                        <template v-for="op in operations">
                            <v-flex xs3>
                                <v-checkbox @change="onOperationChange($event, op)" :label="op.description" v-model="tradesFilter.operation.includes(op)"></v-checkbox>
                            </v-flex>
                        </template>
                    </v-layout>
                </form>
            </v-expansion-panel-content>
        </v-expansion-panel>
    `
})
export class TradesFilterComponent extends UI {

    /** Операции загружаемые по умполчанию */
    static readonly DEFAULT_OPERATIONS = [Operation.BUY, Operation.SELL, Operation.COUPON, Operation.AMORTIZATION, Operation.DIVIDEND, Operation.INCOME, Operation.LOSS];
    @Prop()
    tradesFilter: TradesFilter;
    /** Текущий объект таймера */
    private currentTimer: number = null;
    private listTypes = ListType.values();
    private operations: Operation[] = TradesFilterComponent.DEFAULT_OPERATIONS;

    @Watch("tradesFilter.search")
    private async onSearch(): Promise<void> {
        clearTimeout(this.currentTimer);
        // поле было очищено
        if (!this.tradesFilter.search) {
            this.onFilterParamChange();
            return;
        }
        if (this.tradesFilter.search.length <= 2) {
            return;
        }
        const delay = new Promise((resolve, reject): void => {
            this.currentTimer = setTimeout(async (): Promise<void> => {
                this.onFilterParamChange();
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
        this.onFilterParamChange();
    }

    private onOperationChange(checked: boolean, op: Operation): void {
        if (checked) {
            this.tradesFilter.operation.push(op);
        } else {
            this.tradesFilter.operation = this.tradesFilter.operation.filter(operation => operation !== op);
        }
        this.onFilterParamChange();
    }

    private onFilterParamChange(): void {
        this.$emit("filterChange", this.tradesFilter);
    }
}