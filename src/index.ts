import Vue from "vue";
import {AppFrame} from "./app/app/appFrame";
import {UI} from "./app/app/ui";
import {UIRegistry} from "./app/app/uiRegistry";
import {RouterConfiguration} from "./app/router/routerConfiguration";
import {InactivityMonitor} from "./app/services/inactivityMonitor";
import {EventType} from "./app/types/eventType";
import {VuexConfiguration} from "./app/vuex/vuexConfiguration";

/**
 * Запуск приложения
 * @param resolve
 * @param reject
 * @private
 */
async function _start(resolve: () => void, reject: () => void): Promise<void> {
    try {
        // Устанавливаем обработчик ошибок по умолчанию
        configureErrorHandling();
        UIRegistry.init();
        const router = RouterConfiguration.getRouter();
        // Обработчик _синхронных_ ошибок в lifecycle-хуках роутера
        router.onError(handleError);
        const store = VuexConfiguration.getStore();
        InactivityMonitor.getInstance().start();
        const app = new AppFrame({router, store});
        app.$mount("#app");
        resolve();
    } catch (error) {
        console.log("ERROR WHILE INIT APPLICATION", error);
        reject();
    }
}

export function start(): void {
    new Promise((resolve, reject): void => {
        _start(resolve, reject);
    });
}

/**
 * Конфигурирование глобальных обработчиков ошибок
 */
function configureErrorHandling(): void {
    // Обработчик ошибок (_синхронных_ и _асинхронных_) в lifecycle-хуках компонентов и обработчиках событий (+ обработка _синхронных_ ошибок в watcher'ах)
    Vue.config.errorHandler = handleError;
    // Обработчик прочих _асинхронных_ исключений (например в lifecycle-хуках роутера и в watcher'ах)
    (window as any).onunhandledrejection = (event: any): void => handleError(event.reason.message);
}

/**
 * Базовый обработчик ошибок
 * @param error ошибка или сообщение об ошибке
 */
function handleError(error: Error | string): void {
    UI.emit(EventType.HANDLE_ERROR, error);
}

start();
