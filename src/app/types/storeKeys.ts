export enum StoreKeys {
    /** Ключ под которым хранится токен пользователя */
    TOKEN_KEY = "INTELINVEST_TOKEN",
    /** Префикс ключа под которым хранится выбранный период на графике портфеля */
    PORTFOLIO_CHART = "PORTFOLIO_CHART",
    /** Префикс ключа под которым хранится выбранный период на графике комбинированного портфеля */
    PORTFOLIO_COMBINED_CHART = "PORTFOLIO_COMBINED_CHART",
    /** Ключ с настройками фильтра таблицы сделки */
    TRADES_FILTER_SETTINGS_KEY = "trades_filter_settings",
    /** Ключ с настройками фильтра таблицы Акции */
    STOCKS_TABLE_FILTER_KEY = "stocks_table_filter",
    /** Ключ с настройками фильтра таблицы Облигации */
    BONDS_TABLE_FILTER_KEY = "bonds_table_filter_key",
}
