import {UIRegistry} from "./app/uiRegistry";

/**
 * Точка входа в приложение
 */
export class Application {

    static start(): boolean {
        /** initializing standard pack of components */
        UIRegistry.init();

        return true;
    }
}