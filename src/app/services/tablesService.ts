import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {TableHeader, TableHeaders} from '../types/types';

@Service("TablesService")
@Singleton
export class TablesService {
  headers: TableHeaders = {
    stockTable: [
      {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
      {text: "Компания", align: "left", sortable: false, value: "company", active: true},
      {text: "Тикер", align: "left", value: "ticker", active: false},
      {text: "Количество", align: "left", value: "quantity", active: true},
      {text: "Ср. цена", align: "right", value: "avgBuy", active: true},
      {text: "Тек. цена", align: "right", value: "currPrice", active: true},
      {text: "Стоимость покупок", align: "left", value: "firstBuy", active: false},
      {text: "Стоимость продаж", align: "left", value: "lastBuy", active: false},
      {text: "Тек. стоимость", align: "right", value: "currCost", sortable: false, active: true},
      {text: "Дивиденды", align: "right", value: "profitFromDividends", sortable: false, active: false},
      {text: "Прибыль по дивидендам, %", align: "right", value: "profitFromDividendsPercent", sortable: false, active: false},
      {text: "Курс. прибыль", align: "right", value: "rateProfit", sortable: false, active: false},
      {text: "Курс. прибыль, %", align: "right", value: "rateProfitPercent", active: false},
      {text: "Прибыль по сделкам", align: "right", value: "exchangeProfit", sortable: false, active: false},
      {text: "Прибыль по сделкам, %", align: "right", value: "exchangeProfitPercent", active: false},
      {text: "Прибыль", align: "right", value: "profit", sortable: false, active: true},
      {text: "Прибыль, %", align: "right", value: "percProfit", active: true},
      {text: "Доходность, %", align: "right", value: "yearYield", active: false},
      {text: "P/L за день", align: "right", value: "dailyPl", sortable: false, active: false},
      {text: "P/L за день, %", align: "right", value: "dailyPlPercent", active: false},
      {text: "Комисcия", align: "right", value: "summFee", active: false},
      {text: "Тек. доля", align: "right", value: "percCurrShare", active: true},
      {text: "Действия", align: "center", value: "actions", sortable: false, width: "25", active: true},
    ],
    bondTable: [
      {text: "", align: "left", ghost: true, sortable: false, value: ""},
      {text: "Компания", align: "left", sortable: false, value: "company", active: true},
      {text: "Тикер", align: "left", value: "ticker", active: false},
      {text: "Количество", align: "left", value: "quantity", active: false},
      {text: "Ср. цена", align: "right", value: "avgBuy", active: true},
      {text: "Тек. цена", align: "right", value: "currPrice", active: true},
      {text: "Стоимость покупок", align: "right", value: "bCost", active: false},
      {text: "Стоимость продаж", align: "right", value: "aCost", active: false},
      {text: "Тек. стоимость", align: "right", value: "currCost", sortable: false, active: true},
      {text: "Средний номинал", align: "right", value: "nominal", sortable: false, active: false},
      {text: "Прибыль от купонов", align: "right", value: "profitFromCoupons", active: false},
      {text: "Прибыль от купонов, %", align: "right", value: "profitFromCouponsPercent", active: false},
      {text: "Прибыль по сделкам", align: "right", value: "exchangeProfit", sortable: false, active: false},
      {text: "Прибыль по сделкам, %", align: "right", value: "exchangeProfitPercent", active: false},
      {text: "Курс. прибыль", align: "right", value: "rateProfit", sortable: false, active: false},
      {text: "Курс. прибыль, %", align: "right", value: "rateProfitPercent", active: false},
      {text: "Выплаченный НКД", align: "right", value: "buyNkd", active: false},
      {text: "Полученный НКД", align: "right", value: "sellNkd", active: false},
      {text: "Прибыль", align: "right", value: "profit", sortable: false, active: true},
      {text: "Прибыль, %", align: "right", value: "percProfit", active: true},
      {text: "Доходность, %", align: "right", value: "yearYield", active: false},
      {text: "P/L за день", align: "right", value: "dailyPl", sortable: false, active: false},
      {text: "P/L за день, %", align: "right", value: "dailyPlPercent", active: false},
      {text: "Комиcсия", align: "right", value: "summFee", active: false},
      {text: "Тек. доля", align: "right", value: "percCurrShare", active: true},
      {text: "Действия", align: "center", value: "actions", sortable: false, width: "25", active: true},
    ],
    tradesTable: [
      {text: "", align: "left", sortable: false, value: ""},
      {text: "Тикер/ISIN", align: "left", value: "ticker", active: true},
      {text: "Название", align: "left", value: "name", active: true},
      {text: "Операция", align: "left", value: "operationLabel", active: true},
      {text: "Дата", align: "center", value: "date", active: true},
      {text: "Количество", align: "right", value: "quantity", sortable: false, active: true},
      {text: "Цена", align: "right", value: "price", sortable: false, active: true},
      {text: "Номинал", align: "right", value: "facevalue", sortable: false, active: false},
      {text: "НКД", align: "right", value: "nkd", sortable: false, active: false},
      {text: "Комиссия", align: "right", value: "fee", active: true},
      {text: "Итого", align: "right", value: "signedTotal", active: true},
      {text: "Действия", align: "center", value: "actions", sortable: false, width: "25", active: true},
    ]
  };

  setHeaders(name: string, headers: TableHeader[]) {
    if(this.headers[name]) {
      this.headers[name] = headers;
    }
  }

  /**
   * Возвращает заголовки со свойством active: true.
   * Используется в таблицах.
   * @param headers
   */
  filterHeaders(headers: TableHeaders): TableHeaders {
    let result: TableHeaders = {};

    Object.keys(headers).forEach(key => {
      result[key] = headers[key].filter(el => el.active)
    });

    return result;
  }

  /**
   * Возвращает все значения(key) заголовков.
   * Используется для определения видимости соответствующих значений в таблице.
   * Пример: <td v-if="headersKey.quantity">{{props.quantity}}</td>
   * @param headers 
   */
  getHeadersValue(headers: TableHeader[]): {[key: string]: boolean} {
    let result: {[key: string]: boolean} = {};

    headers.forEach(el => {
      result[el.value] = el.active;
    });

    return result;
  }
}