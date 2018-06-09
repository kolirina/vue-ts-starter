/**
 * Декоратор для сервисов. Нужен для того, чтобы сервисы продолжали работать после минимизации при помощи Closure Compiler.
 * Обязателен для использования при создании сервиса.
 * @param {string} className название класса сервиса
 * @return {<T extends Function>(target: T) => T} конструктор
 * @constructor
 */
export function Service(className: string) {
    // tslint:disable-next-line
    return function <T extends Function>(target: T): T {
        Object.defineProperty(target, "name", {value: className});
        return target;
    };
}