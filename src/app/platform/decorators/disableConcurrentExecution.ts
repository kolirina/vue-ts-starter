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

/**
 * Декоратор на метод, для предотвращения повторного вызова пока незавершён предыдущий
 * @param target      объект, содержащий декорируемый метод
 * @param propertyKey имя декорируемого метода
 * @param descriptor  дескриптор декорируемого метода
 * @return изменённый дескриптор декорируемого метода
 * @constructor
 */
export function DisableConcurrentExecution(target: any, propertyKey: string, descriptor: PropertyDescriptor): PropertyDescriptor {
    const originalMethod = descriptor.value;
    let enable = true;
    // tslint:disable-next-line:typedef
    descriptor.value = async function(...args: any[]) {
        if (enable) {
            enable = false;
            try {
                return await originalMethod.apply(this, args);
            } finally {
                enable = true;
            }
        }
    };
    return descriptor;
}