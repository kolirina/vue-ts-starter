import {Container} from "typescript-ioc";
import Vue from "vue";
import VueRouter from "vue-router";
import {RouteConfig} from "vue-router/types/router";
import {BalancesPage} from "../pages/balancesPage";
import {BondInfoPage} from "../pages/bondInfoPage";
import {CombinedPortfolioPage} from "../pages/combinedPortfolioPage";
import {DividendsPage} from "../pages/dividendsPage";
import {EventsPage} from "../pages/eventsPage";
import {HelpPage} from "../pages/helpPage";
import {PortfolioPage} from "../pages/portfolioPage";
import {QuotesPage} from "../pages/quotes/quotesPage";
import {ExportPage} from "../pages/settings/exportPage";
import {ImportPage} from "../pages/settings/importPage";
import {NotificationsPage} from "../pages/settings/notificationsPage";
import {ProfilePage} from "../pages/settings/profilePage";
import {PromoCodesPage} from "../pages/settings/promoCodesPage";
import {SettingsPage} from "../pages/settings/settingsPage";
import {TariffsPage} from "../pages/settings/tariffsPage";
import {ShareInfoPage} from "../pages/shareInfoPage";
import {TradesPage} from "../pages/tradesPage";
import {Storage} from "../platform/services/storage";
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
                path: "/logout",
                name: "logout",
                beforeEnter: () => (Container.get(LogoutService) as LogoutService).logout()
            },
            {
                path: "*",
                beforeEnter: () => {
                    console.log("BEFORE ENTER");
                },
                redirect: "/portfolio"
            },
            {
                name: "portfolio",
                path: "/portfolio",
                component: PortfolioPage
            },
            {
                name: "events",
                path: "/events",
                component: EventsPage
            },
            {
                name: "dividends",
                path: "/dividends",
                component: DividendsPage
            },
            {
                name: "trades",
                path: "/trades",
                component: TradesPage
            },
            {
                name: "combined-portfolio",
                path: "/combined-portfolio",
                component: CombinedPortfolioPage
            },
            {
                name: "quotes",
                path: "/quotes",
                component: QuotesPage
            },
            {
                name: "share-info",
                path: "/share-info/:ticker",
                component: ShareInfoPage
            },
            {
                name: "bond-info",
                path: "/bond-info/:isin",
                component: BondInfoPage
            },
            {
                name: "portfolio-settings",
                path: "/portfolio-settings",
                component: SettingsPage
            },
            {
                name: "help",
                path: "/help",
                component: HelpPage
            },
            {
                name: "export",
                path: "/export",
                component: ExportPage
            },
            {
                name: "import",
                path: "/import",
                component: ImportPage
            },
            {
                name: "profile",
                path: "/profile",
                component: ProfilePage
            },
            {
                name: "tariffs",
                path: "/tariffs",
                component: TariffsPage
            },
            {
                name: "promo-codes",
                path: "/promo-codes",
                component: PromoCodesPage
            },
            {
                name: "notifications",
                path: "/notifications",
                component: NotificationsPage
            },
            {
                name: "balances",
                path: "/balances",
                component: BalancesPage
            }
        ];
    }
}
