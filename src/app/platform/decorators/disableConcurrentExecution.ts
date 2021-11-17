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
