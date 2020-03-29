import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Storage} from "../platform/services/storage";
import {TableHeader} from "../types/types";

const getHeaders = (headers: TableHeader[], isAsset: boolean = false): TableHeader[] => {
    if (isAsset) {
        headers[1].text = "Название";
    }
    return headers;
};

@Service("TablesService")
@Singleton
export class TablesService {

    readonly SHARE_TYPES_HEADERS: TableHeader[] = [
        {text: "", align: "left", ghost: true, sortable: false, value: "", active: true, width: "50"},
        {text: "Компания", align: "left", value: TABLE_HEADERS.COMPANY, active: true, width: "120"},
        {text: "Тикер", align: "left", value: TABLE_HEADERS.TICKER, active: false, width: "90"},
        {text: "Количество", align: "right", value: TABLE_HEADERS.QUANTITY, active: true, width: "60"},
        {
            text: "Ср. цена",
            align: "right",
            value: TABLE_HEADERS.OPEN_POSITION_AVG_PRICE,
            sortable: false,
            active: true,
            width: "65",
            tooltip: StockTooltips[TABLE_HEADERS.OPEN_POSITION_AVG_PRICE]
        },
        {
            text: "Ср. цена (Все сделки)",
            align: "right",
            value: TABLE_HEADERS.AVG_PRICE,
            sortable: false,
            active: false,
            width: "65",
            tooltip: StockTooltips[TABLE_HEADERS.AVG_PRICE]
        },
        {
            text: "Тек. цена",
            align: "right",
            value: TABLE_HEADERS.CURR_PRICE,
            sortable: false,
            active: true,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.CURR_PRICE],
            currency: true
        },
        {text: "Стоимость покупок", align: "right", value: TABLE_HEADERS.B_COST, active: false, width: "80", tooltip: StockTooltips[TABLE_HEADERS.B_COST], currency: true},
        {text: "Стоимость продаж", align: "right", value: TABLE_HEADERS.S_COST, active: false, width: "90", tooltip: StockTooltips[TABLE_HEADERS.S_COST], currency: true},
        {
            text: "Тек. стоимость",
            align: "right",
            value: TABLE_HEADERS.CURR_COST,
            active: true,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.CURR_COST],
            currency: true
        },
        {
            text: "Дивиденды",
            align: "right",
            value: TABLE_HEADERS.PROFIT_FROM_DIVIDENDS,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.PROFIT_FROM_DIVIDENDS],
            currency: true
        },
        {
            text: "Прибыль по дивидендам, %",
            align: "right",
            value: TABLE_HEADERS.PROFIT_FROM_DIVIDENDS_PERCENT,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.PROFIT_FROM_DIVIDENDS_PERCENT]
        },
        {
            text: "Курс. прибыль",
            align: "right",
            value: TABLE_HEADERS.RATE_PROFIT,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.RATE_PROFIT],
            currency: true
        },
        {
            text: "Курс. прибыль, %",
            align: "right",
            value: TABLE_HEADERS.RATE_PROFIT_PERCENT,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.RATE_PROFIT_PERCENT]
        },
        {
            text: "Прибыль по сделкам",
            align: "right",
            value: TABLE_HEADERS.EXCHANGE_PROFIT,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.EXCHANGE_PROFIT],
            currency: true
        },
        {
            text: "Прибыль по сделкам, %",
            align: "right",
            value: TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT,
            active: false,
            width: "80",
            tooltip: StockTooltips[TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT]
        },
        {text: "Прибыль", align: "right", value: TABLE_HEADERS.PROFIT, active: true, width: "80", tooltip: StockTooltips[TABLE_HEADERS.PROFIT], currency: true},
        {
            text: "Прибыль, %",
            align: "right",
            value: TABLE_HEADERS.PERC_PROFIT,
            active: true,
            width: "60",
            tooltip: StockTooltips[TABLE_HEADERS.PERC_PROFIT]
        },
        {
            text: "Доходность, %",
            align: "right",
            value: TABLE_HEADERS.YEAR_YIELD,
            active: false,
            width: "65",
            tooltip: StockTooltips[TABLE_HEADERS.YEAR_YIELD]
        },
        {text: "P/L за день", align: "right", value: TABLE_HEADERS.DAILY_PL, active: false, width: "60", tooltip: CommonTooltips[TABLE_HEADERS.DAILY_PL], currency: true},
        {
            text: "P/L за день, %",
            align: "right",
            value: TABLE_HEADERS.DAILY_PL_PERCENT,
            active: false,
            width: "60",
            tooltip: CommonTooltips[TABLE_HEADERS.DAILY_PL_PERCENT]
        },
        {text: "Комиссия", align: "right", value: TABLE_HEADERS.SUMM_FEE, active: false, width: "60", tooltip: StockTooltips[TABLE_HEADERS.SUMM_FEE], currency: true},
        {text: "Тек. доля", align: "right", value: TABLE_HEADERS.PERC_CURR_SHARE, active: true, width: "50"},
        {text: "", align: "center", ghost: true, value: "actions", sortable: false, width: "25", active: true},
    ];

    readonly HEADERS: TableHeaders = {
        [TABLES_NAME.STOCK]: [...getHeaders(this.SHARE_TYPES_HEADERS)],
        [TABLES_NAME.ASSET]: [...(getHeaders(this.SHARE_TYPES_HEADERS, true))],

        [TABLES_NAME.BOND]: [
            {text: "", align: "left", ghost: true, sortable: false, value: "", active: true, width: "50"},
            {text: "Компания", align: "left", value: TABLE_HEADERS.COMPANY, active: true, width: "135"},
            {text: "Тикер", align: "left", value: TABLE_HEADERS.TICKER, active: false, width: "90"},
            {text: "Количество", align: "right", value: TABLE_HEADERS.QUANTITY, active: true, width: "60"},
            {
                text: "Ср. цена",
                align: "right",
                value: TABLE_HEADERS.AVG_PRICE,
                sortable: false,
                active: true,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.AVG_PRICE]
            },
            {
                text: "Тек. цена",
                align: "right",
                value: TABLE_HEADERS.CURR_PRICE,
                sortable: false,
                active: true,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.CURR_PRICE]
            },
            {text: "Стоимость покупок", align: "right", value: TABLE_HEADERS.B_COST, active: false, width: "80", tooltip: BondTooltips[TABLE_HEADERS.B_COST], currency: true},
            {text: "Стоимость продаж", align: "right", value: TABLE_HEADERS.S_COST, active: false, width: "80", tooltip: BondTooltips[TABLE_HEADERS.S_COST], currency: true},
            {text: "Тек. стоимость", align: "right", value: TABLE_HEADERS.CURR_COST, active: true, width: "80", tooltip: BondTooltips[TABLE_HEADERS.CURR_COST], currency: true},
            {
                text: "Средний номинал",
                align: "right",
                value: TABLE_HEADERS.NOMINAL,
                sortable: false,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.NOMINAL],
                currency: true
            },
            {
                text: "Прибыль от купонов",
                align: "right",
                value: TABLE_HEADERS.PROFIT_FROM_COUPONS,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.PROFIT_FROM_COUPONS],
                currency: true
            },
            {
                text: "Прибыль от купонов, %",
                align: "right",
                value: TABLE_HEADERS.PROFIT_FROM_COUPONS_PERCENT,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.PROFIT_FROM_COUPONS_PERCENT]
            },
            {
                text: "Прибыль по сделкам",
                align: "right",
                value: TABLE_HEADERS.EXCHANGE_PROFIT,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.EXCHANGE_PROFIT],
                currency: true
            },
            {
                text: "Прибыль по сделкам, %",
                align: "right",
                value: TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT]
            },
            {
                text: "Курс. прибыль",
                align: "right",
                value: TABLE_HEADERS.RATE_PROFIT,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.RATE_PROFIT],
                currency: true
            },
            {
                text: "Курс. прибыль, %",
                align: "right",
                value: TABLE_HEADERS.RATE_PROFIT_PERCENT,
                active: false,
                width: "65",
                tooltip: BondTooltips[TABLE_HEADERS.RATE_PROFIT_PERCENT]
            },
            {text: "Выплаченный НКД", align: "right", value: TABLE_HEADERS.BUY_NKD, active: false, width: "85", tooltip: BondTooltips[TABLE_HEADERS.BUY_NKD], currency: true},
            {text: "Полученный НКД", align: "right", value: TABLE_HEADERS.SELL_NKD, active: false, width: "85", tooltip: BondTooltips[TABLE_HEADERS.SELL_NKD], currency: true},
            {text: "Прибыль", align: "right", value: TABLE_HEADERS.PROFIT, active: true, width: "80", tooltip: BondTooltips[TABLE_HEADERS.PROFIT], currency: true},
            {text: "Прибыль, %", align: "right", value: TABLE_HEADERS.PERC_PROFIT, active: true, width: "65", tooltip: BondTooltips[TABLE_HEADERS.PERC_PROFIT]},
            {text: "Доходность, %", align: "right", value: TABLE_HEADERS.YEAR_YIELD, active: false, width: "65", tooltip: BondTooltips[TABLE_HEADERS.YEAR_YIELD]},
            {text: "P/L за день", align: "right", value: TABLE_HEADERS.DAILY_PL, active: false, width: "60", tooltip: CommonTooltips[TABLE_HEADERS.DAILY_PL], currency: true},
            {
                text: "P/L за день, %",
                align: "right",
                value: TABLE_HEADERS.DAILY_PL_PERCENT,
                active: false,
                width: "60",
                tooltip: CommonTooltips[TABLE_HEADERS.DAILY_PL_PERCENT]
            },
            {text: "Комиссия", align: "right", value: TABLE_HEADERS.SUMM_FEE, active: false, width: "65", tooltip: BondTooltips[TABLE_HEADERS.SUMM_FEE], currency: true},
            {text: "Тек. доля", align: "right", value: TABLE_HEADERS.PERC_CURR_SHARE, active: true, width: "50", tooltip: BondTooltips[TABLE_HEADERS.PERC_CURR_SHARE]},
            {text: "", align: "center", value: "actions", ghost: true, sortable: false, width: "25", active: true},
        ],

        [TABLES_NAME.TRADE]: [
            {text: "", align: "left", ghost: true, sortable: false, value: "", active: true, width: "25"},
            {text: "Тикер/ISIN", align: "left", value: TABLE_HEADERS.TICKER, active: true, width: "90"},
            {text: "Название", align: "left", value: TABLE_HEADERS.NAME, active: true, width: "160"},
            {text: "Операция", align: "left", value: TABLE_HEADERS.OPERATION_LABEL, active: true, width: "100"},
            {text: "Дата сделки", align: "center", value: TABLE_HEADERS.DATE, active: true, width: "80"},
            {text: "Количество", align: "right", value: TABLE_HEADERS.QUANTITY, sortable: false, active: true, width: "50"},
            {text: "Цена", align: "right", value: TABLE_HEADERS.PRICE, sortable: false, active: true, width: "90"},
            {text: "Номинал", align: "right", value: TABLE_HEADERS.FACE_VALUE, sortable: false, active: false, width: "50"},
            {text: "НКД", align: "right", value: TABLE_HEADERS.NKD, sortable: false, active: false, width: "40"},
            {text: "Комиссия", align: "right", value: TABLE_HEADERS.FEE, active: true, width: "50"},
            {text: "Сумма", align: "right", value: TABLE_HEADERS.SIGNED_TOTAL, active: true, width: "65"},
            {text: "Сумма без комисс.", align: "right", value: TABLE_HEADERS.TOTAL_WITHOUT_FEE, active: false, width: "65"},
            {text: "", align: "center", value: "links", ghost: true, sortable: false, width: "25", active: true},
            {text: "", align: "center", value: "actions", ghost: true, sortable: false, width: "25", active: true},
        ]
    };

    headers: TableHeaders = null;

    @Inject
    private localStorage: Storage;

    /**
     * Проверяет localStorage на дату последенго изменения и выставляет колонки по умолчанию
     */
    constructor() {
        const headersFromStorage = this.localStorage.get<TableHeaders>("tableHeadersParams", null);
        // если восстановили из localStorage или берем по умолчанию
        this.headers = headersFromStorage ? {...headersFromStorage} : {...this.HEADERS};
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
    OPEN_POSITION_AVG_PRICE = "openPositionAvgPrice",
    AVG_PRICE = "avgBuy",
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
    ASSET = "assetTable",
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

/** Общие тултипы */
export const CommonTooltips: { [key: string]: string } = {
    [TABLE_HEADERS.DAILY_PL]: "Это дневная прибыль/убыток, по отношению к предыдущему дню.",
    [TABLE_HEADERS.DAILY_PL_PERCENT]: "Это дневная прибыль/убыток, по отношению к предыдущему дню в процентах.",
};

/** Тултипы для акций */
export const StockTooltips: { [key: string]: string } = {
    [TABLE_HEADERS.OPEN_POSITION_AVG_PRICE]: "Средняя цена открытой позиции. Если акция несколько раз покупалась и продавалась, " +
    "                        то средняя цена будет посчитана среди тех бумаг, которые остались сейчас в портфеле. " +
    "                        Учет оставшихся в портфеле бумаг ведется по методу FIFO (первая купленная бумага продается в первую очередь).",
    [TABLE_HEADERS.AVG_PRICE]: "Средняя цена по всем позициям. Если акция несколько раз покупалась и продавалась, " +
    "                        то средняя цена будет посчитана по всем сделкам (покупкам, если это была длинная позиция, или продажам, если короткая). " +
    "                        Учет оставшихся в портфеле бумаг ведется по методу FIFO (первая купленная бумага продается в первую очередь).",
    [TABLE_HEADERS.CURR_PRICE]: "Текущая биржевая цена акции. Если торги завершились, то отображается цена закрытия. " +
    "                        Данные предоставляются с задержкой в 15 минут. Для архивных (неторгуемых) акций текущая цена будет всегда 0.",
    [TABLE_HEADERS.B_COST]: "Сумма всех денежных средств, затраченных на покупку акции в портфель за все время. Включает в себя комиссию брокера.",
    [TABLE_HEADERS.S_COST]: "Сумма всех денежных средств, вырученных от продаж акции из портфеля за все время. Включает в себя комиссию брокера.",
    [TABLE_HEADERS.CURR_COST]: "Стоимость остатка акций в портфеле на данный момент. Рассчитывается исходя из текущей биржевой цены и количества.",
    [TABLE_HEADERS.PROFIT_FROM_DIVIDENDS]: "Сумма всех дивидендных выплат по акции. Представляет собой дивидендную прибыль от владения бумагой.",
    [TABLE_HEADERS.PROFIT_FROM_DIVIDENDS_PERCENT]: "Прибыль по дивидендам, или дивидендная доходность акции. " +
    "                        Рассчитывается как сумма всех дивидендных выплат по отношению к средневзвешенной стоимости вложений в акцию.",
    [TABLE_HEADERS.RATE_PROFIT]: "Прибыль, образованная за счет изменения биржевой цены акций, находящихся на данный момент в портфеле (открытые позиции)." +
    "                        Это та прибыль, которая будет зафиксирована, если закрыть позицию, т.е. продать все акции по текущей цене." +
    "                        Следует отличать эту прибыль от Прибыли по сделкам, которая отражает зафиксированную ранее прибыль от закрытия позиций.",
    [TABLE_HEADERS.RATE_PROFIT_PERCENT]: "Это курсовая прибыль, выраженная в процентах по отношению к стоимости покупок открытых на данный момент позиций." +
    "                        Иначе говоря, это доходность от изменения цены открытой позиции.",
    [TABLE_HEADERS.EXCHANGE_PROFIT]: "Это прибыль, зафиксированная ранее при закрытии позиции по акции, т.е. при её продаже когда цена изменилась. " +
    "                        Прибыль по сделкам отражает финансовый результат уже совершенных сделок покупки и продажи, " +
    "                        и не зависит от текущей цены открытых на данный момент позиций. " +
    "                        Для отслеживания курсовой прибыли по открытой позиции предназначена колонка \"Курсовая прибыль\".",
    [TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT]: "Это прибыль по сделкам, выраженная в процентах по отношению к средневзвешенной стоимости вложений в акцию. " +
    "                        Иначе говоря, это доходность от закрытых позиций по акции.",
    [TABLE_HEADERS.PROFIT]: "Это суммарная прибыль по акции за все время работы портфеля." +
    "                        Она включает в себя: прибыль по уже закрытым сделкам, курсовую прибыль, дивиденды, комиссию брокера." +
    "                        Для отслеживания прибыли от изменения биржевой цены открытой позиции предназначена колонка \"Курсовая прибыль\".",
    [TABLE_HEADERS.PERC_PROFIT]: "Это суммарная прибыль, выраженная в процентах по отношению к средневзвешенной стоимости вложений в акцию.",
    [TABLE_HEADERS.YEAR_YIELD]: "Это доходность в процентах годовых, посчитанная по отношению к средневзвешенной сумме " +
    "                        вложений в данную бумагу. Рассчитывается исходя из прибыли по акции с даты первой сделки по текущий момент." +
    "                        Например, если акция за полгода в портфеле принесла 8%, то её годовая доходность будет 16%.",
    [TABLE_HEADERS.SUMM_FEE]: "Это сумма всех комиссий, уплаченных брокеру за время работы с акцией.",
};

/** Тултипы для облигаций */
export const BondTooltips: { [key: string]: string } = {
    [TABLE_HEADERS.AVG_PRICE]: "Средняя цена покупки облигации.",
    [TABLE_HEADERS.CURR_PRICE]: "Текущая биржевая цена облигации. Если торги завершились, то отображается цена закрытия. " +
    "                        Данные предоставляются с задержкой в 15 минут. Для погашенных облигаций текущая цена будет всегда 0.",
    [TABLE_HEADERS.B_COST]: "Сумма всех денежных средств, затраченных на покупку облигации в портфель за все время. " +
    "                        Включает в себя комиссию брокера.",
    [TABLE_HEADERS.S_COST]: "Сумма всех денежных средств, вырученных от продаж облигации из портфеля за все время. " +
    "                        Включает в себя комиссию брокера.",
    [TABLE_HEADERS.CURR_COST]: "Стоимость остатка облигаций в портфеле на данный момент. Рассчитывается исходя из текущей биржевой цены и количества.",
    [TABLE_HEADERS.NOMINAL]: "Средний номинал облигации.",
    [TABLE_HEADERS.PROFIT_FROM_COUPONS]: "Сумма всех купонных выплат по облигации.",
    [TABLE_HEADERS.PROFIT_FROM_COUPONS_PERCENT]: "Процентная прибыль по выплаченным купонам, или купонная доходность облигации. " +
    "                        Рассчитывается как сумма всех купонных выплат по отношению к средневзвешенной стоимости вложений в облигацию.",
    [TABLE_HEADERS.EXCHANGE_PROFIT]: "Это прибыль, зафиксированная ранее при закрытии позиции по облигации, т.е. при её продаже когда цена изменилась. " +
    "                        Прибыль по сделкам отражает финансовый результат уже совершенных сделок покупки и продажи, " +
    "                        и не зависит от текущей цены открытых на данный момент позиций. " +
    "                        Для отслеживания курсовой прибыли по открытой позиции предназначена колонка \"Курсовая прибыль\".",
    [TABLE_HEADERS.EXCHANGE_PROFIT_PERCENT]: "Это прибыль по сделкам, выраженная в процентах по отношению к средневзвешенной стоимости вложений в облигацию.",
    [TABLE_HEADERS.RATE_PROFIT]: "Курсовая прибыль это доходность от изменения стоимости открытой позиции. " +
    "                        Здесь же учитываются полученные амортизационные начисления.",
    [TABLE_HEADERS.RATE_PROFIT_PERCENT]: "Это курсовая прибыль, выраженная в процентах по отношению к стоимости покупок открытых на данный момент позиций. " +
    "                        Иначе говоря, это доходность от изменения цены открытой позиции.",
    [TABLE_HEADERS.BUY_NKD]: "Суммарный выплаченный вами НКД при покупке облигаций.",
    [TABLE_HEADERS.SELL_NKD]: "Суммарный полученный вами НКД при продаже облигаций.",
    [TABLE_HEADERS.PROFIT]: "Это суммарная прибыль по облигации в портфеле. Она включает в себя прибыль связанную с изменением " +
    "                        биржевого курса облигации, прибыль от сделок, купонные выплаты, потенциальный НКД, " +
    "                        который вы получите/выплатите при закрытии позиции, полученный и выплаченный НКД, за вычетом всех комиссий.",
    [TABLE_HEADERS.PERC_PROFIT]: "Это суммарная прибыль, выраженная в процентах по отношению к средневзвешенной стоимости вложений в облигацию.",
    [TABLE_HEADERS.YEAR_YIELD]: "Это доходность в процентах годовых, посчитанная по отношению к средневзвешенной сумме " +
    "                        вложений в данную бумагу (без учета денег). Рассчитывается исходя из прибыли по облигации с даты первой сделки по текущий момент. " +
    "                        Например, если облигация за полгода в портфеле принесла 8%, то её годовая доходность будет 16%.",
    [TABLE_HEADERS.SUMM_FEE]: "Это сумма всех комиссий, уплаченных брокеру за время работы с облигацией.",
};
