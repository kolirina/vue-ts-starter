import Vue from 'vue';
import VueRouter from 'vue-router';
import {NavigationGuard, Route, RouteConfig} from 'vue-router/types/router';
import {PortfolioPage} from '../pages/portfolioPage';
import {TradesPage} from '../pages/tradesPage';
import {SettingsPage} from '../pages/settingsPage';
import {Container} from 'typescript-ioc';
import {Storage} from '../platform/services/storage'

Vue.use(VueRouter);

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Ключ под которым хранится токен пользователя */
const TOKEN_KEY = 'INTELINVEST_TOKEN';
const STORE_KEY = 'vuex';

/**
 * Класс отвечающий за создание роутингов и инициализацию роутера
 */
export class RouterConfiguration {

    /** Экземпляр роутера */
    private static router: VueRouter;

    /**
     * Возвращает инициализированный экземпляр роутера
     * @returns {VueRouter} роутер
     */
    static getRouter(): VueRouter {
        if (!RouterConfiguration.router) {
            RouterConfiguration.router = new VueRouter({
                base: '/',
                routes: RouterConfiguration.createRoutes(),
                scrollBehavior: (() => ({x: 0, y: 0}))
            });
        }
        // RouterConfiguration.router.beforeEach((to, from, next) => {
        //     console.log('TO: ', to, localStorage.get(TOKEN_KEY, 'TOKEN IS NULL'));
        //     if (!localStorage.get(TOKEN_KEY, null) && to.name !== 'login') {
        //         console.log('TOKEN NOT FOUND. GOING TO LOGIN PAGE');
        //         next({name: 'login'});
        //         return;
        //     }
        //     next();
        // });
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        return [
            {
                path: '/logout',
                name: 'logout',
                beforeEnter: (to, from, next) => {
                    console.log('BEFORE LOGOUT');
                    localStorage.delete(STORE_KEY);
                    next({name: 'portfolio'});
                }
            },
            {
                path: '*',
                beforeEnter: () => {
                    console.log('BEFORE ENTER');
                },
                redirect: '/portfolio'
            },
            {
                name: 'portfolio',
                path: '/portfolio',
                component: PortfolioPage
            },
            {
                name: 'trades',
                path: '/trades',
                component: TradesPage
            },
            {
                name: 'settings',
                path: '/settings',
                component: SettingsPage
            }
        ];
    }
}
