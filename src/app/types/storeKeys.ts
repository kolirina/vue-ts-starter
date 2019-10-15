export enum StoreKeys {
    /** Ключ под которым хранится токен пользователя */
    TOKEN_KEY = "INTELINVEST_TOKEN",
    /** Ключ под которым хранится версия бэкэнда */
    BACKEND_VERSION_KEY = "BACKEND_VERSION",
    /** Ключ под которым хранится признак "Запомнить меня" */
    REMEMBER_ME_KEY = "REMEMBER_ME",
    /** Ключ под которым хранится время последнего действия пользователя */
    LAST_ACTION_TIME = "LAST_ACTION_TIME",
    /** Префикс ключа под которым хранится выбранный период на графике портфеля */
    PORTFOLIO_CHART = "PORTFOLIO_CHART",
    /** Префикс ключа под которым хранится выбранный период на графике портфеля */
    PUBLIC_PORTFOLIO_CHART = "PUBLIC_PORTFOLIO_CHART",
    /** Префикс ключа под которым хранится выбранный период на графике комбинированного портфеля */
    PORTFOLIO_COMBINED_CHART = "PORTFOLIO_COMBINED_CHART",
    /** Ключ с настройками фильтра таблицы сделки */
    TRADES_FILTER_SETTINGS_KEY = "trades_filter_settings",
    /** Ключ с настройками фильтра таблицы Акции */
    STOCKS_TABLE_FILTER_KEY = "stocks_table_filter",
    /** Ключ с настройками фильтра таблицы Облигации */
    BONDS_TABLE_FILTER_KEY = "bonds_table_filter",
    /** Ключ с настройками фильтра таблицы Активы */
    ASSETS_TABLE_FILTER_KEY = "assets_table_filter",
    /** Ключ с датой последнего обновления данных хранящихся в localStorage */
    LOCAL_STORAGE_LAST_UPDATE_DATE_KEY = "local_storage_last_update_date",
    /** Ключ под которым хранится признак развернутого меню */
    MENU_STATE_KEY = "MENU_STATE"
}
