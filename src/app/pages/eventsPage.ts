import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {ConfirmDialog} from "../components/dialogs/confirmDialog";
import {ShowProgress} from "../platform/decorators/showProgress";
import {BtnReturn} from "../platform/dialogs/customDialog";
import {Storage} from "../platform/services/storage";
import {CalendarDateParams, CalendarEvent, CalendarEventType, CalendarParams, DividendNewsItem, EventsAggregateInfo, EventService, ShareEvent} from "../services/eventService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio, TableHeader} from "../types/types";
import {DateUtils} from "../utils/dateUtils";
import {SortUtils} from "../utils/sortUtils";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid class="events">
            <v-card flat class="header-first-card">
                <v-card-title class="header-first-card__wrapper-title">
                    <div class="section-title header-first-card__title-text">События</div>
                    <v-spacer></v-spacer>
                    <v-btn @click.stop="openDialog" class="primary">
                        Добавить событие
                    </v-btn>
                </v-card-title>
            </v-card>

            <v-card class="events__card" flat>
                <v-card-title class="events__card-title">
                    Новые события
                    <v-spacer></v-spacer>
                    <v-menu v-if="events.length" transition="slide-y-transition" bottom left>
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
                                <v-list-tile-title>
                                    Удалить все
                                </v-list-tile-title>
                            </v-list-tile>
                        </v-list>
                    </v-menu>
                </v-card-title>

                <v-card-text>
                    <div class="eventsAggregateInfo" v-if="eventsAggregateInfo">
                        <span class="item-block">
                            <span class="item-block__eventLegend dividend"/>
                            <span :class="['item-block__amount', currency]">Дивиденды {{ eventsAggregateInfo.totalDividendsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="item-block__eventLegend coupon"/>
                            <span :class="['item-block__amount', currency]">Купоны {{ eventsAggregateInfo.totalCouponsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="item-block__eventLegend amortization"/>
                            <span :class="['item-block__amount', currency]">Амортизация {{ eventsAggregateInfo.totalAmortizationsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="item-block__eventLegend repayment"/>
                            <span :class="['item-block__amount', currency]">Погашения {{ eventsAggregateInfo.totalRepaymentsAmount | number }} </span>
                        </span>

                        <span class="item-block total">
                            <span :class="['item-block__amount', currency]">Всего выплат {{ eventsAggregateInfo.totalAmount | number }} </span>
                        </span>
                    </div>

                    <v-data-table v-if="events.length" :headers="eventsHeaders" :items="events" item-key="id" :custom-sort="customSortEvents"
                                  class="events-table" hide-actions must-sort>
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
                                <td class="justify-end layout pr-3" @click.stop>
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
                                                <v-list-tile-title>
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

            <v-card style="margin-top: 30px" flat>
                <v-card-title class="events__card-title">Дивидендные новости</v-card-title>

                <v-card-text>
                    <v-data-table v-if="dividendNews.length" :headers="dividendNewsHeaders" :items="dividendNews" item-key="id" :custom-sort="customSortNews"
                                  class="dividend-news-table events-table" hide-actions must-sort>
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
                                    ({{ props.item.yield }} %)
                                </td>
                                <td class="text-xs-center pr-3">{{ props.item.source }}</td>
                            </tr>
                        </template>
                    </v-data-table>

                    <div v-else class="dividend-news-table__empty">Дивидендных новостей по вашим бумагам нет</div>
                </v-card-text>
            </v-card>

            <v-card class="events__card" flat style="margin-top: 30px">
                <v-card-title class="events__card-title">
                    <v-layout class="px-0 py-0" align-center>
                        Календарь событий
                        <v-spacer></v-spacer>
                        <div class="import-wrapper-content pr-1">
                            <span v-if="customFilter" class="event-calendar-active-filter" title="Настроен фильтр"></span>
                            <v-menu content-class="dialog-setings-menu" transition="slide-y-transition" nudge-bottom="36" left bottom class="setings-menu my-0 mx-0"
                                    :close-on-content-click="false" min-width="255">
                                <v-btn class="btn" slot="activator">
                                    Настройки
                                </v-btn>
                                <v-list dense>
                                    <div class="title-setings">
                                        Тип события
                                    </div>
                                    <v-flex>
                                        <v-checkbox v-for="event in calendarEventsTypes.values()" :input-value="isCalendarTypeChecked(event.code)"
                                                    @change="changeFilter(event.code)" :key="event.code" hide-details class="checkbox-setings">
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
                        <v-calendar :now="today" :value="calendarRequestParams.start" color="primary" locale="ru">
                            <template v-slot:day="{ date }">
                                <vue-scroll>
                                    <div class="wrap-list-events">
                                        <div>
                                            <div v-for="event in calendarEvents[date]" :key="event.title">
                                                <v-menu max-width="267" right nudge-right="150" content-class="fs13 info-about-event" :close-on-content-click="false">
                                                    <template v-slot:activator="{ on }">
                                                        <div v-on="on" :class="[event.styleClass, 'fs13', 'calendar-events-title', 'pl-2', 'selectable']">
                                                            {{ event.typeDescription }}
                                                        </div>
                                                    </template>
                                                    <v-card class="selectable" flat>
                                                        {{ event.description }}
                                                    </v-card>
                                                </v-menu>
                                            </div>
                                        </div>
                                    </div>
                                </vue-scroll>
                            </template>
                        </v-calendar>
                    </v-sheet>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class EventsPage extends UI {
    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: number) => Promise<void>;
    @Inject
    private eventService: EventService;
    @Inject
    private localStorage: Storage;
    /** События */
    private events: ShareEvent[] = [];
    /** Агрегированная информация по событиям */
    private eventsAggregateInfo: EventsAggregateInfo = null;
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
        {text: "", value: "actions", align: "center", width: "25", sortable: false}
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
    private calendarRequestParams: CalendarDateParams = {start: "", end: ""};
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

    /**
     * Инициализация данных
     * @inheritDoc
     */
    @ShowProgress
    async created(): Promise<void> {
        this.setCalendarRequestParams(DateUtils.getYearDate(this.calendarStartDate), DateUtils.getMonthDate(this.calendarStartDate));
        const eventsFromStorage = this.localStorage.get<string[]>("calendarEvents", null);
        this.typeCalendarEvents = eventsFromStorage ? eventsFromStorage : this.getDefaultFilter();
        await this.loadEvents();
        await this.loadDividendNews();
        await this.loadCalendarEvents();
    }

    @Watch("portfolio")
    @ShowProgress
    private async onPortfolioChange(): Promise<void> {
        await this.loadEvents();
        await this.loadDividendNews();
    }

    /** Получаем дефолтный фильтр если в локал сторе ничего нет */
    private getDefaultFilter(): string[] {
        const defaultFilter: string[] = [];
        CalendarEventType.values().forEach((element: CalendarEventType) => {
            if (!defaultFilter.includes(element.code)) {
                defaultFilter.push(element.code);
            }
        });
        return defaultFilter;
    }

    @ShowProgress
    private async loadCalendarEvents(): Promise<void> {
        const calendarEvents: CalendarEvent[] = await this.eventService.getCalendarEvents(this.calendarRequestParams);
        this.calendarEvents = this.getFilteredCalendarEvents(calendarEvents);
    }

    /**
     * Возвращает отфильтрованные данные календаря
     * @param calendarEvents события календаря
     */
    private getFilteredCalendarEvents(calendarEvents: CalendarEvent[]): CalendarParams {
        const filtered: CalendarParams = {};
        calendarEvents.forEach((e: CalendarEvent) => {
            if (this.typeCalendarEvents.includes(e.styleClass)) {
                (filtered[e.startDate] = filtered[e.startDate] || []).push(e);
            }
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
        const eventsResponse = await this.eventService.getEvents(this.portfolio.id);
        this.events = eventsResponse.events;
        this.eventsAggregateInfo = eventsResponse.eventsAggregateInfo;
    }

    private async loadDividendNews(): Promise<void> {
        this.dividendNews = await this.eventService.getDividendNews(this.portfolio.id);
    }

    private async openTradeDialog(event: ShareEvent): Promise<void> {
        const operation = Operation.valueByName(event.type);
        const result = await new AddTradeDialog().show({
            store: this.$store.state[StoreType.MAIN],
            router: this.$router,
            share: event.share,
            eventFields: {
                amount: event.cleanAmountPerShare || event.amountPerShare,
                quantity: event.quantity,
                eventPeriod: event.period,
                eventDate: event.date,
                note: TradeUtils.eventNote(event),
                perOne: true,
            },
            operation,
            assetType: operation === Operation.DIVIDEND ? AssetType.STOCK : AssetType.BOND
        });
        if (result) {
            // только перезагружаем портфель, вотчер перезагрузит события и дивиденды
            await this.reloadPortfolio(this.portfolio.id);
        }
    }

    private async openDialog(): Promise<void> {
        const result = await new AddTradeDialog().show({store: this.$store.state[StoreType.MAIN], router: this.$router});
        if (result) {
            await this.reloadPortfolio(this.portfolio.id);
        }
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
        await this.reloadPortfolio(this.portfolio.id);
        this.$snotify.info("Начисления успешно исполнены");
    }

    @ShowProgress
    private async executeAllEvents(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, true);
        await this.reloadPortfolio(this.portfolio.id);
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

    private get currency(): string {
        return this.portfolio.portfolioParams.viewCurrency.toLowerCase();
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
}
