import {Container} from "typescript-ioc";
import Vue from "vue";
import VueRouter, {Route} from "vue-router";
import {RouteConfig} from "vue-router/types/router";
import {Resolver} from "../../../typings/vue";
import {AuthComponent} from "../app/authComponent";
import {BlockByTariffDialog} from "../components/dialogs/blockByTariffDialog";
import {TariffExpiredDialog} from "../components/dialogs/tariffExpiredDialog";
import {AnalyticsPage} from "../pages/analytics/analyticsPage";
import {AssetInfoPage} from "../pages/assetInfoPage";
import {BalancesPage} from "../pages/balancesPage";
import {BondInfoPage} from "../pages/bondInfoPage";
import {DividendsPage} from "../pages/dividendsPage";
import {EventsPage} from "../pages/eventsPage";
import {HelpPage} from "../pages/helpPage";
import {PortfolioPage} from "../pages/portfolioPage";
import {PublicPortfolioPage} from "../pages/public-portfolio/publicPortfolioPage";
import {QuotesPage} from "../pages/quotes/quotesPage";
import {RebalancingPage} from "../pages/rebalancingPage";
import {ExportPage} from "../pages/settings/exportPage";
import {ImportHistoryPage} from "../pages/settings/importHistoryPage";
import {ImportPage} from "../pages/settings/importPage";
import {NotificationsPage} from "../pages/settings/notificationsPage";
import {PortfolioManagementEditPage} from "../pages/settings/portfolio-management/portfolioManagementEditPage";
import {PortfoliosManagementPage} from "../pages/settings/portfoliosManagementPage";
import {ProfileInterfacePage} from "../pages/settings/profile/profileInterfacePage";
import {ProfileMainPage} from "../pages/settings/profile/profileMainPage";
import {ProfilePaymentPage} from "../pages/settings/profile/profilePaymentPage";
import {ProfileSubscriptionPage} from "../pages/settings/profile/profileSubscriptionPage";
import {ProfilePage} from "../pages/settings/profilePage";
import {PromoCodesPage} from "../pages/settings/promoCodesPage";
import {SettingsPage} from "../pages/settings/settingsPage";
import {TagsSettingsPage} from "../pages/settings/tagsSettingsPage";
import {TariffsPage} from "../pages/settings/tariffsPage";
import {ShareInfoPage} from "../pages/shareInfoPage";
import {TradesPage} from "../pages/tradesPage";
import {Storage} from "../platform/services/storage";
import {ClientService} from "../services/clientService";
import {LogoutService} from "../services/logoutService";
import {RouteMeta} from "../types/router/types";
import {StoreKeys} from "../types/storeKeys";
import {ForbiddenCode} from "../types/types";
import {CommonUtils} from "../utils/commonUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {VuexConfiguration} from "../vuex/vuexConfiguration";

Vue.use(VueRouter);

/** Сервис работы с клиентом */
const clientService: ClientService = Container.get(ClientService);
/** Сервис работы с localStorage */
const localStorage: Storage = Container.get(Storage);
/** Стор приложения */
const store = VuexConfiguration.getStore();

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
                const authorized = !!localStorage.get(StoreKeys.TOKEN_KEY, null);
                if (!to.meta.public && !authorized) {
                    next(false);
                    return;
                }
                const client = await clientService.getClientInfo();
                next();
                // сбрасываем состояние хинта уже после перехода, чтобы повторно не всплыл хинт
                // TODO возможно не хватит задержки, надо подумать как сделать лучше
                setTimeout(() => this.resetTariffHint(), 500);
                // скрываем меню в мобильном виде при переходе
                if (CommonUtils.isMobile()) {
                    (store as any).state.MAIN.sideBarOpened = true;
                }
                // осуществляем переход по роуту и если пользователь залогинен отображаем диалог об истечении тарифа при соблюдении условий
                const tariffAllowed = (to.meta as RouteMeta).tariffAllowed;
                if (!tariffAllowed && authorized) {
                    const tariffExpired = TariffUtils.isTariffExpired(client);

                    if (tariffExpired) {
                        await new TariffExpiredDialog().show(RouterConfiguration.router);
                    }
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
                name: "auth",
                path: "/auth/:token",
                meta: {public: true},
                component: AuthComponent
            },
            {
                name: "portfolio",
                path: "/portfolio",
                component: PortfolioPage,
                meta: {
                    tariffAllowed: true,
                    title: "Портфель",
                    tourName: "portfolio"
                }
            },
            {
                name: "adviser",
                path: "/adviser",
                meta: {
                    tariffAllowed: true,
                    title: "Аналитика"
                },
                component: AnalyticsPage,
            },
            {
                name: "events",
                path: "/events",
                component: EventsPage,
                meta: {
                    title: "События",
                    tourName: "events"
                }
            },
            {
                name: "calculations",
                path: "/calculations",
                component: DividendsPage,
                meta: {
                    title: "Начисления"
                }
            },
            {
                name: "trades",
                path: "/trades",
                component: TradesPage,
                meta: {
                    tariffAllowed: true,
                    title: "Сделки",
                    tourName: "trades"
                }
            },
            {
                name: "rebalancing",
                path: "/rebalancing",
                component: RebalancingPage,
                meta: {
                    title: "Ребалансировка",
                    tourName: "rebalancing"
                }
            },
            {
                name: "combined-portfolio",
                path: "/combined-portfolio",
                component: PortfolioPage,
                meta: {
                    tariffAllowed: true,
                    title: "Составной портфель",
                    tourName: "combined_portfolio"
                },
                beforeEnter: async (to: Route, from: Route, next: Resolver): Promise<void> => {
                    const client = await clientService.getClientInfo();
                    const tariffLimitsExceeded = TariffUtils.limitsExceeded(client);

                    if (tariffLimitsExceeded) {
                        await new BlockByTariffDialog().show(ForbiddenCode.LIMIT_EXCEEDED);
                        next(false);
                        return;
                    }
                    next();
                }
            },
            {
                path: "/quotes",
                redirect: "/quotes/stock",
                component: QuotesPage,
            },
            {
                path: "/quotes/:tab",
                component: QuotesPage,
                children: [
                    {
                        path: "",
                        name: "quotes",
                        meta: {
                            tariffAllowed: true,
                            title: "Котировки",
                            tourName: "quotes"
                        },
                        component: QuotesPage
                    }]
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
                        meta: {
                            tariffAllowed: true,
                            title: "Информация по бумаге",
                            tourName: "stock_info"
                        },
                        component: ShareInfoPage
                    }
                ],
            },
            {
                path: "/asset-info/:ticker",
                name: "asset",
                meta: {
                    tariffAllowed: true,
                    title: "Информация по активу"
                },
                component: AssetInfoPage
            },
            {
                name: "bond-info",
                meta: {
                    tariffAllowed: true,
                    title: "Информация по бумаге"
                },
                path: "/bond-info/:isin",
                component: BondInfoPage
            },
            {
                name: "settings",
                path: "/settings",
                component: SettingsPage,
                redirect: "/settings/portfolio-management",
                children: [
                    {
                        name: "portfolio-management",
                        path: "/settings/portfolio-management",
                        meta: {
                            tariffAllowed: true,
                            title: "Управление портфелями",
                            tourName: "portfolio_management"
                        },
                        component: PortfoliosManagementPage
                    },
                    {
                        name: "portfolio-management-edit",
                        path: "/settings/portfolio-management/:id",
                        component: PortfolioManagementEditPage,
                        meta: {
                            title: "Управление портфелями"
                        }
                    },
                    {
                        name: "tags",
                        path: "/settings/tags",
                        component: TagsSettingsPage,
                        meta: {
                            title: "Управление тэгами"
                        }
                    },
                    {
                        name: "export",
                        path: "export",
                        component: ExportPage,
                        meta: {
                            title: "Экспорт сделок"
                        }
                    },
                    {
                        name: "import",
                        path: "import",
                        component: ImportPage,
                        meta: {
                            title: "Импорт сделок",
                            tourName: "import"
                        }
                    },
                    {
                        name: "import-history",
                        path: "import-history",
                        component: ImportHistoryPage,
                        meta: {
                            title: "История импорта",
                            tourName: "import-history"
                        }
                    },
                    {
                        name: "tariffs",
                        path: "tariffs/",
                        meta: {
                            tariffAllowed: true,
                            title: "Тарифы"
                        },
                        component: TariffsPage
                    },
                    {
                        name: "tariffs_status",
                        path: "tariffs/:status",
                        meta: {
                            tariffAllowed: true,
                            title: "Тарифы"
                        },
                        component: TariffsPage
                    },
                    {
                        name: "promo-codes",
                        path: "promo-codes",
                        meta: {
                            tariffAllowed: true,
                            title: "Партнерская программа"
                        },
                        component: PromoCodesPage
                    },
                    {
                        name: "notifications",
                        path: "notifications",
                        component: NotificationsPage,
                        meta: {
                            title: "Уведомления",
                            tourName: "notifications"
                        }
                    },
                ]
            },
            {
                name: "profile",
                path: "/profile",
                meta: {
                    tariffAllowed: true,
                    title: "Профиль"
                },
                component: ProfilePage
            },
            {
                name: "profile-main",
                path: "/profile/main",
                meta: {
                    tariffAllowed: true,
                    title: "Основные"
                },
                component: ProfileMainPage
            },
            {
                name: "profile-interface",
                path: "/profile/interface",
                meta: {
                    tariffAllowed: true,
                    title: "Интерфейс"
                },
                component: ProfileInterfacePage
            },
            {
                name: "profile-payment",
                path: "/profile/payment",
                meta: {
                    tariffAllowed: true,
                    title: "Способ оплаты"
                },
                component: ProfilePaymentPage
            },
            {
                name: "profile-subscription",
                path: "/profile/subscription",
                meta: {
                    tariffAllowed: true,
                    title: "Подписки"
                },
                component: ProfileSubscriptionPage
            },
            {
                path: "/help",
                name: "help",
                meta: {tariffAllowed: true},
                redirect: "/help/contents"
            },
            {
                path: "/help/:section",
                meta: {
                    tariffAllowed: true,
                    title: "Помощь"
                },
                component: HelpPage
            },
            {
                name: "balances",
                path: "/balances",
                component: BalancesPage,
                meta: {
                    title: "Балансы"
                }
            },
            {
                name: "investoteka",
                path: "/investoteka",
                component: PublicPortfolioPage,
                meta: {
                    title: "Инвестотека",
                    tourName: "investoteka",
                    tariffAllowed: true
                }
            },
        ];
    }

    /**
     * Обрабатывает  meta-тэги. На данном этапе только меняет title страницы
     * @param to route к которому осуществляется переход
     */
    private static renderMetaTags(to: Route): void {
        const title = (to.meta as RouteMeta).title;
        document.title = title || "Intelinvest";
    }

    /**
     * Сбрасывает состояние хинта об истекшем тарифе в сторе
     */
    private static resetTariffHint(): void {
        (store as any).state.MAIN.tariffExpiredHintCoords = {
            x: "0px",
            y: "0px",
            display: "none"
        };
    }
}
