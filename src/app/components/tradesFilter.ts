import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {TradesFilters} from "../services/tradeService";
import {ListType} from "../types/listType";
import {FilterOperation} from "../types/operation";
import { GeometryCollection } from "geojson";


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
            @change="onFilterParamChange()"
            :items="listTypes"
            v-model="tradesFilter.listType"
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
              <v-checkbox @change="onFilterParamChange()" :label="op.description" :value="op.enumName" v-model="tradesFilter.operation"></v-checkbox>
            </v-flex>
          </template>
        </v-layout>
      </form>
    </v-expansion-panel-content>
  </v-expansion-panel>
  ` 
})
export class TradesFilter extends UI {
  @Prop()
  tradesFilter: TradesFilters;

  private listTypes: Object[] = ListType.values().map(obj => ({
    'text': obj.description,
    'value': obj.enumName
  }));
  private operations = FilterOperation.values();

  private onFilterParamChange() {
    this.$emit('filterChange', this.tradesFilter);
  }
}