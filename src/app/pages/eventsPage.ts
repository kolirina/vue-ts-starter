import Decimal from "decimal.js";
import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {ConfirmDialog} from "../components/dialogs/confirmDialog";
import {EventsAggregateInfoComponent} from "../components/eventsAggregateInfoComponent";
import {DisableConcurrentExecution} from "../platform/decorators/disableConcurrentExecution";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {Storage} from "../platform/services/storage";
import {
    CalendarDateParams,
    CalendarEvent,
    CalendarEventType,
    CalendarParams,
    CalendarType,
    DividendNewsItem,
    EventsAggregateInfo,
    EventService,
    EventsResponse,
    ShareEvent
} from "../services/eventService";
import {AssetType} from "../types/assetType";
import {ChartType, ColumnChartData} from "../types/charts/types";
import {EventType} from "../types/eventType";
import {Operation} from "../types/operation";
import {Pagination, Portfolio, ShareType, TableHeader} from "../types/types";
import {ChartUtils} from "../utils/chartUtils";
import {DateUtils} from "../utils/dateUtils";
import {SortUtils} from "../utils/sortUtils";
import {TariffUtils} from "../utils/tariffUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {UiStateHelper} from "../utils/uiStateHelper";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";
import {PortfolioBasedPage} from "./portfolioBasedPage";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-slide-x-reverse-transition>
            <template v-if="initialized">
                <empty-portfolio-stub v-if="isEmptyBlockShowed" @openCombinedDialog="showDialogCompositePortfolio"></empty-portfolio-stub>
                <v-container v-else fluid class="events">
                    <v-card flat class="header-first-card">
                        <v-card-title class="header-first-card__wrapper-title">
                            <div class="section-title header-first-card__title-text">События</div>
                            <v-spacer></v-spacer>
                            <v-btn @click.stop="openDialog" class="primary">
                                Добавить событие
                            </v-btn>
                        </v-card-title>
                    </v-card>

                    <v-card class="events__card" flat data-v-step="0">
                        <div v-if="showHintPanel" class="events__info-panel">
                            Данный раздел является местом аккумуляции нескольких источников информации о таких начислениях, как дивиденды, купоны, амортизация и погашение.<br>
                            Все используемые источники являются официальными каналами предоставления информации, однако это не исключает, что:<br>
                            <b>- по отдельным активам в разделе нет Событий;<br>
                                - некоторые События предоставлены с ошибкой.</b><br><br>
                            Поэтому обращаем ваше внимание, что <b>перед исполнением начислений проверяйте, пожалуйста, правильность данных.</b><br>
                            Это позволит сохранять данные портфеля корректными.<br>
                            Если же по какой-либо из ваших бумаг нет события в календаре или новостях, добавьте сделку по начислению вручную.<br>
                            <a @click="hideHintsPanel">Больше не показывать</a>
                        </div>
                        <v-card-title class="events__card-title">
                            Новые события
                            <v-spacer></v-spacer>
                            <v-menu v-if="events.length && allowActions" transition="slide-y-transition" bottom left>
                                <v-btn slot="activator" class="events__menu-btn" flat icon dark>
                                    <span class="menuDots"></span>
                                </v-btn>
                                <v-list dense style="cursor: pointer;">
                                    <v-list-tile @click.native="executeAllEvents">
                                        <v-list-tile-title>
                                            Исполнить события с зачислением денег
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click.native="executeAllEventsWithoutMoney"
                                                 title="Полезно, если вы хотите быстро учесть все начисления в доходности портфеля, а текущий баланс укажете самостоятельно.">
                                        <v-list-tile-title>
                                            Исполнить события без зачисления денег
                                        </v-list-tile-title>
                                    </v-list-tile>
                                    <v-list-tile @click.native="confirmDeleteAllEvents" style="color: #ff5b5d;">
                                        <v-list-tile-title class="delete-btn">
                                            Удалить все
                                        </v-list-tile-title>
                                    </v-list-tile>
                                </v-list>
                            </v-menu>
                        </v-card-title>

                        <v-card-text>
                            <events-aggregate-info :events-aggregate-info="eventsAggregateInfo" :viewCurrency="currencyClass"></events-aggregate-info>

                            <v-data-table v-if="events.length" :headers="eventsHeaders" :items="events" item-key="id" :custom-sort="customSortEvents"
                                          class="data-table events-table" :pagination.sync="eventsPagination" hide-actions must-sort>
                                <template #items="props">
                                    <tr class="selectable">
                                        <td class="text-xs-left pl-30">{{ props.item.label }}</td>
                                        <td class="text-xs-left">{{ props.item.share.shortname }}</td>
                                        <td class="text-xs-left">
                                            <stock-link v-if="props.item.type === 'DIVIDEND'" :ticker="props.item.share.ticker"></stock-link>

                                            <bond-link v-if="props.item.type !== 'DIVIDEND'" :ticker="props.item.share.ticker"></bond-link>
                                        </td>
                                        <td class="text-xs-right">{{ props.item.date | date }}</td>
                                        <td class="text-xs-center">{{ props.item.period }}</td>
                                        <td class="text-xs-right ii-number-cell">
                                            {{ props.item.cleanAmount | amount(true) }}
                                            <span class="amount__currency">{{ props.item.cleanAmount | currencySymbol }}</span>
                                        </td>
                                        <td v-if="allowActions" class="justify-end layout pr-3" @click.stop>
                                            <v-menu transition="slide-y-transition" bottom left>
                                                <v-btn slot="activator" flat icon dark>
                                                    <span class="menuDots"></span>
                                                </v-btn>
                                                <v-list dense>
                                                    <v-list-tile @click="openTradeDialog(props.item)">
                                                        <v-list-tile-title>
                                                            Исполнить
                                                        </v-list-tile-title>
                                                    </v-list-tile>
                                                    <v-list-tile @click="rejectEvent(props.item)">
                                                        <v-list-tile-title class="delete-btn">
                                                            Удалить
                                                        </v-list-tile-title>
                                                    </v-list-tile>
                                                </v-list>
                                            </v-menu>
                                        </td>
                                    </tr>
                                </template>
                            </v-data-table>

                            <div v-else class="events-table__empty">{{ emptyTableText }}</div>
                        </v-card-text>
                    </v-card>

                    <v-card style="margin-top: 30px" flat data-v-step="1">
                        <v-card-title class="events__card-title">Дивидендные новости</v-card-title>

                        <v-card-text>
                            <v-data-table v-if="dividendNews.length" :headers="dividendNewsHeaders" :items="dividendNews" item-key="id" :custom-sort="customSortNews"
                                          class="data-table dividend-news-table events-table" hide-actions must-sort>
                                <template #headerCell="props">
                                    <v-tooltip v-if="props.header.tooltip" content-class="custom-tooltip-wrap" bottom>
                                        <template #activator="{ on }">
                                            <span class="data-table__header-with-tooltip" v-on="on">
                                                {{ props.header.text }}
                                            </span>
                                        </template>
                                        <span>
                                          {{ props.header.tooltip }}
                                        </span>
                                    </v-tooltip>
                                    <span v-else>
                                        {{ props.header.text }}
                                    </span>
                                </template>
                                <template #items="props">
                                    <tr class="selectable">
                                        <td class="text-xs-left pl-30">
                                            <stock-link :ticker="props.item.ticker"></stock-link>
                                        </td>
                                        <td class="text-xs-left">{{ props.item.shortname }}</td>
                                        <td class="text-xs-right">{{ props.item.meetDate | date }}</td>
                                        <td class="text-xs-right">{{ props.item.cutDate | date }}</td>
                                        <td class="text-xs-right ii-number-cell">
                                            {{ props.item.recCommonValue | number }}
                                            <span class="amount__currency">{{ props.item.currency | currencySymbolByCurrency }}</span>
                                            <span title="Доходность относительно текущей цены">({{ props.item.yield }} %)</span>
                                        </td>
                                        <td class="text-xs-center pr-3">{{ props.item.source }}</td>
                                    </tr>
                                </template>
                            </v-data-table>

                            <div v-else class="dividend-news-table__empty">Дивидендных новостей по вашим бумагам нет</div>
                        </v-card-text>
                    </v-card>

                    <expanded-panel :value="$uistate.futureEventsChartPanel"
                                    :state="$uistate.FUTURE_EVENTS_CHART_PANEL" @click="onFutureEventsPanelStateChange" custom-menu class="mt-3">
                        <template #header>
                            Будущие выплаты
                            <tooltip>
                                График будущих событий, позволяет оценить потоки будущих платежей.<br/>
                                По облигациям данные получаются из графика выплат.<br/>
                                Дивиденды формируются на основании прошлых выплат, с учетом, что они останутся на том же уровне.
                            </tooltip>
                        </template>
                        <template #customMenu>
                            <chart-export-menu @print="print(ChartType.FUTURE_EVENTS_CHART)" @exportTo="exportTo(ChartType.FUTURE_EVENTS_CHART, $event)"
                                               class="exp-panel-menu"></chart-export-menu>
                        </template>
                        <v-card-text>
                            <events-aggregate-info :events-aggregate-info="eventsAggregateInfoFuture" :viewCurrency="currencyClass" class="margT20"></events-aggregate-info>

                            <column-chart v-if="futureEventsChartData && futureEventsChartData.categoryNames.length" :ref="ChartType.FUTURE_EVENTS_CHART"
                                          :data="futureEventsChartData" :view-currency="currency"
                                          tooltip-format="EVENTS" v-tariff-expired-hint></column-chart>
                        </v-card-text>
                    </expanded-panel>

                    <v-card class="events__card" flat style="margin-top: 30px" data-v-step="2">
                        <v-card-title class="events__card-title">
                            <v-layout class="px-0 py-0" align-center>
                                Календарь событий
                                <v-spacer></v-spacer>
                                <div class="import-wrapper-content pr-1">
                                    <span v-if="customFilter" class="event-calendar-active-filter" title="Настроен фильтр"></span>
                                    <v-menu content-class="dialog-settings-menu" transition="slide-y-transition" nudge-bottom="36" left bottom class="settings-menu my-0 mx-0"
                                            :close-on-content-click="false" min-width="255">
                                        <v-btn class="btn" slot="activator">
                                            Настройки
                                        </v-btn>
                                        <v-list dense>
                                            <div class="title-settings">
                                                Тип события
                                            </div>
                                            <v-flex>
                                                <v-checkbox v-for="event in calendarEventsTypes.values()" :input-value="isCalendarTypeChecked(event.code)"
                                                            @change="changeFilter(event.code)" :key="event.code" hide-details class="checkbox-settings">
                                                    <template #label>
                                                        <span>
                                                            {{ event.description }}
                                                        </span>
                                                    </template>
                                                </v-checkbox>
                                            </v-flex>
                                        </v-list>
                                    </v-menu>
                                </div>
                            </v-layout>
                        </v-card-title>
                        <v-card-text v-if="calendarEvents" class="events-calendar-wrap">
                            <div class="restriction-calendar-width">
                                <v-layout class="pl-3">
                                    <div class="pl-3">
                                        <v-menu v-model="calendarMenu" :close-on-content-click="false" full-width bottom right nudge-bottom="23" nudge-right="6" max-width="290">
                                            <template v-slot:activator="{ on }">
                                                <v-flex :class="['select-date-input', calendarMenu ? 'rotate-icons' : '']">
                                                    <v-input append-icon="keyboard_arrow_down" v-on="on" hide-details>
                                                        {{ formattedDate }}
                                                    </v-input>
                                                </v-flex>
                                            </template>
                                            <v-date-picker v-model="calendarStartDate" type="month" locale="ru" @change="changeMonth()"></v-date-picker>
                                        </v-menu>
                                    </div>
                                </v-layout>
                                <v-sheet>
                                    <v-calendar :now="today" :value="calendarRequestParams.start" :weekdays="weekdays" color="primary" locale="ru">
                                        <template v-slot:day="{ date }">
                                            <div class="wrap-list-events">
                                                <div>
                                                    <div v-for="(calendarEvent, index) in calendarEvents[date]" :key="index">
                                                        <v-menu max-width="267" right nudge-right="150" content-class="fs13 info-about-event" :close-on-content-click="false">
                                                            <template v-slot:activator="{ on }">
                                                                <div v-on="on" :class="[calendarEvent.type.toLowerCase(), 'fs13', 'calendar-events-title', 'pl-2', 'selectable']">
                                                                    {{ calendarEvent.ticker }} {{ calendarEvent.description }}
                                                                </div>
                                                            </template>
                                                            <v-card class="selectable" flat>
                                                                <div v-if="['COUPON', 'AMORTIZATION', 'REPAYMENT'].includes(calendarEvent.type)">
                                                                    <span>
                                                                        {{ calendarEvent.description }} по облигации
                                                                        <bond-link :ticker="calendarEvent.ticker"></bond-link>
                                                                        ({{ calendarEvent.shortName }})
                                                                        в размере {{ calendarEvent.amount }} {{ calendarEvent.currency | currencySymbolByCurrency}}
                                                                    </span>
                                                                    <div class="margT10">
                                                                        <a @click="openTradeDialogForEvent(calendarEvent.ticker, AssetType.BOND)">Добавить в портфель</a>
                                                                    </div>
                                                                </div>
                                                                <div v-if="['DIVIDEND_HISTORY', 'DIVIDEND_NEWS'].includes(calendarEvent.type)">
                                                                    <span v-if="calendarEvent.type === 'DIVIDEND_HISTORY'">Выплата дивиденда по акции</span>
                                                                    <span v-if="calendarEvent.type === 'DIVIDEND_NEWS'">Планируемый дивиденд по акции</span>
                                                                    <stock-link :ticker="calendarEvent.ticker"></stock-link>
                                                                    ({{ calendarEvent.shortName }}) в размере {{ calendarEvent.amount }}
                                                                    {{ calendarEvent.currency | currencySymbolByCurrency}}
                                                                    <div class="margT10">
                                                                        <a @click="openTradeDialogForEvent(calendarEvent.ticker, AssetType.STOCK)">Добавить в портфель</a>
                                                                    </div>
                                                                </div>
                                                            </v-card>
                                                        </v-menu>
                                                    </div>
                                                </div>
                                            </div>
                                        </template>
                                    </v-calendar>
                                </v-sheet>
                            </div>
                        </v-card-text>
                    </v-card>
                </v-container>
            </template>
            <template v-else>
                <content-loader class="content-loader" :height="800" :width="800" :speed="1" primaryColor="#f3f3f3" secondaryColor="#ecebeb">
                    <rect x="0" y="20" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="140" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="260" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="380" rx="5" ry="5" width="801.11" height="100"/>
                    <rect x="0" y="500" rx="5" ry="5" width="801.11" height="100"/>
                </content-loader>
            </template>
        </v-slide-x-reverse-transition>
    `,
    components: {
        "events-aggregate-info": EventsAggregateInfoComponent
    }
})
export class EventsPage extends PortfolioBasedPage {

    private static readonly ACTION_HEADER = {text: "", value: "actions", align: "center", width: "25", sortable: false};

    @MainStore.Getter
    protected portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_CURRENT_PORTFOLIO)
    protected reloadPortfolio: () => Promise<void>;
    @Inject
    protected eventService: EventService;
    @Inject
    protected localStorage: Storage;
    /** Ответ по событиям */
    private eventsResponse: EventsResponse = null;
    /** Ответ по событиям на следуюущий год */
    private eventsFutureResponse: EventsResponse = null;
    /** Данные для диаграммы будущих выплат */
    private futureEventsChartData: ColumnChartData = null;
    /** Дивидендные новости */
    private dividendNews: DividendNewsItem[] = [];
    /** Зголовки таблицы События */
    private eventsHeaders: TableHeader[] = [
        {text: "Событие", align: "left", value: "label", width: "150"},
        {text: "Компания", align: "left", value: "shortname", width: "120"},
        {text: "Тикер", align: "left", value: "ticker", width: "100"},
        {text: "Дата выплаты/Закрытия реестра", align: "right", value: "date", width: "50"},
        {text: "Период", align: "center", value: "period", sortable: false, width: "180"},
        {text: "Начислено", align: "right", value: "cleanAmount", width: "150"},
    ];
    /** Заголовки таблицы Дивидендные новости */
    private dividendNewsHeaders: TableHeader[] = [
        {text: "Тикер", align: "left", value: "ticker", width: "50"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Дата собрания акционеров", align: "right", value: "meetDate", width: "70"},
        {text: "Закрытие реестра", align: "right", value: "cutDate", width: "70"},
        {text: "Размер возможных дивидендов", align: "right", value: "recCommonValue", width: "60", tooltip: "Доходность рассчитана относительно текущей цена акции."},
        {text: "Источник", align: "center", value: "source", sortable: false, width: "70"}
    ];
    /** Параметры дат для отправки в апи */
    private calendarRequestParams: CalendarDateParams = {start: "", end: "", calendarEventTypes: []};
    /** Устанавливаем сегодняшнюю дату */
    private today: string = DateUtils.currentDate();
    /** При загрузке отображать в календаре текущий месяц */
    private calendarStartDate: string = DateUtils.currentDate();
    /** Массив с ивентами для отображения на странице */
    private calendarEvents: CalendarParams = null;
    /** Конфиг отображения мини календаря для пика месяца */
    private calendarMenu: boolean = false;
    /** Типы ивентов которые отображаються на странице */
    private typeCalendarEvents: string[] = [];
    /** Типы ивентов для использования в шаблоне */
    private calendarEventsTypes = CalendarEventType;
    /** Типы актива для использования в шаблоне */
    private AssetType = AssetType;
    /** Порядок дней отображаемых в календаре */
    private weekdays = [1, 2, 3, 4, 5, 6, 0];
    /** Паджинация для задания дефолтной сортировки */
    private eventsPagination: Pagination = this.localStorage.get("eventsPagination", {
        descending: false,
        sortBy: "date",
        rowsPerPage: -1
    });
    /** Признак отображения панели с подсказкой */
    private showHintPanel = true;
    /** Признак инициализации */
    private initialized = false;
    /** Типы круговых диаграмм */
    private ChartType = ChartType;

    /**
     * Инициализация данных
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        try {
            this.showHintPanel = this.localStorage.get("eventsHintPanel", true);
            this.setCalendarRequestParams(DateUtils.getYearDate(this.calendarStartDate), DateUtils.getMonthDate(this.calendarStartDate));
            const eventsFromStorage = this.localStorage.get<string[]>("calendarEvents", null);
            this.typeCalendarEvents = eventsFromStorage ? eventsFromStorage : this.getDefaultFilter();
            this.calendarRequestParams.calendarEventTypes = this.typeCalendarEvents.map(e => e.toUpperCase() as CalendarType);
            await this.loadAllData();
            if (this.allowActions) {
                this.eventsHeaders.push(EventsPage.ACTION_HEADER);
            }
        } finally {
            this.initialized = true;
        }
        UI.on(EventType.TRADE_CREATED, async () => {
            await this.reloadPortfolio();
        });
    }

    beforeDestroy(): void {
        UI.off(EventType.TRADE_CREATED);
    }

    private async loadAllData(): Promise<void> {
        if (this.isEmptyBlockShowed) {
            return;
        }
        await Promise.all([
                this.loadEvents(),
                this.loadFutureEvents(),
                this.loadDividendNews(),
                this.loadCalendarEvents(),
            ]
        );
    }

    @Watch("portfolio")
    @ShowProgress
    @DisableConcurrentExecution
    private async onPortfolioChange(): Promise<void> {
        if (this.isEmptyBlockShowed) {
            return;
        }
        await this.loadEvents();
        await this.loadFutureEvents();
        await this.loadDividendNews();
        // если выбран фильтр Пользовательские, нужно перезагрузить календарь
        if (this.typeCalendarEvents.includes(CalendarEventType.USER.code.toLowerCase())) {
            await this.loadCalendarEvents();
        }
        if (this.allowActions) {
            this.eventsHeaders.push(EventsPage.ACTION_HEADER);
        } else {
            this.eventsHeaders.splice(this.eventsHeaders.length - 1, 1);
        }
    }

    @Watch("eventsPagination")
    private paginationChange(): void {
        this.localStorage.set("eventsPagination", this.eventsPagination);
    }

    private async onFutureEventsPanelStateChange(): Promise<void> {
        if (UiStateHelper.futureEventsChartPanel[0] === 1) {
            if (!this.eventsFutureResponse) {
                await this.loadFutureEvents();
            }
        }
    }

    private hideHintsPanel(): void {
        this.localStorage.set("eventsHintPanel", false);
        this.showHintPanel = false;
    }

    /**
     * Получаем дефолтный фильтр если в локал сторе ничего нет
     * Пользовательские события не грузим по умолчанию, пока пользователь сам явно их не выберет
     */
    private getDefaultFilter(): string[] {
        const defaultFilter: string[] = [];
        CalendarEventType.values().map((type: CalendarEventType) => {
            if (type !== CalendarEventType.USER) {
                defaultFilter.push(type.code);
            }
        });
        return defaultFilter;
    }

    @ShowProgress
    private async loadCalendarEvents(): Promise<void> {
        let calendarEvents: CalendarEvent[] = [];
        if (this.portfolio.portfolioParams.combinedFlag) {
            calendarEvents = await this.eventService.getCalendarEventsCombined(this.calendarRequestParams, this.currency, this.portfolio.portfolioParams.combinedIds);
        } else {
            calendarEvents = await this.eventService.getCalendarEvents(this.calendarRequestParams);
        }
        this.calendarEvents = this.getFilteredCalendarEvents(calendarEvents);
    }

    /**
     * Возвращает отфильтрованные данные календаря
     * @param calendarEvents события календаря
     */
    private getFilteredCalendarEvents(calendarEvents: CalendarEvent[]): CalendarParams {
        const filtered: CalendarParams = {};
        calendarEvents.forEach((e: CalendarEvent) => {
            (filtered[e.date] = filtered[e.date] || []).push(e);
        });
        return filtered;
    }

    /**
     * Проверяет, выбран ли данный тип события календаря
     * @param calendarEvent тип события календаря
     */
    private isCalendarTypeChecked(calendarEvent: string): boolean {
        return this.typeCalendarEvents.includes(calendarEvent);
    }

    /**
     * Изменение параметров фильтрации
     * @param calendarEvent тип события
     */
    private async changeFilter(calendarEvent: string): Promise<void> {
        const includes = this.typeCalendarEvents.includes(calendarEvent);
        if (!includes) {
            this.typeCalendarEvents.push(calendarEvent);
        } else {
            this.typeCalendarEvents.splice(this.typeCalendarEvents.indexOf(calendarEvent), 1);
        }
        this.localStorage.set<string[]>("calendarEvents", this.typeCalendarEvents);
        this.calendarRequestParams.calendarEventTypes = this.typeCalendarEvents.map(e => e.toUpperCase() as CalendarType);
        await this.loadCalendarEvents();
    }

    /**
     * Получаем дату начала месяца и дату конца месяца для отправки в апи
     * @param year год
     * @param month месяц
     */
    private setCalendarRequestParams(year: number, month: number): void {
        this.calendarRequestParams.start = DateUtils.startMonthDate(year, month);
        this.calendarRequestParams.end = DateUtils.endMonthDate(year, month);
    }

    /** Изменение месяца отображаемого в календаре */
    private async changeMonth(): Promise<void> {
        this.calendarMenu = false;
        this.setCalendarRequestParams(DateUtils.getYearDate(this.calendarStartDate), DateUtils.getMonthDate(this.calendarStartDate));
        await this.loadCalendarEvents();
    }

    private async loadEvents(): Promise<void> {
        if (this.portfolio.portfolioParams.combinedFlag) {
            this.eventsResponse = await this.eventService.getEventsCombined(this.currency, this.portfolio.portfolioParams.combinedIds);
        } else {
            this.eventsResponse = await this.eventService.getEvents(this.portfolio.id);
        }
    }

    /**
     * Загружает события за следующий год
     */
    private async loadFutureEvents(): Promise<void> {
        if (TariffUtils.isTariffExpired(this.clientInfo.user)) {
            return;
        }
        // todo подумать как от этого избавиться
        if (UiStateHelper.futureEventsChartPanel[0] === 0) {
            return;
        }
        if (this.portfolio.portfolioParams.combinedFlag) {
            this.eventsFutureResponse = await this.eventService.getFutureEventsCombined(this.currency, this.portfolio.portfolioParams.combinedIds);
        } else {
            this.eventsFutureResponse = await this.eventService.getFutureEvents(this.portfolio.id);
        }
        await this.doFutureEventsChartData();
    }

    private async doFutureEventsChartData(): Promise<void> {
        if (this.eventsFutureResponse) {
            this.futureEventsChartData = ChartUtils.doFutureEventsChartData(this.eventsFutureResponse.events);
        }
    }

    /** События */
    private get events(): ShareEvent[] {
        return this.eventsResponse ? this.eventsResponse.events : [];
    }

    /** Агрегированная информация по событиям */
    private get eventsAggregateInfo(): EventsAggregateInfo {
        return this.eventsResponse ? this.eventsResponse.eventsAggregateInfo : null;
    }

    /** Агрегированная информация по будущим событиям */
    private get eventsAggregateInfoFuture(): EventsAggregateInfo {
        return this.eventsFutureResponse ? this.eventsFutureResponse.eventsAggregateInfo : null;
    }

    private async loadDividendNews(): Promise<void> {
        if (this.portfolio.portfolioParams.combinedFlag) {
            this.dividendNews = await this.eventService.getDividendNewsCombined(this.currency, this.portfolio.portfolioParams.combinedIds);
        } else {
            this.dividendNews = await this.eventService.getDividendNews(this.portfolio.id);
        }
    }

    private async openTradeDialog(event: ShareEvent): Promise<void> {
        const operation = Operation.valueByName(event.type);
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: event.share,
            eventFields: {
                amount: event.cleanAmount,
                amountPerShare: event.amountPerShare,
                quantity: event.share?.shareType === ShareType.BOND ? new Decimal(event.quantity).abs().toString() : event.quantity,
                eventPeriod: event.period,
                eventDate: event.date,
                note: TradeUtils.eventNote(event),
                perOne: false,
            },
            operation,
            assetType: operation === Operation.DIVIDEND ? AssetType.STOCK : AssetType.BOND
        });
    }

    private async openTradeDialogForEvent(ticker: string, assetType: AssetType): Promise<void> {
        await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            ticker: ticker,
            operation: Operation.BUY,
            assetType: assetType
        });
    }

    private async openDialog(): Promise<void> {
        await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
    }

    private async confirmDeleteAllEvents(): Promise<void> {
        const result = await new ConfirmDialog().show("Вы уверены что хотите удалить все начисления?");
        if (result === BtnReturn.YES) {
            await this.deleteAllEvents();
        }
    }

    @ShowProgress
    private async deleteAllEvents(): Promise<void> {
        await this.eventService.deleteAllEvents(this.portfolio.id);
        await this.loadEvents();
        this.$snotify.info("Начисления успешно удалены");
    }

    @ShowProgress
    private async executeAllEventsWithoutMoney(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, false);
        await this.reloadPortfolio();
        this.$snotify.info("Начисления успешно исполнены");
    }

    @ShowProgress
    private async executeAllEvents(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, true);
        await this.reloadPortfolio();
        this.$snotify.info("Начисления успешно исполнены");
    }

    @ShowProgress
    private async rejectEvent(event: ShareEvent): Promise<void> {
        await this.eventService.rejectEvent({
            date: event.date,
            totalAmount: event.totalAmount,
            period: event.period,
            portfolioId: event.portfolioId,
            quantity: event.quantity,
            shareId: event.share.id,
            type: event.type
        });
        await this.loadEvents();
        this.$snotify.info("Начисление удалено");
    }

    private get emptyTableText(): string {
        return this.portfolio.overview.totalTradesCount !== 0 ? "Новых событий по вашим бумагам еще не появилось" :
            "Добавьте свою первую сделку чтобы мы могли предложить вам события";
    }

    private customSortEvents(items: ShareEvent[], index: string, isDesc: boolean): ShareEvent[] {
        return SortUtils.customSortEvents(items, index, isDesc);
    }

    private customSortNews(items: DividendNewsItem[], index: string, isDesc: boolean): DividendNewsItem[] {
        return SortUtils.customSortNews(items, index, isDesc);
    }

    private get currencyClass(): string {
        return this.portfolio.portfolioParams.viewCurrency.toLowerCase();
    }

    private get currency(): string {
        return this.portfolio.portfolioParams.viewCurrency;
    }

    /**
     * Возвращает отформатированную дату
     */
    private get formattedDate(): string {
        return DateUtils.formatMonthYear(this.calendarStartDate);
    }

    /**
     * Возвращает признак что настроен фильтр
     */
    private get customFilter(): boolean {
        return this.typeCalendarEvents.length !== CalendarEventType.values().length;
    }

    private get allowActions(): boolean {
        return !this.portfolio.portfolioParams.combinedFlag;
    }
}
