import Vue from 'vue';
import VueRouter from 'vue-router';
import {NavigationGuard, Route, RouteConfig} from 'vue-router/types/router';
import {PortfolioPage} from '../pages/portfolioPage';
import {TradesPage} from '../pages/tradesPage';
import {SettingsPage} from '../pages/settingsPage';
import {Container} from 'typescript-ioc';
import {Storage} from '../platform/services/storage'
import {CombinedPortfolioPage} from "../pages/combinedPortfolioPage";
import {LogoutService} from "../services/logoutService";

Vue.use(VueRouter);

/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);

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
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        return [
            {
                path: '/logout',
                name: 'logout',
                beforeEnter: () => (<LogoutService> Container.get(LogoutService)).logout()
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
                name: 'combined-portfolio',
                path: '/combined-portfolio',
                component: CombinedPortfolioPage
            },
            {
                name: 'settings',
                path: '/settings',
                component: SettingsPage
            }
        ];
    }
}
