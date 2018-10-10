import {Singleton} from "typescript-ioc";
import {Service} from "../decorators/service";

/**
 * Сервис кэширования данных
 */
@Service("Cache")
@Singleton
export class Cache {

    private cache = Object.create(null);

    put(key: string, value: any): void {
        this.cache[key] = value;
    }

    get<T>(key: string): T {
        return this.cache[key] as T;
    }

    remove(key: string): void {
        delete this.cache[key];
    }

    clear(): void {
        this.cache = Object.create(null);
    }
}