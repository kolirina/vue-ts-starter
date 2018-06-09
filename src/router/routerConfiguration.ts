import Vue from "vue";
import VueRouter from "vue-router";
import {RouteConfig} from "vue-router/types/router";
import {PortfolioPage} from "../pages/portfolioPage";
import {TradesPage} from "../pages/tradesPage";
import {SettingsPage} from "../pages/settingsPage";

Vue.use(VueRouter);

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
                base: "/",
                routes: RouterConfiguration.createRoutes(),
                scrollBehavior: (() => ({x: 0, y: 0}))
            });
        }
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        return [
            {
                name: 'portfolio',
                path: "/portfolio",
                component: PortfolioPage
            },
            {
                name: 'trades',
                path: "/trades",
                component: TradesPage
            },
            {
                name: 'settings',
                path: "/settings",
                component: SettingsPage
            }
        ];
    }
}
