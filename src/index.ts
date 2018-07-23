import {AppFrame} from './app/appFrame';
import {UIRegistry} from './app/uiRegistry';
import {RouterConfiguration} from './router/routerConfiguration';
import {VuexConfiguration} from './vuex/vuexConfiguration';

const initialized = UIRegistry.init();
const router = RouterConfiguration.getRouter();
const store = VuexConfiguration.getStore();

async function _start(resolve: () => void, reject: () => void): Promise<void> {
    try {
        const app = new AppFrame({router, store});
        app.$mount('#app');
        resolve();
    } catch (error) {
        console.log('ERROR WHILE INIT APPLICATION', error);
        reject();
    }
}

export function start(): void {
    new Promise((resolve, reject) => {
        _start(resolve, reject);
    });
}

start();
