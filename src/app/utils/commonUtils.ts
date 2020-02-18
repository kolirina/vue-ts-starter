import {BrowserInfo} from "../types/types";

export class CommonUtils {

    private constructor() {
    }

    /**
     * Проверка на существование объекта
     * @param obj объект
     * @returns boolean true если объект существует. В противном случае возвращается false
     */
    static exists(obj: any): boolean {
        return !(obj === null || typeof obj === "undefined");
    }

    /**
     * Проверка строки на пустоту
     * @param str
     * @return {boolean}
     */
    static isBlank(str: any): boolean {
        return !CommonUtils.exists(str) || str.trim().length === 0;
    }

    /**
     * Добавляет пробелы вокруг символов < и >
     * @param {string} stringValue строка для обработки
     * @return обработанная строка
     */
    static newLine(stringValue: string): any {
        let temp = " ";
        for (let i = 0; i < stringValue.length; i = i + 1) {
            const c = stringValue.charAt(i) + "";
            if (c === "<") {
                temp = temp + " <";
            } else if (c === ">") {
                temp = temp + "> ";
            } else {
                temp = temp + c;
            }
        }
        return temp;
    }

    /**
     * Генерирует уникальный идентификатор
     */
    static uuid(): string {
        let uuid = "";
        let i;
        let random;
        for (i = 0; i < 32; i++) {
            // tslint:disable-next-line
            random = Math.random() * 16 | 0;
            if (i === 8 || i === 12 || i === 16 || i === 20) {
                uuid += "-";
            }
            // tslint:disable-next-line
            uuid += (i === 12 ? 4 : (i === 16 ? (random & 3 | 8) : random)).toString(16);
        }
        return uuid;
    }

    /**
     * Возвращает признак работы на мобильном устройстве
     */
    static isMobile(): boolean {
        const UA = window.navigator.userAgent.toLowerCase();
        return (UA && UA.indexOf("android") > 0) || (UA && /iphone|ipad|ipod|ios/.test(UA));
    }

    /**
     * Определяет тип и версию браузера.
     * @returns {@link BrowserInfo}
     */
    static detectBrowser(): BrowserInfo {
        const userAgent = navigator.userAgent;
        let version;
        let browserInfo = userAgent.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];
        if (/trident/i.test(browserInfo[1])) {
            version = /\brv[ :]+(\d+)/g.exec(userAgent) || [];
            return {name: "MSIE", version: (version[1] || "")};
        }
        if (browserInfo[1] === "Chrome") {
            version = userAgent.match(/\bOPR\/(\d+)/);
            if (version != null) {
                return {name: "Opera", version: version[1]};
            }
            version = userAgent.match(/\bEdge\/(\d+)/);
            if (version != null) {
                return {name: "Edge", version: version[1]};
            }
        }
        browserInfo = browserInfo[2] ? [browserInfo[1], browserInfo[2]] :
            [navigator.appName, navigator.appVersion, "-?"];

        version = userAgent.match(/version\/(\d+)/i);
        if (version != null) {
            browserInfo.splice(1, 1, version[1]);
        }
        return {name: browserInfo[0], version: browserInfo[1]};
    }

    /**
     * Возвращает признак, нужно ли логгировать ошибку в сентри
     * @param error ошибка
     */
    static skipSendToSentry(error: Error | any): boolean {
        return !error || this.isUserError(error) || this.isTariffExceededError(error) || "Не удалось выполнить запрос, повторите позже" === error.message ||
            "Внутренняя ошибка сервера" === error.message || error.captured === "true";
    }

    /**
     * Проверяет объект на то что это пользовательская ошибка
     * @param userError пользовательская ошибка
     */
    static isUserError(userError: any): boolean {
        return userError.hasOwnProperty("errorCode") && userError.hasOwnProperty("message") && userError.hasOwnProperty("fields");
    }

    /**
     * Проверяет объект на то что это ошибка об ограничении
     * @param userError ошибка об ограничении
     */
    static isTariffExceededError(userError: any): boolean {
        return ["LIMIT_EXCEEDED", "SUBSCRIPTION_EXPIRED", "PERMISSION_DENIED", "CURRENCY_PERMISSION_DENIED"].includes(userError?.message);
    }
}
