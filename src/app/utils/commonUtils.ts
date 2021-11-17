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
}
