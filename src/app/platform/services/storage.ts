import {Singleton} from 'typescript-ioc';
import {Service} from '../decorators/service';

/**
 * Сервис по работе с хранилищем браузера
 * Реализует LocalStorage либо inMemory object, в случае, если LocalStorage отключен клиентом
 */
@Service('Storage')
@Singleton
export abstract class Storage {

    /** localStorage, если он доступен, либо обычный объект */
    private storage = this.initLocalStorage();

    /** sessionStorage, если он доступен, либо обычный объект */
    private sessionStorage = this.initSessionStorage();

    /**
     * Возвращает значение из storage по ключу
     * @param key          ключ, по которому получается значение
     * @param defaultValue значение по умолчанию
     * @param session      признак получения из sessionStorage
     * @returns значение, сохраненное в storage, или defaultValue, если null или undefined
     */
    get<T>(key: string, defaultValue: T, session = false): T {
        const storage = this.getStorage(session);
        try {
            const value = JSON.parse(storage[key]) as T;
            return value ? value : defaultValue;
        } catch (e) {
            return defaultValue;
        }
    }

    /**
     * Устанавливает значение в storage по указанному ключу
     * @param key     ключ, по которому сохраняется значение
     * @param value   значение, сохраняемое в storage
     * @param session признак установки значения в sessionStorage
     * @returns {@code true} в случае успешного сохранения, {@code false} если вывалились с ошибкой и не сохранили
     */
    set<T>(key: string, value: T, session = false): boolean {
        const storage = this.getStorage(session);
        try {
            storage[key] = JSON.stringify(value);
        } catch (e) {
            return false;
        }
        return true;
    }

    /**
     * Удаляет настройку из storage по указанному ключу
     * @param key     ключ
     * @param session признак удаления из sessionStorage
     */
    delete(key: string, session = false): void {
        const storage = this.getStorage(session);
        if (storage.removeItem) {
            storage.removeItem(key);
        } else {
            delete storage[key];
        }
    }

    /**
     * Возвращает localStorage или sessionStorage
     * @param session признак работы с sessionStorage
     */
    private getStorage(session: boolean): any {
        return session ? this.sessionStorage : this.storage;
    }

    /**
     * Инициализирует localStorage.
     * Если localStorage недоступно, то используем {@code object}
     */
    private initLocalStorage(): any {
        try {
            if (localStorage && localStorage.getItem) {
                return localStorage;
            }
        } catch (e) {
        }
        return {};
    }

    /**
     * Инициализирует sessionStorage.
     * Если sessionStorage недоступно, то используем {@code object}
     */
    private initSessionStorage(): any {
        try {
            if (sessionStorage && sessionStorage.getItem) {
                return sessionStorage;
            }
        } catch (e) {
        }
        return {};
    }
}