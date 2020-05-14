export enum StoreKeys {
    /** Ключ под которым хранится токен пользователя */
    TOKEN_KEY = "INTELINVEST_TOKEN",
    /** Ключ под которым хранится токен для обновления */
    REFRESH_TOKEN = "INTELINVEST_REFRESH_TOKEN",
    /** Ключ под которым хранится версия бэкэнда */
    BACKEND_VERSION_KEY = "BACKEND_VERSION",
    /** Ключ под которым хранится признак "Запомнить меня" */
    REMEMBER_ME_KEY = "REMEMBER_ME",
    /** Ключ под которым хранится время последнего действия пользователя */
    LAST_ACTION_TIME = "LAST_ACTION_TIME",
    /** Префикс ключа под которым хранится выбранный период на графике портфеля */
    PORTFOLIO_CHART = "PORTFOLIO_CHART",
    /** Префикс ключа под которым хранится выбранный период на графике комбинированного портфеля */
    PORTFOLIO_COMBINED_CHART = "PORTFOLIO_COMBINED_CHART",
    /** Ключ с настройками фильтра таблицы сделки */
    TRADES_FILTER_SETTINGS_KEY = "trades_filter_settings",
    /** Ключ с настройками фильтра таблицы общих активов */
    COMMON_QUOTES_FILTER_KEY = "common_quotes_filter_key",
    /** Ключ с настройками фильтра таблицы кастомных активов */
    CUSTOM_QUOTES_FILTER_KEY = "custom_quotes_filter_key",
    /** Ключ с настройками фильтра таблицы ETF */
    ETF_QUOTES_FILTER_KEY = "etf_quotes_filter_key",
    /** Ключ с настройками фильтра таблицы кастомных активов */
    STOCK_QUOTES_FILTER_KEY = "stock_quotes_filter_key",
    /** Ключ с настройками фильтра таблицы кастомных активов */
    BOND_QUOTES_FILTER_KEY = "bond_quotes_filter_key",
    /** Ключ с настройками фильтров */
    FILTERS_KEY = "FILTERS_KEY",
    /** Ключ с настройками фильтра таблицы Акции */
    STOCKS_TABLE_FILTER_KEY = "stocks_table_filter",
    /** Ключ с настройками фильтра таблицы ETF */
    ETF_TABLE_FILTER_KEY = "etf_table_filter",
    /** Ключ с настройками фильтра таблицы Облигации */
    BONDS_TABLE_FILTER_KEY = "bonds_table_filter",
    /** Ключ с настройками фильтра таблицы Активы */
    ASSETS_TABLE_FILTER_KEY = "assets_table_filter",
    /** Ключ с валютой просмотра комбинированного портфеля */
    COMBINED_VIEW_CURRENCY_KEY = "combined_view_currency",
    /** Ключ с датой последнего обновления данных хранящихся в localStorage */
    LOCAL_STORAGE_LAST_UPDATE_DATE_KEY = "local_storage_last_update_date",
    /** Ключ под которым хранится признак развернутого меню */
    MENU_STATE_KEY = "MENU_STATE",
    /** Ключ под которым хранится название темы */
    THEME = "theme",
    /** Ключ под которым хранится признак скрытия панели быстрых действия в диалоге добавления сделки */
    ADD_TRADE_DIALOG_QUICK_ACTIONS_PANEL = "add_trade_dialog_quick_actions_panel"
}
