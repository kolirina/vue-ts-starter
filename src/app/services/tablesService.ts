import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Storage} from "../platform/services/storage";
import {TableHeader} from "../types/types";

@Service("TablesService")
@Singleton
export class TablesService {
    headers: TableHeaders = {
        stockTable: [
            {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
            {text: "Компания", align: "left", value: TABLE_HEADERS.COMPANY, active: true},
            {text: "Тикер", align: "left", value: TABLE_HEADERS.TICKER, active: false},
            {text: "Количество", align: "left", value: TABLE_HEADERS.QUANTITY, active: false},
            {text: "Ср. цена", align: "right", value: TABLE_HEADERS.AVG_BUY, sortable: false, active: true},
            {text: "Тек. цена", align: "right", value: TABLE_HEADERS.CURR_PRICE, sortable: false, active: true},
            {text: "Стоимость покупок", align: "left", value: TABLE_HEADERS.B_COST, active: false},
            {text: "Стоимость продаж", align: "left", value: TABLE_HEADERS.S_COST, active: false},
            {text: "Тек. стоимость", align: "right", value: TABLE_HEADERS.CURR_COST, active: true},
            {text: "Дивиденды", align: "right", value: TABLE_HEADERS.PROFIT_FROM_DIVIDENDS, active: false},
            {text: "Прибыль по дивидендам, %", align: "right", value: TABLE_HEADERS.PROFIT_FROM_DIVIDENDS_PERCENT, active: false},
            {text: "Курс. прибыль", align: "right", value: TABLE_HEADERS.RATE_PROFIT, active: false},
            {text: "Курс. прибыль, %", align: "right", value: TABLE_HEADERS.RATE_PROFIT_PERCENT, active: false},
            {text: "Прибыль по сделкам", align: "right", value: TABLE_HEADERS.EXCHANGE_PROFIT, active: false},
            {text: "Прибыль по сделкам, %", align: "right", value: TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT, active: false},
            {text: "Прибыль", align: "right", value: TABLE_HEADERS.PROFIT, active: true},
            {text: "Прибыль, %", align: "right", value: TABLE_HEADERS.PERC_PROFIT, active: true},
            {text: "Доходность, %", align: "right", value: TABLE_HEADERS.YEAR_YIELD, active: false},
            {text: "P/L за день", align: "right", value: TABLE_HEADERS.DAILY_PL, active: false},
            {text: "P/L за день, %", align: "right", value: TABLE_HEADERS.DAILY_PL_PERCENT, active: false},
            {text: "Комиссия", align: "right", value: TABLE_HEADERS.SUMM_FEE, active: false},
            {text: "Тек. доля", align: "right", value: TABLE_HEADERS.PERC_CURR_SHARE, active: true},
            {text: "Действия", align: "center", ghost: true, value: "actions", sortable: false, width: "25", active: true},
        ],
        bondTable: [
            {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
            {text: "Компания", align: "left", value: TABLE_HEADERS.COMPANY, active: true},
            {text: "Тикер", align: "left", value: TABLE_HEADERS.TICKER, active: false},
            {text: "Количество", align: "left", value: TABLE_HEADERS.QUANTITY, active: false},
            {text: "Ср. цена", align: "right", value: TABLE_HEADERS.AVG_BUY, sortable: false, active: true},
            {text: "Тек. цена", align: "right", value: TABLE_HEADERS.CURR_PRICE, sortable: false, active: true},
            {text: "Стоимость покупок", align: "right", value: TABLE_HEADERS.B_COST, active: false},
            {text: "Стоимость продаж", align: "right", value: TABLE_HEADERS.S_COST, active: false},
            {text: "Тек. стоимость", align: "right", value: TABLE_HEADERS.CURR_COST, active: true},
            {text: "Средний номинал", align: "right", value: TABLE_HEADERS.NOMINAL, sortable: false, active: false},
            {text: "Прибыль от купонов", align: "right", value: TABLE_HEADERS.PROFIT_FROM_COUPONS, active: false},
            {text: "Прибыль от купонов, %", align: "right", value: TABLE_HEADERS.PROFIT_FROM_COUPONS_PERCENT, active: false},
            {text: "Прибыль по сделкам", align: "right", value: TABLE_HEADERS.EXCHANGE_PROFIT, active: false},
            {text: "Прибыль по сделкам, %", align: "right", value: TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT, active: false},
            {text: "Курс. прибыль", align: "right", value: TABLE_HEADERS.RATE_PROFIT, active: false},
            {text: "Курс. прибыль, %", align: "right", value: TABLE_HEADERS.RATE_PROFIT_PERCENT, active: false},
            {text: "Выплаченный НКД", align: "right", value: TABLE_HEADERS.BUY_NKD, active: false},
            {text: "Полученный НКД", align: "right", value: TABLE_HEADERS.SELL_NKD, active: false},
            {text: "Прибыль", align: "right", value: TABLE_HEADERS.PROFIT, active: true},
            {text: "Прибыль, %", align: "right", value: TABLE_HEADERS.PERC_PROFIT, active: true},
            {text: "Доходность, %", align: "right", value: TABLE_HEADERS.YEAR_YIELD, active: false},
            {text: "P/L за день", align: "right", value: TABLE_HEADERS.DAILY_PL, active: false},
            {text: "P/L за день, %", align: "right", value: TABLE_HEADERS.DAILY_PL_PERCENT, active: false},
            {text: "Комиссия", align: "right", value: TABLE_HEADERS.SUMM_FEE, active: false},
            {text: "Тек. доля", align: "right", value: TABLE_HEADERS.PERC_CURR_SHARE, active: true},
            {text: "Действия", align: "center", value: "actions", ghost: true, sortable: false, width: "25", active: true},
        ],
        tradesTable: [
            {text: "", align: "left", ghost: true, sortable: false, value: "", active: true},
            {text: "Тикер/ISIN", align: "left", value: TABLE_HEADERS.TICKER, active: true},
            {text: "Название", align: "left", value: TABLE_HEADERS.NAME, active: true},
            {text: "Операция", align: "left", value: TABLE_HEADERS.OPERATION_LABEL, active: true},
            {text: "Дата", align: "center", value: TABLE_HEADERS.DATE, active: true},
            {text: "Количество", align: "right", value: TABLE_HEADERS.QUANTITY, sortable: false, active: false},
            {text: "Цена", align: "right", value: TABLE_HEADERS.PRICE, sortable: false, active: true},
            {text: "Номинал", align: "right", value: TABLE_HEADERS.FACE_VALUE, sortable: false, active: false},
            {text: "НКД", align: "right", value: TABLE_HEADERS.NKD, sortable: false, active: false},
            {text: "Комиссия", align: "right", value: TABLE_HEADERS.FEE, active: true},
            {text: "Сумма", align: "right", value: TABLE_HEADERS.SIGNED_TOTAL, active: true},
            {text: "Сумма без комисс.", align: "right", value: TABLE_HEADERS.TOTAL_WITHOUT_FEE, active: false},
            {text: "", align: "center", value: "links", ghost: true, sortable: false, width: "25"},
            {text: "Действия", align: "center", ghost: true, value: "actions", sortable: false, width: "25", active: true},
        ]
    };

    @Inject
    private localStorage: Storage;

    constructor() {
        this.headers = this.localStorage.get("tableHeadersParams", this.headers);
    }

    /**
     * Возвращает состояния заголовков в виде объекта {header.value: header.active}
     * @param headers {TableHeader[]} - Название таблицы
     */
    getHeadersState(headers: TableHeader[]): TableHeadersState {
        const result: TableHeadersState = {};
        headers.forEach(header => {
            (result as any)[header.value] = header.active;
        });
        return result;
    }

    setHeaders(name: string, headers: TableHeader[]): void {
        if (this.headers[name]) {
            this.headers[name] = headers;
            this.localStorage.set("tableHeadersParams", this.headers);
        }
    }

    /**
     * Возвращает заголовки со свойством active: true.
     * @param name {string} Название таблицы заголовков
     */
    getFilterHeaders(name: string): TableHeader[] {
        return (this.headers[name] || []).filter(el => el.active);
    }

    /**
     * Возвращает заголовки со свойством active: false.
     * @param name {string} Название таблицы заголовков
     */
    getHiddenHeaders(name: string): TableHeader[] {
        return (this.headers[name] || []).filter(el => !el.active && !el.ghost);
    }
}

export enum TABLE_HEADERS {
    COMPANY = "company",
    TICKER = "ticker",
    QUANTITY = "quantity",
    AVG_BUY = "avgBuy",
    CURR_PRICE = "currPrice",
    B_COST = "bcost",
    S_COST = "scost",
    CURR_COST = "currCost",
    PROFIT_FROM_DIVIDENDS = "profitFromDividends",
    PROFIT_FROM_DIVIDENDS_PERCENT = "profitFromDividendsPercent",
    RATE_PROFIT = "rateProfit",
    RATE_PROFIT_PERCENT = "rateProfitPercent",
    EXCHANGE_PROFIT = "exchangeProfit",
    EXCHANGE_PROFIT_PERCENT = "exchangeProfitPercent",
    PROFIT = "profit",
    PERC_PROFIT = "percProfit",
    YEAR_YIELD = "yearYield",
    DAILY_PL = "dailyPl",
    DAILY_PL_PERCENT = "dailyPlPercent",
    SUMM_FEE = "summFee",
    NOMINAL = "nominal",
    PROFIT_FROM_COUPONS = "profitFromCoupons",
    PROFIT_FROM_COUPONS_PERCENT = "profitFromCouponsPercent",
    BUY_NKD = "buyNkd",
    SELL_NKD = "sellNkd",
    PERC_CURR_SHARE = "percCurrShare",
    NAME = "name",
    OPERATION_LABEL = "operationLabel",
    DATE = "date",
    PRICE = "price",
    FACE_VALUE = "facevalue",
    NKD = "nkd",
    FEE = "fee",
    SIGNED_TOTAL = "signedTotal",
    TOTAL_WITHOUT_FEE = "totalWithoutFee",
}

export enum TABLES_NAME {
    STOCK = "stockTable",
    BOND = "bondTable",
    TRADE = "tradesTable",
}

export interface TableHeaders {
    [key: string]: TableHeader[];
}

export interface TableHeadersState {
    company?: boolean;
    ticker?: boolean;
    quantity?: boolean;
    avgBuy?: boolean;
    currPrice?: boolean;
    bcost?: boolean;
    scost?: boolean;
    currCost?: boolean;
    profitFromDividends?: boolean;
    profitFromDividendsPercent?: boolean;
    rateProfit?: boolean;
    rateProfitPercent?: boolean;
    exchangeProfit?: boolean;
    exchangeProfitPercent?: boolean;
    profit?: boolean;
    percProfit?: boolean;
    yearYield?: boolean;
    dailyPl?: boolean;
    dailyPlPercent?: boolean;
    summFee?: boolean;
    nominal?: boolean;
    profitFromCoupons?: boolean;
    profitFromCouponsPercent?: boolean;
    buyNkd?: boolean;
    sellNkd?: boolean;
    percCurrShare?: boolean;
    name?: boolean;
    operationLabel?: boolean;
    date?: boolean;
    price?: boolean;
    facevalue?: boolean;
    nkd?: boolean;
    fee?: boolean;
    signedTotal?: boolean;
    totalWithoutFee?: boolean;
}