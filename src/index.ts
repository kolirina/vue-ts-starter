import {AppFrame} from "./app/app/appFrame";
import {UIRegistry} from "./app/app/uiRegistry";
import {RouterConfiguration} from "./app/router/routerConfiguration";
import {InactivityMonitor} from "./app/services/inactivityMonitor";
import {VuexConfiguration} from "./app/vuex/vuexConfiguration";

/**
 * Запуск приложения
 * @param resolve
 * @param reject
 * @private
 */
async function _start(resolve: () => void, reject: () => void): Promise<void> {
    try {
        UIRegistry.init();
        const router = RouterConfiguration.getRouter();
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

start();
