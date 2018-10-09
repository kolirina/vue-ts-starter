/**
 * Декоратор на метод, для отображения ошибки с помощью MessageDialog.showError
 * @param target объект, содержащий метод, для которого нужно поймать исключение
 * @param propertyKey имя метода в объекте
 * @param descriptor дескриптор метода
 * @return новый дескриптор метода
 */
export function CatchErrors(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => void | Promise<void>>):
        TypedPropertyDescriptor<(...args: any[]) => Promise<void>> {
    const originalMethod = descriptor.value;
    descriptor.value = async function(...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            // UI.emit(GlobalEvent.HANDLE_ERROR, error);
            window.console.error(error);
        }
    };
    return descriptor as any;
}