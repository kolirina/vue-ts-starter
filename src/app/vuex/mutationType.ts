/**
 * Перечисление всех типов мутаторов
 */
export enum MutationType {
    INITIALISE_STORE = "INITIALISE_STORE",
    /** Команда установки информации о клиенте */
    SET_CLIENT_INFO = "SET_CLIENT_INFO",
    /** Команда установки информации о клиенте */
    SET_CLIENT = "SET_CLIENT",
    /** Команда установки информации о текущем портфеле */
    SET_CURRENT_PORTFOLIO = "SET_CURRENT_PORTFOLIO",
    /** Команда установки информации о текущем комбинированном портфеле */
    SET_CURRENT_COMBINED_PORTFOLIO = "SET_CURRENT_COMBINED_PORTFOLIO",
    /** Команда установки флага комбинированного портфеля */
    UPDATE_COMBINED_PORTFOLIO = "UPDATE_COMBINED_PORTFOLIO",
    /** Команда установки портфеля по умолчанию */
    SET_DEFAULT_PORTFOLIO = "SET_DEFAULT_PORTFOLIO",
    /** Команда обновления текущего портфеля */
    RELOAD_CURRENT_PORTFOLIO = "RELOAD_CURRENT_PORTFOLIO",
    /** Команда обновления информации о клиенте */
    RELOAD_CLIENT_INFO = "RELOAD_CLIENT_INFO",
    /** Запрос на обновление списка портфелей */
    RELOAD_PORTFOLIOS = "RELOAD_PORTFOLIOS",
    /** Обновление портфеля в сторе */
    UPDATE_PORTFOLIO = "UPDATE_PORTFOLIO",
    /** Обновление признака открытого меню */
    CHANGE_SIDEBAR_STATE = "CHANGE_SIDEBAR_STATE"
}
