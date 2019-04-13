import * as Sentry from "@sentry/browser";
import {BrowserClient, Hub} from "@sentry/browser";
import Vue from "vue";
import {AppFrame} from "./app/app/appFrame";
import {UI} from "./app/app/ui";
import {UIRegistry} from "./app/app/uiRegistry";
import {RouterConfiguration} from "./app/router/routerConfiguration";
import {InactivityMonitor} from "./app/services/inactivityMonitor";
import {EventType} from "./app/types/eventType";
import {VuexConfiguration} from "./app/vuex/vuexConfiguration";
import * as versionConfig from "./version.json";

/**
 * Запуск приложения
 * @param resolve
 * @param reject
 * @private
 */
async function _start(resolve: () => void, reject: () => void): Promise<void> {
    try {
        const client = new BrowserClient({
            dsn: "https://0a69d1634cf74275959234ed4e0bd8f0@sentry.io/1407959",
            release: `${versionConfig.version} build ${versionConfig.build}`,
            integrations: Vue.config.productionTip ? [] : [new Sentry.Integrations.Vue({
                Vue,
                attachProps: true
            })]
        });

        const sentryHub = new Hub(client);
        sentryHub.configureScope(scope => {
            scope.setTag("version", versionConfig.version);
            scope.setTag("build", versionConfig.build);
            scope.setTag("date", versionConfig.date);
        });

        const errorHandler = (error: Error | string): void => {
            UI.emit(EventType.HANDLE_ERROR, error);
            sentryHub.captureException(error);
        };
        // Устанавливаем обработчик ошибок по умолчанию
        configureErrorHandling(errorHandler);
        // инициализируем компоненты
        UIRegistry.init();
        const router = RouterConfiguration.getRouter();
        // Обработчик _синхронных_ ошибок в lifecycle-хуках роутера
        router.onError(errorHandler);
        const store = VuexConfiguration.getStore();
        InactivityMonitor.getInstance().start();
        const app = new AppFrame({router, store});
        app.$mount("#app");
        resolve();
    } catch (error) {
        console.error("ERROR WHILE INIT APPLICATION", error);
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
function configureErrorHandling(errorHandler: (error: Error | string) => void): void {
    // Обработчик ошибок (_синхронных_ и _асинхронных_) в lifecycle-хуках компонентов и обработчиках событий (+ обработка _синхронных_ ошибок в watcher'ах)
    Vue.config.errorHandler = errorHandler;
    // Обработчик прочих _асинхронных_ исключений (например в lifecycle-хуках роутера и в watcher'ах)
    (window as any).onunhandledrejection = (event: any): void => errorHandler(event.reason.message);
}

start();
