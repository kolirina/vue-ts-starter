import Vue from "vue";
import VueRouter, {Route} from "vue-router";
import {RouteConfig} from "vue-router/types/router";
import {Resolver} from "../../../typings/vue";
import {RouteMeta} from "../types/router/types";

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
                scrollBehavior: ((): any => ({x: 0, y: 0}))
            });
            RouterConfiguration.router.beforeEach(async (to: Route, from: Route, next: Resolver): Promise<void> => {
                // добавляем meta-тэги
                RouterConfiguration.renderMetaTags(to);
                next();
            });
        }
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        return [
            {
                path: "/logout",
                name: "logout",
                beforeEnter: (): void => {
                }
            },
            {
                path: "*",
                redirect: "/"
            },
        ];
    }

    /**
     * Обрабатывает  meta-тэги. На данном этапе только меняет title страницы
     * @param to route к которому осуществляется переход
     */
    private static renderMetaTags(to: Route): void {
        const title = (to.meta as RouteMeta).title;
        document.title = title || "DefaultTitle";
    }
}
