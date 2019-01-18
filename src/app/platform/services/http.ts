/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

/** Структура данных параметров для URL */
import {Inject, Singleton} from "typescript-ioc";
import {StoreKeys} from "../../types/storeKeys";
import {CommonUtils} from "../../utils/commonUtils";
import {Service} from "../decorators/service";
import {Storage} from "./storage";

export type UrlParams = {
    [key: string]: string | number | boolean
};

/**
 * Сервис HTTP-транспорта
 */
@Service("Http")
@Singleton
export class Http {

    @Inject
    private localStorage: Storage;

    private readonly BASE_URL: string = `${window.location.protocol}//${window.location.host}/api`;

    get importHeaders(): any {
        const token = this.localStorage.get(StoreKeys.TOKEN_KEY, null);
        if (!CommonUtils.isBlank(token)) {
            return {"Authorization": `Bearer ${token}`};
        }
        return {};
    }

    /**
     * Выполнить POST-запрос на {@code url} с телом {@code body} и параметрами {@code options}
     * @param {string} url URL запроса
     * @param body         тело запроса
     * @param urlParams
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async post<T>(url: string, body?: any, urlParams?: UrlParams, options?: any): Promise<T> {
        return this.doRequest<T>("POST", url, {options, urlParams, body});
    }

    /**
     * Выполнить PUT-запрос на {@code url} с телом {@code body} и параметрами {@code options}
     * @param {string} url URL запроса
     * @param body         тело запроса
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async put<T>(url: string, body?: any, options?: any): Promise<T> {
        return this.doRequest<T>("PUT", url, {options, body});
    }

    /**
     * Выполнить GET-запрос на {@code url} c параметрами для URL {@code urlParams} и параметрами запроса {@code options}
     * @param {string} url URL запроса
     * @param urlParams    параметры для URL
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async get<T>(url: string, urlParams?: UrlParams, options?: any): Promise<T> {
        return this.doRequest<T>("GET", url, {options, urlParams});
    }

    /**
     * Выполнить DELETE-запрос на {@code url} c параметрами для URL {@code urlParams} и параметрами запроса {@code options}
     * @param {string} url URL запроса
     * @param urlParams    параметры для URL
     * @param options      параметры запроса
     * @return {Promise<T>}
     */
    async delete<T>(url: string, urlParams?: UrlParams, options?: any): Promise<T> {
        return this.doRequest<T>("DELETE", url, {options, urlParams});
    }

    /**
     * Выполнить запрос на сервис
     * @param method метод запроса
     * @param url    URL запроса
     * @param params объект с параметрами запроса
     * @return {Promise<T>}
     */
    private async doRequest<T>(method: string, url: string, params: { options: any, body?: any, urlParams?: UrlParams }): Promise<T> {
        const paramsInit = this.prepareRequestParams(method, url, params);

        let response;
        try {
            response = await fetch(paramsInit.url, paramsInit.params);
        } catch (networkError) {
            throw new Error("Не удалось выполнить запрос, повторите позже");
        }

        if (!response.ok) {
            throw await this.handleError(response);
        }

        return this.parseResult<T>(response);
    }

    /**
     * Подготовить запрос
     * @param method метод запроса
     * @param url    URL запроса
     * @param params объект с параметрами, которые необходимо применить к запросу
     * @return {ParamsInit} объект с данными запроса
     */
    private prepareRequestParams(method: string, url: string, params: { options: any, body?: any, urlParams?: UrlParams }): ParamsInit {
        const requestParams = this.getDefaultRequestInit();
        requestParams.method = method;
        const token = this.localStorage.get(StoreKeys.TOKEN_KEY, null);
        requestParams.headers = {
            "Content-Type": "application/json;charset=UTF-8"
        };
        if (!CommonUtils.isBlank(token)) {
            requestParams.headers.Authorization = `Bearer ${token}`;
        }

        if (params.options) {
            this.setRequestInitOptions(requestParams, params.options);
        }

        if (params.body) {
            this.setRequestInitBody(requestParams, params.body);
        }

        if (params.urlParams) {
            url += this.buildQuery(params.urlParams);
        }

        if (url.charAt(0) !== "/") {
            url = "/" + url;
        }

        return {url: this.BASE_URL + url, params: requestParams};
    }

    /**
     * Создать запрос
     * @param urlParams параметры для URL запроса
     * @return {string} готовый запрос
     */
    private buildQuery(urlParams: UrlParams): string {
        return Object.keys(urlParams).reduce((query: string, key: string, idx: number, keys: string[]) => {
            query += encodeURIComponent(key) + "=" + encodeURIComponent(String(urlParams[key]));
            if (idx < keys.length - 1) {
                query += "&";
            }
            return query;
        }, "?");
    }

    /**
     * Установить тело запроса
     * @param requestInit параметры запроса
     * @param body        данные для установки
     */
    private setRequestInitBody(requestInit: RequestInit, body: any): void {
        if (typeof body !== "string" && !(body instanceof FormData)) {
            body = JSON.stringify(body);
        }
        requestInit.body = body;
    }

    /**
     * Установить параметры в данные запроса (кроме body и method, тк они передаются и устанавливаются отдельно)
     * @param requestInit данные запроса
     * @param options     параметры запроса
     */
    private setRequestInitOptions(requestInit: RequestInit, options: any): void {
        if (options.cache) {
            requestInit.cache = options.cache;
        }
        if (options.credentials) {
            requestInit.credentials = options.credentials;
        }
        if (options.headers) {
            requestInit.headers = options.headers;
        }
    }

    /**
     * Обработка ответа сервиса
     * @param response ответ сервиса
     * @return {Promise<T | undefined>} преобразованный ответа сервиса в зависимости от его контента или {@code undefined}
     */
    private async parseResult<T>(response: Response): Promise<T | undefined> {
        // Код 204 - запрос успешно выполнился, контента нет
        if (response.status === 204) {
            return undefined;
        }
        const contentType = response.headers.get("Content-Type");
        if (contentType.indexOf("application/json") !== -1) {
            return response.json();
        }

        if (contentType.indexOf("text/plain") !== -1) {
            return response.text() as Promise<any>;
        }

        throw new Error("Неподдерживаемый тип контента " + contentType);
    }

    /**
     * Возвращает пользовательские параметры, которые необходимо применить к запросу по умолчанию
     * @return {RequestInit} пользовательские параметры по умолчанию
     */
    private getDefaultRequestInit(): RequestInit {
        return {
            /** параметр передачи учетных данных в запросе */
            credentials: "same-origin",
            /** заголовки запроса */
            headers: {
                "Content-Type": "application/json;charset=UTF-8",
                "Accept-Language": "ru_RU"
            }
        };
    }

    /**
     * Обработка ошибок в ответе сервиса
     * @param response ответ сервиса
     * @return объект с ошибкой
     */
    private async handleError(response: Response): Promise<any> {
        if (response.status === 401) {
            // при неавторизованном обращении отправляем пользователя на форму входа
            this.localStorage.delete(StoreKeys.STORE_KEY);
            this.localStorage.delete(StoreKeys.TOKEN_KEY);
            window.location.replace("/");
            throw new Error("Доступ запрещен");
        }
        let error: any = new Error("Внутренняя ошибка сервера");
        try {
            const responseError = await response.json();
            if (responseError.message) {
                error = new Error(responseError.message);
            }
            if (responseError.code) {
                error.code = responseError.code;
            }
        } catch (e) {
            // пришел ответ, отличный от json
        }
        error.response = {
            status: response.status,
            statusText: response.statusText
        };
        return error;
    }
}

/** Структура данных запроса */
type ParamsInit = {
    /** URL запроса */
    url: string,
    /** Параметры, которые необходимо применить к запросу */
    params: RequestInit
};