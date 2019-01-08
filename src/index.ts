import {AppFrame} from "./app/app/appFrame";
import {UIRegistry} from "./app/app/uiRegistry";
import {RouterConfiguration} from "./app/router/routerConfiguration";
import {VuexConfiguration} from "./app/vuex/vuexConfiguration";

const initialized = UIRegistry.init();
const router = RouterConfiguration.getRouter();
const store = VuexConfiguration.getStore();

/**
 * Запуск приложения
 * @param resolve
 * @param reject
 * @private
 */
async function _start(resolve: () => void, reject: () => void): Promise<void> {
    try {
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
