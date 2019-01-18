import Component from "vue-class-component";
import {Prop} from "vue-property-decorator";
import {UI} from "../app/ui";
import {TradesFilters} from "../services/tradeService";


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
            v-model="search"
            placeholder="Поиск по названию бумаги,по тикеру бумаги, по заметке к сделке"
            ></v-text-field>
          </v-flex>

          <v-flex xs3 offset-xs1>
            <v-select
            @change="onFilterParamChange()"
            :items="listTypes"
            v-model="listType"
            label="Тип списка"
            ></v-select>
          </v-flex>
        </v-layout>

        <v-layout row wrap>
          <v-flex xs6>
            <v-checkbox @change="onFilterParamChange()" label="Показать сделки по денежным средствам" v-model="showMoneyTrades"></v-checkbox>
          </v-flex>
          <v-flex xs6>    
            <v-checkbox @change="onFilterParamChange()" label="Показать связанные сделки" v-model="showLinkedMoneyTrades"></v-checkbox>
          </v-flex>
        </v-layout>

        <h2>Тип операции сделок</h2>

        <v-layout row wrap>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Покупка" v-model="operations['BUY']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Продажа" v-model="operations['SELL']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Купоны" v-model="operations['COUPON']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Дивиденды" v-model="operations['DIVIDEND']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Амортизация" v-model="operations['AMORTIZATION']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Прибыль" v-model="operations['INCOME']"></v-checkbox>
          </v-flex>
          <v-flex xs3>
            <v-checkbox @change="onFilterParamChange()" label="Убыток" v-model="operations['LOSS']"></v-checkbox>
          </v-flex>
        </v-layout>
      </form>
    </v-expansion-panel-content>
  </v-expansion-panel>
  `
})
export class TradesFilter extends UI {
  @Prop()
  loadTrades: Function

  private listTypesObject: { [s: string]: string } = {
    'FULL': 'Полный',
    'STOCK': 'Акции',
    'BOND': 'Облигации',
    'MONEY': 'Доходы и Расходы'
  };
  private listTypes: string[] = Object.values(this.listTypesObject);

  private search: string = "";
  private listType: string = this.listTypesObject['FULL'];
  private showLinkedMoneyTrades: boolean = true;
  private showMoneyTrades: boolean = true;

  private operations:{[s: string]: boolean} = {
    'BUY': true,
    'SELL': true,
    'COUPON': true,
    'DIVIDEND': true,
    'AMORTIZATION': true,
    'INCOME': true,
    'LOSS': true
  }

  private getFilterParamsForRequest():TradesFilters  {
    let params:TradesFilters = {
      operation: [],
      listType: '',
      showMoneyTrades: this.showMoneyTrades,
      showLinkedMoneyTrades: this.showLinkedMoneyTrades,
      search: this.search
    };

    Object.keys(this.operations).forEach(key => {
      if(this.operations[key]) {
        params.operation.push(key);
      }
    });

    Object.keys(this.listTypesObject).forEach(key => {
      if(this.listTypesObject[key] === this.listType) {
        params.listType = key;
      }
    });

    return params;
  }

  private onFilterParamChange() {
    this.loadTrades( this.getFilterParamsForRequest() );
  }
}