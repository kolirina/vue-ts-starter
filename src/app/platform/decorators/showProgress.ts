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
