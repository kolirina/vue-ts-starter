import {Inject} from "typescript-ioc";
import Component from "vue-class-component";
import {Watch} from "vue-property-decorator";
import {namespace} from "vuex-class/lib/bindings";
import {UI} from "../app/ui";
import {AddTradeDialog} from "../components/dialogs/addTradeDialog";
import {ConfirmDialog} from "../components/dialogs/confirmDialog";
import {BtnReturn} from "../components/dialogs/customDialog";
import {CatchErrors} from "../platform/decorators/catchErrors";
import {ShowProgress} from "../platform/decorators/showProgress";
import {EventsAggregateInfo, EventService, ShareEvent} from "../services/eventService";
import {AssetType} from "../types/assetType";
import {Operation} from "../types/operation";
import {Portfolio, TableHeader} from "../types/types";
import {TradeUtils} from "../utils/tradeUtils";
import {MutationType} from "../vuex/mutationType";
import {StoreType} from "../vuex/storeType";

const MainStore = namespace(StoreType.MAIN);

@Component({
    // language=Vue
    template: `
        <v-container v-if="portfolio" fluid>
            <v-card>
                <v-card-text>
                    <div class="margB30">
                        Начисленные на Ваши бумаги дивиденды, купоны, амортизация и погашения будут автоматически появляться в разделе "Новые события".
                        Отклоните событие или исполните его. Исполненное событие будет отображаться в отдельной таблице.

                        Если вы не нашли выплаты по своим бумагам, то это означает, что информацию мы пока не получили.
                        При необходимости Вы можете <a @click="openDialog">внести выплату вручную</a>.
                    </div>
                    <div v-if="eventsAggregateInfo" class="eventsControls">
                        <v-btn color="primary" @click.native="confirmDeleteAllEvents" dark small>
                            Удалить все
                        </v-btn>
                        <v-btn color="primary" @click.native="executeAllEvents" dark small>
                            Исполнить все
                        </v-btn>
                        <div>
                            <v-btn color="primary" @click.native="executeAllEventsWithoutMoney" dark small>
                                Исполнить все без зачисления денег
                            </v-btn>
                            <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                <sup class="custom-tooltip" slot="activator">
                                    <v-icon>fas fa-info-circle</v-icon>
                                </sup>
                                <span>
                                    Полезно, если вы хотите быстро учесть все начисления в доходности портфеля, а текущий баланс укажете самостоятельно.
                                </span>
                            </v-tooltip>
                        </div>
                    </div>

                    <div class="eventsAggregateInfo" v-if="eventsAggregateInfo">
                        <span class="item-block">
                            <span class="eventLegend dividend"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Дивиденды {{ eventsAggregateInfo.totalDividendsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend coupon"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Купоны {{ eventsAggregateInfo.totalCouponsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend amortization"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Амортизация {{ eventsAggregateInfo.totalAmortizationsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend repayment"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Поагешния {{ eventsAggregateInfo.totalRepaymentsAmount | number }} </span>
                        </span>

                        <span class="item-block">
                            <span class="eventLegend custom"/>
                            <span :class="portfolio.portfolioParams.viewCurrency.toLowerCase()">Всего выплат {{ eventsAggregateInfo.totalAmount | number }} </span>
                        </span>
                    </div>

                    <v-data-table :headers="headers" :items="events" item-key="id" :custom-sort="customSort" hide-actions>
                        <template slot="items" slot-scope="props">
                            <tr class="selectable">
                                <td>{{ props.item.label }}</td>
                                <td>{{ props.item.share.shortname }}</td>
                                <td>
                                    <stock-link v-if="props.item.type === 'DIVIDEND'" :ticker="props.item.share.ticker"></stock-link>

                                    <bond-link v-if="props.item.type !== 'DIVIDEND'" :ticker="props.item.share.ticker"></bond-link>
                                </td>
                                <td class="text-xs-center">{{ props.item.date | date }}</td>
                                <td class="text-xs-right">{{ props.item.period }}</td>
                                <td class="text-xs-right ii-number-cell">{{ props.item.cleanAmount | amount(true) }}</td>
                                <td class="justify-center layout px-0">
                                    <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                        <v-btn slot="activator" color="primary" @click="openTradeDialog(props.item)" flat icon dark>
                                            <v-icon color="primary" small>fas fa-check</v-icon>
                                        </v-btn>
                                        <span>
                                            Нажмите для исполнения события.
                                        </span>
                                    </v-tooltip>

                                    <v-tooltip content-class="custom-tooltip-wrap" :max-width="250" top>
                                        <v-btn slot="activator" color="primary" flat icon dark>
                                            <v-icon color="primary" small>fas fa-trash-alt</v-icon>
                                        </v-btn>
                                        <span>
                                            Нажмите для отмены события.
                                        </span>
                                    </v-tooltip>
                                </td>
                            </tr>
                        </template>

                        <template slot="no-data">
                            <v-alert :value="true" color="info" icon="info">
                                {{ emptyTableText }}
                            </v-alert>
                        </template>
                    </v-data-table>
                </v-card-text>
            </v-card>
        </v-container>
    `
})
export class EventsPage extends UI {

    @MainStore.Getter
    private portfolio: Portfolio;
    @MainStore.Action(MutationType.RELOAD_PORTFOLIO)
    private reloadPortfolio: (id: string) => Promise<void>;
    @Inject
    private eventService: EventService;
    /** События */
    private events: ShareEvent[] = [];
    private eventsAggregateInfo: EventsAggregateInfo = null;
    /** Зголовки таблицы */
    private headers: TableHeader[] = [
        {text: "Событие", align: "left", value: "label", width: "100"},
        {text: "Компания", align: "left", value: "shortname"},
        {text: "Тикер/ISIN", align: "left", value: "ticker", width: "100"},
        {text: "Дата выплаты", align: "center", value: "date", width: "50"},
        {text: "Период", align: "center", value: "period", sortable: false, width: "100"},
        {text: "Начислено", align: "right", value: "cleanAmount", width: "120"},
        {text: "Действия", value: "", align: "center", width: "30", sortable: false}

    ];

    /**
     * Инициализация данных
     * @inheritDoc
     */
    async created(): Promise<void> {
        await this.loadEvents();
    }

    @Watch("portfolio")
    private async onPortfolioChange(): Promise<void> {
        await this.loadEvents();
    }

    @CatchErrors
    @ShowProgress
    private async loadEvents(): Promise<void> {
        const eventsResponse = await this.eventService.getEvents(this.portfolio.id);
        this.events = eventsResponse.events;
        this.eventsAggregateInfo = eventsResponse.eventsAggregateInfo;
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
                note: TradeUtils.eventNote(event),
                perOne: true,
            },
            operation,
            assetType: operation === Operation.DIVIDEND ? AssetType.STOCK : AssetType.BOND
        });
        if (result) {
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
            await this.eventService.deleteAllEvents(this.portfolio.id);
            await this.loadEvents();
            this.$snotify.info("Начисления успешно удалены");
        }
    }

    private async executeAllEventsWithoutMoney(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, false);
        await this.loadEvents();
        this.$snotify.info("Начисления успешно исполнены");
    }

    private async executeAllEvents(): Promise<void> {
        await this.eventService.executeAllEvents(this.portfolio.id, true);
        await this.loadEvents();
        this.$snotify.info("Начисления успешно исполнены");
    }

    private get emptyTableText(): string {
        return this.portfolio.overview.totalTradesCount !== 0 ? "Новых событий по вашим бумагам еще не появилось" :
            "Добавьте свою первую сделку чтобы мы могли предложить вам события";
    }

    private customSort(items: ShareEvent[], index: string, isDesc: boolean): ShareEvent[] {
        items.sort((a: ShareEvent, b: ShareEvent): number => {
            if (index === "ticker") {
                if (!isDesc) {
                    return a.share.ticker.localeCompare(b.share.ticker);
                } else {
                    return b.share.ticker.localeCompare(a.share.ticker);
                }
            } else {
                if (!isDesc) {
                    return (a as any)[index] < (b as any)[index] ? -1 : 1;
                } else {
                    return (b as any)[index] < (a as any)[index] ? -1 : 1;
                }
            }
        });
        return items;
    }
}
