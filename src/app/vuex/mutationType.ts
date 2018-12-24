/**
 * Перечисление всех типов мутаторов
 */
export enum MutationType {
    INITIALISE_STORE = "INITIALISE_STORE",
    SET_CLIENT_INFO = "SET_CLIENT_INFO",
    SET_CURRENT_PORTFOLIO = "SET_CURRENT_PORTFOLIO",
    RELOAD_PORTFOLIO = "RELOAD_PORTFOLIO",
    /** Запрос на обновление списка портфелей */
    RELOAD_PORTFOLIOS = "RELOAD_PORTFOLIOS",
    /** Обновление портфеля в сторе */
    UPDATE_PORTFOLIO = "UPDATE_PORTFOLIO"
}
