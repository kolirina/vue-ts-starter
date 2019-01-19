/**
 * Декоратор на метод, для отображения ошибки с помощью MessageDialog.showError
 * @param target объект, содержащий метод, для которого нужно поймать исключение
 * @param propertyKey имя метода в объекте
 * @param descriptor дескриптор метода
 * @return новый дескриптор метода
 */
import {UI} from "../../app/ui";
import {EventType} from "../../types/eventType";

export function CatchErrors(target: any, propertyKey: string, descriptor: TypedPropertyDescriptor<(...args: any[]) => Promise<void>>):
    TypedPropertyDescriptor<(...args: any[]) => Promise<void>> {
    const originalMethod = descriptor.value;
    // tslint:disable-next-line
    descriptor.value = async function(...args: any[]) {
        try {
            return await originalMethod.apply(this, args);
        } catch (error) {
            UI.emit(EventType.HANDLE_ERROR, error);
            window.console.error(error);
        }
    };
    return descriptor as any;
}
