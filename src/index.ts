import * as Sentry from "@sentry/browser";
import {BrowserClient, Hub} from "@sentry/browser";
import {Container} from "typescript-ioc";
import Vue from "vue";
import {AppFrame} from "./app/app/appFrame";
import {UI} from "./app/app/ui";
import {UIRegistry} from "./app/app/uiRegistry";
import {Storage} from "./app/platform/services/storage";
import {RouterConfiguration} from "./app/router/routerConfiguration";
import {ApplicationService} from "./app/services/applicationService";
import {DateTimeService} from "./app/services/dateTimeService";
import {InactivityMonitor} from "./app/services/inactivityMonitor";
import {LocalStorageUpdater} from "./app/services/localStorageUpdater";
import {EventType} from "./app/types/eventType";
import {StoreKeys} from "./app/types/storeKeys";
import {VuexConfiguration} from "./app/vuex/vuexConfiguration";
import * as versionConfig from "./version.json";
import {Tours} from "./app/components/tours/tours";

/**
 * Запуск приложения
 */
export async function start(): Promise<void> {
    try {
        const client = new BrowserClient({
            dsn: "https://0a69d1634cf74275959234ed4e0bd8f0@sentry.io/1407959",
            release: `${versionConfig.version} build ${versionConfig.build}`,
            integrations: [new Sentry.Integrations.Vue({
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
            // логгируем ошибки только в prod-сборке
            if (!Vue.config.productionTip) {
                sentryHub.captureException(error);
            }
        };
        // Устанавливаем обработчик ошибок по умолчанию
        configureErrorHandling(errorHandler);
        // инициализируем компоненты
        UIRegistry.init();
        /** Инициализируем мониторинг бездействия */
        InactivityMonitor.getInstance().start();
        /** Фиксируем версию бэкэнда */
        await storeBackendVersion();
        /** Запрашиваем серверное время и сохраняем его локально */
        await Container.get(DateTimeService).initServerTimeDiff();
        /** Обновляем данные в localStorage */
        LocalStorageUpdater.getInstance().updateLocalStorage();
        /** Запуск приложения */
        const router = RouterConfiguration.getRouter();
        // Обработчик _синхронных_ ошибок в lifecycle-хуках роутера
        router.onError(errorHandler);
        const store = VuexConfiguration.getStore();
        const app = new AppFrame({router, store});
        const tours = new Tours();
        app.$mount("#app");
        tours.$mount("#tours");
    } catch (error) {
        console.error("ERROR WHILE INIT APPLICATION", error);
    }
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

/**
 * Сохраняет версию бэкенда при инициализации
 */
async function storeBackendVersion(): Promise<void> {
    try {
        const appService: ApplicationService = Container.get(ApplicationService);
        const storage: Storage = Container.get(Storage);
        const version = await appService.getBackendVersion();
        storage.set(StoreKeys.BACKEND_VERSION_KEY, version);
    } catch (ignored) {
    }
}

start();
