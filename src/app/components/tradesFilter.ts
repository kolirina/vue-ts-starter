import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {TradesFilter} from "../services/tradeService";
import {ListType} from "../types/listType";
import {filterOperations, Operation} from "../types/operation";

@Component({
  template: `
  <v-expansion-panel>
    <v-expansion-panel-content class="trades-filter">
      <div slot="header">
        <h2>Фильтры</h2>
      </div>

      <form>
        <v-layout row wrap>
          <v-flex xs8>
            <v-text-field
            @input="onFilterParamChange()"
            v-model="tradesFilter.search"
            placeholder="Поиск по названию бумаги,по тикеру бумаги, по заметке к сделке"
            ></v-text-field>
          </v-flex>

          <v-flex xs3 offset-xs1>
            <v-select
            @change="onListTypeChange()"
            :items="listTypes"
            item-text="description"
            item-value="enumName"
            v-model="currentListType"
            label="Тип списка"
            ></v-select>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs6>
            <v-checkbox @change="onFilterParamChange()" label="Показать сделки по денежным средствам" v-model="tradesFilter.showMoneyTrades"></v-checkbox>
          </v-flex>
          <v-flex xs6>
            <v-checkbox @change="onFilterParamChange()" label="Показать связанные сделки" v-model="tradesFilter.showLinkedMoneyTrades"></v-checkbox>
          </v-flex>
        </v-layout>

        <h2>Тип операции сделок</h2>

        <v-layout row wrap>
          <template v-for="op in operations">
            <v-flex xs3>
              <v-checkbox @change="onOperationChange()" :label="op.description" :value="op.enumName" v-model="currentOperations"></v-checkbox>
            </v-flex>
          </template>
        </v-layout>
      </form>
    </v-expansion-panel-content>
  </v-expansion-panel>
  `
})
export class TradesFilterComponent extends UI {
  @Prop()
  tradesFilter: TradesFilter;

  private currentListType: string = this.tradesFilter.listType.enumName;
  private currentOperations: string[] = this.tradesFilter.operation.map(el => el.enumName);
  private listTypes: ListType[] = ListType.values().map(el => el);
  private operations: Operation[] = filterOperations;

  private onFilterParamChange(): void {
    this.$emit("filterChange", this.tradesFilter);
  }

  private onListTypeChange(): void {
    if (this.tradesFilter.listType.enumName === this.currentListType) {
      return;
    }

    this.tradesFilter.listType = ListType.valueByName(this.currentListType);
    this.onFilterParamChange();
  }

  private onOperationChange(): void {
    this.tradesFilter.operation = this.currentOperations.map(el => Operation.valueByName(el));
    this.onFilterParamChange();
  }
}