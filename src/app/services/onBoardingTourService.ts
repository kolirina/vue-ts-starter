/*
 * STRICTLY CONFIDENTIAL
 * TRADE SECRET
 * PROPRIETARY:
 *       "Intelinvest" Ltd, TIN 1655386205
 *       420107, REPUBLIC OF TATARSTAN, KAZAN CITY, SPARTAKOVSKAYA STREET, HOUSE 2, ROOM 119
 * (c) "Intelinvest" Ltd, 2019
 *
 * СТРОГО КОНФИДЕНЦИАЛЬНО
 * КОММЕРЧЕСКАЯ ТАЙНА
 * СОБСТВЕННИК:
 *       ООО "Интеллектуальные инвестиции", ИНН 1655386205
 *       420107, РЕСПУБЛИКА ТАТАРСТАН, ГОРОД КАЗАНЬ, УЛИЦА СПАРТАКОВСКАЯ, ДОМ 2, ПОМЕЩЕНИЕ 119
 * (c) ООО "Интеллектуальные инвестиции", 2019
 */

import {Inject, Singleton} from "typescript-ioc";
import {Service} from "../platform/decorators/service";
import {Http} from "../platform/services/http";
import {Overview} from "../types/types";
import {PortfolioUtils} from "../utils/portfolioUtils";

@Service("OnBoardingTourService")
@Singleton
export class OnBoardingTourService {

    @Inject
    private http: Http;
    /** Корневой url */
    private readonly ROOT = "/onboarding";
    /** Карта пользовательских туров */
    private userTours: UserOnBoardTours = null;

    /**
     * Инициализирует данные туров пользователя
     */
    async initTours(): Promise<UserOnBoardTours> {
        if (!this.userTours) {
            const result = await this.http.get<OnBoardTour[]>(this.ROOT);
            this.userTours = {};
            result.forEach(tour => this.userTours[tour.name] = tour);
        }
        return this.userTours;
    }

    /**
     * Возвращает данные по доходностям бенчмарков в сравнении с доходностью портфеля
     */
    getOnBoardingTours(): UserOnBoardTours {
        return this.userTours;
    }

    /**
     * Возвращает данные по ставкам депозитов за последние 6 месяцев
     */
    async saveOrUpdateOnBoardTour(tour: OnBoardTour): Promise<void> {
        if (!tour.id) {
            const result = await this.http.post<OnBoardTour>(this.ROOT, tour);
            this.userTours[result.name] = result;
        } else {
            await this.http.put(this.ROOT, tour);
            this.userTours[tour.name] = tour;
        }
    }

    /**
     * Возвращает набор шагов для тура
     * @param tourName имя тура
     * @param overview данные по портфелю
     */
    async getTourSteps(tourName: string, overview: Overview): Promise<TourStep[]> {
        const userTour = this.getOnBoardingTours()[tourName];
        if (!userTour || !userTour.complete && !userTour.skipped) {
            const steps: TourStep[] = TOUR_STEPS[tourName];
            switch (tourName) {
                case TourName.PORTFOLIO:
                    return this.preparePortfolioSteps(overview);
                case TourName.TRADES:
                    const emptyPortfolio = PortfolioUtils.isBlockShowed(overview, PortfolioBlockType.EMPTY);
                    return emptyPortfolio ? TOUR_STEPS[TourName.INTRO_TRADES] : steps;
                default:
                    return steps || [];
            }
        }
        return [];
    }

    /**
     * Возвращает набор шагов для тура по странице Портфель. Так как блоков может быть разное количество и разный порядок
     * @param overview данные по портфелю
     */
    private preparePortfolioSteps(overview: Overview): TourStep[] {
        const steps: TourStep[] = [];
        const blockIndexes: { [key: string]: number } = PortfolioUtils.getShowedBlocks(overview);
        Object.keys(blockIndexes).forEach(type => {
            const rendered = PortfolioUtils.isBlockShowed(overview, type as PortfolioBlockType);
            if (rendered) {
                const index = String(blockIndexes[type]);
                const step = TOURS_BY_PORTFOLIO_BLOCK[type];
                step.target = step.target.replace("$0", String(index));
                steps.push(step);
            }
        });
        return steps;
    }
}

/** Карта пользовательских туров */
export interface UserOnBoardTours {
    [key: string]: OnBoardTour;
}

/** Описание тура пользователя */
export interface OnBoardTour {
    /** Идентификатор тура */
    id?: number;
    /** Название тура/страницы/элемента к которой он привязан */
    name: string;
    /** Текущий шаг тура, на котором остановился пользователь */
    currentStep: number;
    /** Общее количество шагов в туре */
    totalSteps: number;
    /** Признак пропуска тура */
    skipped: boolean;
    /** Признак завершенности тура */
    complete: boolean;
}

/** Перечисление доступных туров */
export enum TourName {
    INTRO_PORTFOLIO = "intro_portfolio",
    INTRO_TRADES = "intro_trades",
    PORTFOLIO = "portfolio",
    EVENTS = "events",
    TRADES = "trades",
    IMPORT = "import",
    PORTFOLIO_MANAGEMENT = "portfolio_management",
    NOTIFICATIONS = "notifications",
    QUOTES = "quotes_stock",
    QUOTES_BOND = "quotes_bond",
    QUOTES_CURRENCY = "quotes_currency",
    QUOTES_COMMON = "quotes_common-assets",
    STOCK_INFO = "stock_info",
    COMBINED_PORTFOLIO = "combined_portfolio",
    USER_ASSETS = "quotes_user-assets",
}

/** Сущность шага */
export interface TourStep {
    target: string;
    content: string;
    duration?: number;
    params?: TourStepParams;
}

/** Параметры шага */
export interface TourStepParams {
    placement?: "left" | "top" | "right" | "bottom";
    enableScrolling?: boolean;
    offset?: number;
    hideButtons?: boolean;
}

export enum TourEventType {
    DONE = "DONE",
    SKIP = "SKIP"
}

export interface TourEvent {
    type: TourEventType;
}

/** Блоки портфеля к которым необходимо отобразить подсказку */
export enum PortfolioBlockType {
    DASHBOARD = "DASHBOARD",
    AGGREGATE_TABLE = "ASSETS",
    ASSETS_CHART = "ASSETS_CHART",
    AGGREGATE_CHART = "AGGREGATE_CHART",
    STOCK_TABLE = "STOCK_TABLE",
    ETF_TABLE = "ETF_TABLE",
    ASSET_TABLE = "ASSET_TABLE",
    BOND_TABLE = "BOND_TABLE",
    HISTORY_CHART = "HISTORY_CHART",
    STOCK_CHART = "STOCK_CHART",
    ETF_CHART = "ETF_CHART",
    BOND_CHART = "BOND_CHART",
    SECTORS_CHART = "SECTORS_CHART",
    BOND_SECTORS_CHART = "BOND_SECTORS_CHART",
    EMPTY = "EMPTY"
}

const QUOTES_TOUR: TourStep[] = [
    {
        target: `[data-v-step="0"]`,
        content: "В этом разделе вы можете ознакомиться со всеми бумагами доступными на сервисе. Быстро найти и отфильтровать бумаги по ценам, изменению, " +
            "рейтингу и т.д. Быстро перейти к профилю эмитента на сайте биржи.<br>" +
            "Поддерживается пользовательский фильтр, который позволяет быстро отобразить в таблице только те бумаги, которые есть у вас в портфеле.",
        params: {
            placement: "bottom",
            enableScrolling: false
        }
    }
];

/**
 * Набор всех шагов в разбивке по турам
 */
export const TOUR_STEPS: { [key: string]: TourStep[] } = {
    [TourName.INTRO_TRADES]: [
        {
            target: `[data-v-step="0"]`,
            content: "Добро пожаловать в Intelinvest - сервис учёта и контроля инвестиций. <br>" +
                "Мы подготовили для вас небольшой вводный тур, чтобы вам было легче у нас освоиться. <br>" +
                "После добавления сделок здесь появится список всех ваших сделок." +
                "Чтобы начать заполнять свой портфель, кликните на эту кнопку и загрузите отчёт о сделках вашего брокера.",
            params: {
                placement: "bottom",
                hideButtons: false
            }
        }],
    [TourName.PORTFOLIO]: [],
    [TourName.COMBINED_PORTFOLIO]: [
        {
            target: `[data-v-step="0"]`,
            content: "На данной странице вы можете объединить для просмотра два и более портфелей в один.<br>" +
                "Например, вы хотите видеть полную информацию по вашему брокерскому счету и ИИС, вы легко сможете сделать это здесь.<br>" +
                "Это полезно, когда у вас на разных счетах есть одни и те же бумаги и вы хотите знать какую долю эти бумаги занимают в общем портфеле, чтобы принять решение о " +
                "последующей ребалансировке портфеля. " +
                "Также можно не только объединять несколько портфелей в один, но и посмотреть ваши портфели в разных валютах, например, ваши рублевые портфели в долларах.<br>" +
                "",
            params: {
                placement: "bottom",
            }
        }
    ],
    [TourName.TRADES]: [
        {
            target: `[data-v-step="0"]`,
            content: "На данной странице отображается список всех ваших сделок в портфеле.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "С помощью фильтра легко работать со списком сделок. Можно отобразить только нужные операции, скрыть связанные сделки, " +
                "отфильтровать сделки по дате, или найти определенную сделку.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
    ],
    [TourName.QUOTES]: QUOTES_TOUR,
    [TourName.QUOTES_BOND]: QUOTES_TOUR,
    [TourName.QUOTES_CURRENCY]: QUOTES_TOUR,
    [TourName.QUOTES_COMMON]: QUOTES_TOUR,
    [TourName.USER_ASSETS]: [
        {
            target: `[data-v-step="0"]`,
            content: "В этом разделе будут отображаться созданные вами произвольные активы. <br/>" +
                "Вы можете добавить любой произвольный актив, который не поддерживается системой.<br/>" +
                "Например, учесть квартиру, которую вы сдаете и получаете с нее доход," +
                "учесть структурный продукт или часть портфеля у доверительного управляюещго.<br/>" +
                "Любой инструмент, который вы хотите учитывать в составе своего портфеля." +
                "<br/><br/>" +
                "Если вы хотите подробнее узнать как работать " +
                "с произвольными активами, перейдите в раздел Справка - Произвольные активы.",
            params: {
                placement: "top",
                enableScrolling: false
            }
        }
    ],
    [TourName.STOCK_INFO]: [
        {
            target: `[data-v-step="0"]`,
            content: "На данной странице отображается подробная информация по бумаге. Просматривайте ее основные показатели динамики и доходности.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "Рейтинг бумаги рассчитывается на основе голосов всех пользователей, выставлявших рейтинг. Вы можете тоже влиять на рейтинг бумаг, которые вы считаете " +
                " перспективными или недостаточно привлекательными для инвестирования.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="2"]`,
            content: "График динамики цены бумаги. На нем также могут отображаться дивиденды, а также ваши сделки, чтобы понимать насколько верно вы выбрали момент для покупки." +
                " Еще на графике будет отображаться линия средней цены, чтобы вы могли быстро оценить, необходимо ли покупать бумагу сейчас, например, если текущая цена будет" +
                " ниже вашей средней цены.",
            params: {
                placement: "top",
                enableScrolling: true
            }
        },
        {
            target: `[data-v-step="3"]`,
            content: "График всех дивидендных выплат по бумаге, чтобы вы могли быстро оценить дивидендную политику компании.",
            params: {
                placement: "top",
                enableScrolling: true
            }
        }
    ],
    [TourName.PORTFOLIO_MANAGEMENT]: [
        {
            target: `[data-v-step="0"]`,
            content: "Это раздел для управления вашими портфелями. Здесь вы сможете: " +
                "<ul style='font-size: 12px; text-align: initial;'>" +
                "<li>добавлять и удалять портфели</li>" +
                "<li>создать копию портфеля</li>" +
                "<li>быстро очистить портфель от всех сделок</li>" +
                "<li>настроить параметры портфеля (например, фиксированную комиссию или Профессиональный режим)</li>" +
                "<li>настроить доступ к портфелю</li>" +
                "</ul>",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "Меню управления портфелем. Доступно Редактирование, Создание копии, Очистка и Удаление портфеля.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="2"]`,
            content: "Разверните строку таблицы чтобы получить доступ к расширенным настройкам портфеля, включая настройки доступа. <br>" +
                "Здесь вы сможете скопировать ссылки на информеры, страницу с публичным портфелей, выбрать блоки для встраивания в свой блог или сайт. <br>" +
                "Быстро включить или выклюить Профессиональный режим.",
            params: {
                placement: "right",
                enableScrolling: false
            }
        }
    ],
    [TourName.NOTIFICATIONS]: [
        {
            target: `[data-v-step="0"]`,
            content: "Это раздел служит для подписки на цены по бумагам, а также о важных событиях эмитента. Здесь вы сможете: " +
                "<ul style='font-size: 12px; text-align: initial;'>" +
                "<li>установить подписку на целевые цены для покупки/продажи бумаги</li>" +
                "<li>настроить подписку на корпоративные новости эмитента</li>" +
                "<li>настроить уведомления о предстоящих выплатах (дивиденды, купоны, амортизация)</li>" +
                "</ul>",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        }
    ],
    [TourName.IMPORT]: [
        {
            target: `[data-v-step="0"]`,
            content: "Выберите иконку вашего брокера",
            params: {
                placement: "bottom"
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "Следуйте инструкции со скриншотами, чтобы скачать отчет брокера. Загрузите полученный отчет, " +
                "используя кнопку выбора файла или просто перетащив файл в зону загрузки. Для вашего удобства мы также подготовили подробную видео-инструкцию",
            params: {
                placement: "top"
            }
        }
    ],
    [TourName.EVENTS]: [
        {
            target: `[data-v-step="0"]`,
            content: "В этом разделе будут отображаться все новые события по вашему портфелю. Как только наступит дата дивиденда, купона, амортизации или погашения, " +
                "они отобразятся в этом разделе",
            params: {
                placement: "top",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="1"]`,
            content: "В этом разделе будут отображаться все предполагаемые дивиденды по вашему портфелю.",
            params: {
                placement: "top",
                enableScrolling: false
            }
        },
        {
            target: `[data-v-step="2"]`,
            content: "Календарь событий предназначен для быстрого поиска начислений ценных бумаг. Вы можете быстро отфильтровать события по типу и по дате.",
            params: {
                placement: "bottom",
                enableScrolling: false
            }
        }
    ]
};

/**
 * Набор шагов для блоков на странице Портфель
 */
export const TOURS_BY_PORTFOLIO_BLOCK: { [key: string]: TourStep } = {
    [PortfolioBlockType.EMPTY]: {
        target: `[data-v-step="$0"]`,
        content: "Добро пожаловать в Intelinvest - сервис учёта и контроля инвестиций. <br><br>" +
            "Мы подготовили для вас небольшой вводный тур, чтобы вам было легче у нас освоиться. <br><br>" +
            "Это основная страница, после добавления сделок, здесь появятся " +
            "показатели вашего портфеля (прибыль, доходность и пр.) <br><br>" +
            "Чтобы начать заполнять свой портфель, кликните на эту кнопку и загрузите отчёт со сделками от вашего брокера.",
        params: {
            placement: "bottom",
            hideButtons: false
        }
    },
    [PortfolioBlockType.DASHBOARD]: {
        target: `[data-v-step="$0"]`,
        content: "Это дашборд, он отображает основную и оперативную информацию о портфеле для быстрой оценки его состояния." +
            "У каждого показателя есть подсказка о том как он расчитывается и что означает.",
        params: {
            placement: "bottom"
        }
    },
    [PortfolioBlockType.AGGREGATE_TABLE]: {
        target: `[data-v-step="$0"]`,
        content: "Это таблица с активами находящимися в вашем портфеле. На ее основе вы можете, например, быстро оценить какой размер занимает отдельный актив в портфеле.",
        params: {
            placement: "bottom",
            enableScrolling: false
        }
    },
    [PortfolioBlockType.STOCK_TABLE]: {
        target: `[data-v-step="$0"]`,
        content: "Это таблица с по акциям и ETF. В ней отображается подробная информация по каждой бумаге в отдельности. Если у вас возникнут вопросы о том как расчитан тот" +
            " или иной показатель, обратите внимание на подсказки у колонок таблицы. Для таблицы есть возможность настроить отображаемые колонки. " +
            "Операция доступна из меню по трем точкам справа.",
        params: {
            placement: "top",
            enableScrolling: false
        }
    },
    [PortfolioBlockType.BOND_TABLE]: {
        target: `[data-v-step="$0"]`,
        content: "Это таблица с по облигациям. В ней отображается подробная информация по каждой бумаге в отдельности. Если у вас возникнут вопросы о том как расчитан тот" +
            " или иной показатель, обратите внимание на подсказки у колонок таблицы. Для таблицы есть возможность настроить отображаемые колонки. " +
            "Операция доступна из меню по трем точкам справа.",
        params: {
            placement: "top"
        }
    },
    [PortfolioBlockType.STOCK_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "Диаграмма распределения акций и ETF в портфеле, доли считаются относительно стоимости акций и ETF. " +
            "Можно сразу понять какая бумага стала занимать слишком много в портфеле.",
        params: {
            placement: "top"
        }
    },
    [PortfolioBlockType.BOND_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "Диаграмма распределения облигаций в портфеле, доли считаются относительно стоимости облигаций. " +
            "Можно сразу понять какая бумага стала занимать слишком много в портфеле.",
        params: {
            placement: "top"
        }
    },
    [PortfolioBlockType.BOND_SECTORS_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "Диаграмма распределения облигаций в портфеле по ее типу. " +
            "Полезно, если придерживаетесь диверсификации по разным типам облигаций в портфеле (ОФЗ, Муниципальные, Корпоративные и т.д.).",
        params: {
            placement: "top"
        }
    },
    [PortfolioBlockType.ASSETS_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "Диаграмма распределения активов в портфеле, доли считаются относительно суммарной стоимости портфеля.",
        params: {
            placement: "top",
            offset: 200
        }
    },
    [PortfolioBlockType.HISTORY_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "График стоимости портфеля. Позволяет видеть динамику портфеля во времени. На графике можно отобразить сделки, сравнить с бенчмарком (Индекс IMOEX). " +
            "Также можно отобразить не только график суммарной стоимости, но и стоимости акций, облигаций, денежных средств и вводов/выводов денег в портфеле по отдельности.",
        params: {
            placement: "top"
        }
    },
    [PortfolioBlockType.SECTORS_CHART]: {
        target: `[data-v-step="$0"]`,
        content: "Диаграмма распределения акций и ETF по секторам экономики",
        params: {
            placement: "top"
        }
    },
};
