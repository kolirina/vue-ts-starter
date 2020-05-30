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

import {LoaderState} from "../../components/loaderState";

/**
 * Декоратор на метод для отображения лоадера во время выполнения метода
 * @param target объект, содержащий метод
 * @param {string} propertyKey название метода в объекте
 * @param {TypedPropertyDescriptor<T>} descriptor дескриптор метода
 * @return {TypedPropertyDescriptor<T>} новый дескриптор метода
 */
// tslint:disable-next-line
export function ShowProgress<T extends Function>(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<any>>):
    TypedPropertyDescriptor<(...args: any[]) => Promise<any>> {
    const originalMethod = descriptor.value;
    // tslint:disable-next-line
    descriptor.value = async function (...args: any[]) {
        const progressDialog = new LoaderState();
        try {
            progressDialog.show();
            // @ts-ignore
            return await originalMethod.apply(this, args);
        } finally {
            progressDialog.hide();
        }
    } as any;
    return descriptor;
}