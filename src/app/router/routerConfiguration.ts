import moment from "moment";
import {Container} from "typescript-ioc";
import Vue from "vue";
import VueRouter, {Route} from "vue-router";
import {RouteConfig} from "vue-router/types/router";
import {Resolver} from "../../../typings/vue";
import {TariffExpiredDialog} from "../components/dialogs/tariffExpiredDialog";
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
import {ClientService} from "../services/clientService";
import {LogoutService} from "../services/logoutService";
import {StoreKeys} from "../types/storeKeys";
import {Tariff} from "../types/tariff";
import {DateUtils} from "../utils/dateUtils";

Vue.use(VueRouter);

/** Сервис работы с клиентом */
const clientService: ClientService = Container.get(ClientService);
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
                scrollBehavior: ((): any => ({x: 0, y: 0}))
            });
            RouterConfiguration.router.beforeEach(async (to: Route, from: Route, next: Resolver): Promise<void> => {
                // осуществляем переход по роуту если пользователь залогинен, его тариф не Бесплатный и тариф действущий
                const tariffAllowed = (to.meta as ShowTariffMeta).tariffAllowed;
                const authorized = !!localStorage.get(StoreKeys.TOKEN_KEY, null);
                if (!tariffAllowed && authorized) {
                    const client = await clientService.getClientInfo();
                    const tariffExpired = client.tariff !== Tariff.FREE && DateUtils.parseDate(client.paidTill).isBefore(moment());
                    if (tariffExpired) {
                        await new TariffExpiredDialog().show(RouterConfiguration.router);
                        next(false);
                    } else {
                        next();
                    }
                } else {
                    next();
                }
            });
        }
        return RouterConfiguration.router;
    }

    private static createRoutes(): RouteConfig[] {
        return [
            {
                path: "/logout",
                name: "logout",
                meta: {tariffAllowed: true},
                beforeEnter: (): Promise<void> => (Container.get(LogoutService) as LogoutService).logout()
            },
            {
                path: "*",
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
                meta: {tariffAllowed: true},
                component: QuotesPage
            },
            {
                path: "/share-info",
                meta: {tariffAllowed: true},
                redirect: "/share-info/GAZP"
            },
            {
                path: "/share-info/:ticker",
                component: ShareInfoPage,
                children: [
                    {
                        path: "",
                        name: "share",
                        meta: {tariffAllowed: true},
                        component: ShareInfoPage
                    }
                ],
            },
            {
                name: "bond-info",
                meta: {tariffAllowed: true},
                path: "/bond-info/:isin",
                component: BondInfoPage
            },
            {
                name: "portfolio-settings",
                path: "/portfolio-settings",
                meta: {tariffAllowed: true},
                component: SettingsPage
            },
            {
                name: "help",
                path: "/help",
                meta: {tariffAllowed: true},
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
                meta: {tariffAllowed: true},
                component: ProfilePage
            },
            {
                name: "tariffs",
                path: "/tariffs",
                meta: {tariffAllowed: true},
                component: TariffsPage
            },
            {
                name: "promo-codes",
                path: "/promo-codes",
                meta: {tariffAllowed: true},
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

interface ShowTariffMeta {
    tariffAllowed: boolean;
}
